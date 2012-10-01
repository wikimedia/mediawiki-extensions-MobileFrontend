<?php

class ExtMobileFrontend extends ContextSource {

	protected $wsLoginToken = '';
	protected $wsLoginFormAction = '';
	protected $zeroRatedBanner;

	public function __construct( IContextSource $context ) {
		global $wgMFConfigProperties;
		$this->setContext( $context );
		$this->setPropertiesFromArray( $wgMFConfigProperties );
	}

	public function attachHooks() {
		global $wgHooks;
		$wgHooks['RequestContextCreateSkin'][] = array( &$this, 'requestContextCreateSkin' );
		$wgHooks['BeforePageRedirect'][] = array( &$this, 'beforePageRedirect' );
		$wgHooks['SkinTemplateOutputPageBeforeExec'][] = array( &$this, 'addMobileFooter' );
		$wgHooks['TestCanonicalRedirect'][] = array( &$this, 'testCanonicalRedirect' );
		$wgHooks['ResourceLoaderTestModules'][] = array( &$this, 'addTestModules' );
		$wgHooks['GetCacheVaryCookies'][] = array( &$this, 'getCacheVaryCookies' );
		$wgHooks['ResourceLoaderRegisterModules'][] = array( &$this, 'resourceLoaderRegisterModules' );
		$wgHooks['ResourceLoaderGetConfigVars'][] = array( &$this, 'resourceLoaderGetConfigVars' );
	}

	/**
	 * RequestContextCreateSkin hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RequestContextCreateSkin
	 *
	 * @param $context IContextSource
	 * @param $skin Skin
	 * @return bool
	 */
	public function requestContextCreateSkin( $context, &$skin ) {
		global $wgMFEnableDesktopResources;

		// check whether or not the user has requested to toggle their view
		$context = MobileContext::singleton();
		$context->checkToggleView();

		if ( !$context->shouldDisplayMobileView() ) {
			// add any necessary resources for desktop view, if enabled
			if ( $wgMFEnableDesktopResources ) {
				$out = $this->getOutput();
				$out->addModules( 'mobile.desktop' );
			}
			return true;
		}

		$skin = SkinMobile::factory( $this );
		return false;
	}

	/**
	 * Set object properties based on an associative array
	 * @param $properties array
	 */
	public function setPropertiesFromArray( array $properties ) {
		foreach ( $properties as $prop => $val ) {
			if ( property_exists( $this, $prop ) ) {
				$reflectionProperty = new ReflectionProperty( 'ExtMobileFrontend', $prop );
				if ( $reflectionProperty->isStatic() ) {
					self::$ { $prop } = $val;
				} else {
					$this->$prop = $val;
				}
			}
		}
	}

	/**
	 * GetCacheVaryCookies hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetCacheVaryCookies
	 *
	 * @param $out OutputPage
	 * @param $cookies array
	 * @return bool
	 */
	public function getCacheVaryCookies( $out, &$cookies ) {
		$cookies[] = 'mf_useformat';
		return true;
	}

	/**
	 * @return string
	 */
	public function getZeroRatedBanner() {
		$zeroRatedBanner = $this->zeroRatedBanner ? str_replace( 'display:none;', '', $this->zeroRatedBanner ) : '';

		if ( $zeroRatedBanner ) {
			if ( strstr( $zeroRatedBanner, 'id="zero-rated-banner"><span' ) ) {
				$zeroRatedBanner = str_replace( 'id="zero-rated-banner"><span', 'id="zero-rated-banner"><span', $zeroRatedBanner );
			}
		}
		return $zeroRatedBanner;
	}

	/**
	 * Work out the site and language name from a database name
	 * @param $site string
	 * @param $lang string
	 * @return string
	 */
	protected function getSite( &$site, &$lang ) {
		global $wgConf;
		wfProfileIn( __METHOD__ );
		$dbr = wfGetDB( DB_SLAVE );
		$dbName = $dbr->getDBname();
		list( $site, $lang ) = $wgConf->siteFromDB( $dbName );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * TestCanonicalRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/TestCanonicalRedirect
	 *
	 * @param $request WebRequest
	 * @param $title Title
	 * @param $output OutputPage
	 * @return bool
	 * @throws HttpError
	 */
	public function testCanonicalRedirect( $request, $title, $output ) {
		global $wgUsePathInfo;
		$context = MobileContext::singleton();
		if ( !$context->shouldDisplayMobileView() ) {
			return true; // Let the redirect happen
		} else {
			if ( $title->getNamespace() == NS_SPECIAL ) {
				list( $name, $subpage ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
				if ( $name ) {
					$title = SpecialPage::getTitleFor( $name, $subpage );
				}
			}
			$targetUrl = wfExpandUrl( $title->getFullURL(), PROTO_CURRENT );
			// Redirect to canonical url, make it a 301 to allow caching
			if ( $targetUrl == $request->getFullRequestURL() ) {
				$message = "Redirect loop detected!\n\n" .
					"This means the wiki got confused about what page was " .
					"requested; this sometimes happens when moving a wiki " .
					"to a new server or changing the server configuration.\n\n";

				if ( $wgUsePathInfo ) {
					$message .= "The wiki is trying to interpret the page " .
						"title from the URL path portion (PATH_INFO), which " .
						"sometimes fails depending on the web server. Try " .
						"setting \"\$wgUsePathInfo = false;\" in your " .
						"LocalSettings.php, or check that \$wgArticlePath " .
						"is correct.";
				} else {
					$message .= "Your web server was detected as possibly not " .
						"supporting URL path components (PATH_INFO) correctly; " .
						"check your LocalSettings.php for a customized " .
						"\$wgArticlePath setting and/or toggle \$wgUsePathInfo " .
						"to true.";
				}
				throw new HttpError( 500, $message );
			} else {
				$targetUrl = $context->getMobileUrl( $targetUrl );
				$output->setSquidMaxage( 1200 );
				$output->redirect( $targetUrl, '301' );
			}
			return false; // Prevent the redirect from occurring
		}
	}

	/**
	 * SkinTemplateOutputPageBeforeExec hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateOutputPageBeforeExec
	 *
	 * @param $obj Article
	 * @param $tpl QuickTemplate
	 * @return bool
	 */
	public function addMobileFooter( &$obj, &$tpl ) {
		wfProfileIn( __METHOD__ );

		$title = $obj->getTitle();
		$isSpecial = $title->isSpecialPage();

		if ( ! $isSpecial ) {
			$footerlinks = $tpl->data['footerlinks'];
			$mobileViewUrl = $this->getRequest()->appendQuery( 'mobileaction=toggle_view_mobile' );

			$mobileViewUrl = MobileContext::singleton()->getMobileUrl( wfExpandUrl( $mobileViewUrl ) );
			$link = Html::element( 'a',
				array( 'href' => $mobileViewUrl, 'class' => 'noprint stopMobileRedirectToggle' ),
				$this->msg( 'mobile-frontend-view' )->text()
			);
			$tpl->set( 'mobileview', $link );
			$footerlinks['places'][] = 'mobileview';
			$tpl->set( 'footerlinks', $footerlinks );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * BeforePageRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageRedirect
	 *
	 * Ensures URLs are handled properly for select special pages.
	 * @param $out OutputPage
	 * @param $redirect
	 * @param $code
	 * @return bool
	 */
	public function beforePageRedirect( $out, &$redirect, &$code ) {
		wfProfileIn( __METHOD__ );

		$context = MobileContext::singleton();
		$shouldDisplayMobileView = $context->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			wfProfileOut( __METHOD__ );
			return true;
		}

		if ( $out->getTitle()->isSpecial( 'Userlogin' ) ) {
			$forceHttps = true;
			$redirect = $context->getMobileUrl( $redirect, $forceHttps );
		} else if ( $out->getTitle()->isSpecial( 'Randompage' ) ||
				$out->getTitle()->isSpecial( 'Search' ) ) {
			$redirect = $context->getMobileUrl( $redirect );
		}

		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $out OutputPage
	 * @return bool: Whether processing should be continued
	 */
	protected function beforePageDisplay( $out ) {
		wfProfileIn( __METHOD__ );

		$request = $this->getRequest();
		$context = MobileContext::singleton();
		$mobileAction = $context->getMobileAction();

		$bcRedirects = array(
			'opt_in_mobile_site' => 'BetaOptIn',
			'opt_out_mobile_site' => 'BetaOptOut',
		);
		if ( isset( $bcRedirects[$mobileAction] ) ) {
			$location = SpecialMobileOptions::getUrl( $bcRedirects[$mobileAction], null, true );
			$request->response()->header( 'Location: ' . wfExpandUrl( $location ) );
			return false;
		}

		$context->checkUserLoggedIn();

		$this->setDefaultLogo();

		$this->disableCaching();
		$this->sendXDeviceVaryHeader();

		if ( $this->getTitle()->isSpecial( 'Userlogin' ) ) {
			$this->wsLoginToken = $request->getSessionData( 'wsLoginToken' );
			$q = array( 'action' => 'submitlogin', 'type' => 'login' );
			$returnToVal = $request->getVal( 'returnto' );

			if ( $returnToVal ) {
				$q['returnto'] = $returnToVal;
			}

			$this->wsLoginFormAction = $this->getTitle()->getLocalURL( $q );
		}

		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * Special-case processing for pages
	 * @param MobileFormatter $mf
	 * @return string
	 */
	protected  function doSpecialCases( MobileFormatter $mf ) {
		$result = '';
		wfProfileIn( __METHOD__ );
		if ( $this->getTitle()->isSpecial( 'Userlogin' ) ) {
			$userlogin = $mf->getDoc()->getElementById( 'userloginForm' );

			if ( $userlogin && get_class( $userlogin ) === 'DOMElement' ) {
				$result = $this->renderLogin();
			}
		}
		wfProfileOut( __METHOD__ );
		return $result;
	}

	public static function parseContentFormat( $format ) {
		if ( $format === 'wml' ) {
			return 'WML';
		} elseif ( $format === 'html' ) {
			return 'HTML';
		}
		if ( $format === 'mobile-wap' ) {
			return 'WML';
		}
		return 'HTML';
	}

	/**
	 * Disables caching if the request is coming from a trusted proxy
	 * @return bool
	 */
	private function disableCaching() {
		wfProfileIn( __METHOD__ );

		// Fetch the REMOTE_ADDR and check if it's a trusted proxy.
		// Is this enough, or should we actually step through the entire
		// X-FORWARDED-FOR chain?
		if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = IP::canonicalize( $_SERVER['REMOTE_ADDR'] );
		} else {
			$ip = null;
		}

		/**
		 * Compatibility with potentially new function wfIsConfiguredProxy()
		 * wfIsConfiguredProxy() checks an IP against the list of configured
		 * Squid servers and currently only exists in trunk.
		 * wfIsTrustedProxy() does the same, but also exposes a hook that is
		 * used on the WMF cluster to check and see if an IP address matches
		 * against a list of approved open proxies, which we don't actually
		 * care about.
		 */
		$trustedProxyCheckFunction = ( MFCompatCheck::checkWfIsConfiguredProxy() ) ? 'wfIsConfiguredProxy' : 'wfIsTrustedProxy';
		$request = $this->getRequest();
		if ( $trustedProxyCheckFunction( $ip ) ) {
			$request->response()->header( 'Cache-Control: no-cache, must-revalidate' );
			$request->response()->header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' );
			$request->response()->header( 'Pragma: no-cache' );
		}

		wfProfileOut( __METHOD__ );
		return true;
	}

	private function sendXDeviceVaryHeader() {
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$xDevice = MobileContext::singleton()->getXDevice();
		if ( $xDevice !== '' ) {
			$this->getRequest()->response()->header( "X-Device: {$xDevice}" );
			$out->addVaryHeader( 'X-Device' );
		}
		$out->addVaryHeader( 'Cookie' );
		$out->addVaryHeader( 'X-Carrier' );
		$out->addVaryHeader( 'X-Subdomain' );
		$out->addVaryHeader( 'X-Images' );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @return string
	 */
	public function renderLogin() {
		wfProfileIn( __METHOD__ );
		$form = Html::openElement( 'div', array( 'id' => 'userloginForm' ) ) .
			Html::openElement( 'form',
				array( 'name' => 'userlogin',
					'method' => 'post',
					'action' => $this->wsLoginFormAction ) ) .
			Html::openElement( 'table',
				array( 'class' => 'user-login' ) ) .
			Html::openElement( 'tbody' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-label' ) ) .
			Html::element( 'label',
				array( 'for' => 'wpName1' ), wfMessage( 'mobile-frontend-username' )->text() ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td' ) .
			Html::input( 'wpName', null, 'text',
				array( 'class' => 'loginText',
					'id' => 'wpName1',
					'tabindex' => '1',
					'size' => '20',
					'required' ) ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-label' ) ) .
			Html::element( 'label',
				array( 'for' => 'wpPassword1' ), wfMessage( 'mobile-frontend-password' )->text() ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-input' ) ) .
			Html::input( 'wpPassword', null, 'password',
				array( 'class' => 'loginPassword',
					'id' => 'wpPassword1',
					'tabindex' => '2',
					'size' => '20' ) ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::element( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-submit' ) ) .
			Html::input( 'wpLoginAttempt', wfMessage( 'mobile-frontend-login' )->text(), 'submit',
				array( 'id' => 'wpLoginAttempt',
					'tabindex' => '3' ) ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::closeElement( 'tbody' ) .
			Html::closeElement( 'table' ) .
			Html::input( 'wpLoginToken', $this->wsLoginToken, 'hidden' ) .
			Html::closeElement( 'form' ) .
			Html::closeElement( 'div' );

		wfProfileOut( __METHOD__ );
		return $form;
	}

	public function getDom( $html ) {
		wfProfileIn( __METHOD__ );
		libxml_use_internal_errors( true );
		$dom = new DOMDocument();
		$dom->loadHTML( $html );
		libxml_use_internal_errors( false );
		$dom->preserveWhiteSpace = false;
		$dom->strictErrorChecking = false;
		$dom->encoding = 'UTF-8';
		wfProfileOut( __METHOD__ );
		return $dom;
	}

	/**
	 * @param OutputPage $out
	 * @return string
	 */
	public function DOMParse( OutputPage $out ) {
		wfProfileIn( __METHOD__ );

		if ( !$this->beforePageDisplay( $out ) ) {
			return false;
		}
		$html = $out->getHTML();

		wfProfileIn( __METHOD__ . '-formatter-init' );
		$context = MobileContext::singleton();
		$wmlContext = $context->getContentFormat() == 'WML' ? new WmlContext( $context ) : null;
		$formatter = new MobileFormatter( MobileFormatter::wrapHTML( $html ), $this->getTitle(),
			$context->getContentFormat(), $wmlContext
		);
		$doc = $formatter->getDoc();
		wfProfileOut( __METHOD__ . '-formatter-init' );

		wfProfileIn( __METHOD__ . '-zero' );
		$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner' );

		if ( !$zeroRatedBannerElement ) {
			$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner-red' );
		}

		if ( $zeroRatedBannerElement ) {
			$this->zeroRatedBanner = $doc->saveXML( $zeroRatedBannerElement, LIBXML_NOEMPTYTAG );
		}
		wfProfileOut( __METHOD__ . '-zero' );

		$contentHtml = $this->doSpecialCases( $formatter );
		if ( $contentHtml ) {
			wfProfileOut( __METHOD__ );
			return $contentHtml;
		}

		if ( $context->getContentTransformations() ) {
			wfProfileIn( __METHOD__ . '-filter' );
			if ( $this->getTitle()->getNamespace() !== NS_FILE ) {
				$formatter->removeImages( $context->imagesDisabled() );
			}
			$formatter->whitelistIds( 'zero-language-search' );
			$formatter->filterContent();
			wfProfileOut( __METHOD__ . '-filter' );
		}

		wfProfileIn( __METHOD__ . '-getText' );
		$formatter->setIsMainPage( $this->getTitle()->isMainPage() );
		$device = $context->getDevice();
		if ( $context->getContentFormat() == 'HTML'
			&& $device['supports_javascript'] === true
			&& $this->getRequest()->getText( 'search' ) == '' )
		{
			$formatter->enableExpandableSections();
		}
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		if ( $this->getRequest()->getText( 'format' ) === 'json' ) {
			wfProfileIn( __METHOD__ . '-json' );
			wfDebugLog( 'json-hack', $this->getRequest()->getHeader( 'User-Agent' ) . "\n" );
			header( 'Content-Type: application/javascript' );
			header( 'Content-Disposition: attachment; filename="data.js";' );
			$json_data = array();
			$json_data['title'] = htmlspecialchars ( $this->getTitle()->getText() );
			$json_data['html'] = $contentHtml;

			$json = FormatJson::encode( $json_data );

			$callback = $this->getRequest()->getText( 'callback' );
			if ( !empty( $callback ) ) {
				$json = urlencode( htmlspecialchars( $callback ) ) . '(' . $json . ')';
			}
			echo $json;
			$contentHtml = false;
			wfProfileOut( __METHOD__ . '-json' );
		}

		wfProfileOut( __METHOD__ );
		return $contentHtml;
	}

	/**
	 * Sets up the default logo image used in mobile view if none is set
	 */
	public function setDefaultLogo() {
		global $wgMobileFrontendLogo, $wgExtensionAssetsPath, $wgMFCustomLogos;
		wfProfileIn( __METHOD__ );
		if ( $wgMobileFrontendLogo === false ) {
			$wgMobileFrontendLogo = $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/images/mw.png';
		}

		if ( MobileContext::singleton()->isBetaGroupMember() ) {
			$this->getSite( $site, $lang );
			if ( is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['site'] ) ) {
				if ( isset( $wgMFCustomLogos['site'] ) && $site == $wgMFCustomLogos['site'] ) {
					if ( isset( $wgMFCustomLogos['logo'] ) ) {
						$wgMobileFrontendLogo = $wgMFCustomLogos['logo'];
					}
				}
			}
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * ResourceLoaderTestModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderTestModules
	 *
	 * @param array $testModules
	 * @param ResourceLoader $resourceLoader
	 * @return bool
	 */
	public function addTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.mobilefrontend.tests'] = array(
			'scripts' => array( 'tests/js/fixtures.js', 'javascripts/application.js',
				'javascripts/mf-history.js',
				'tests/js/test_application.js',
				'javascripts/mf-navigation-legacy.js', 'tests/js/test_mf-navigation-legacy.js',
				'javascripts/beta_opensearch.js', 'tests/js/test_beta_opensearch.js',
				'javascripts/settings.js', 'tests/js/test_settings.js',
				'javascripts/banner.js', 'tests/js/test_banner.js',
				'javascripts/toggle.js', 'tests/js/test_toggle.js',
				'javascripts/references.js', 'tests/js/test_references.js',
				'javascripts/mf-watchlist.js', 'tests/js/test_mf-watchlist.js' ),
				'dependencies' => array( ),
				'localBasePath' => dirname( __FILE__ ),
				'remoteExtPath' => 'MobileFrontend',
		);
		return true;
	}

	/**
	 * ResourceLoaderRegisterModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderRegisterModules
	 *
	 * @param ResourceLoader $resourceLoader
	 * @return bool
	 */
	public function resourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		$detector = new DeviceDetection();
		foreach ( $detector->getCssFiles() as $file ) {
			$resourceLoader->register( "mobile.device.$file",
				array(
					'styles' => array( "stylesheets/{$file}.css" ),
					'localBasePath' => dirname( __DIR__ ),
					'remoteExtPath' => 'MobileFrontend',
				)
			);
		}
		return true;
	}

	public function resourceLoaderGetConfigVars( &$vars ) {
		global $wgMFStopRedirectCookieHost, $wgCookiePath;
		$vars['wgCookiePath'] = $wgCookiePath;
		$vars['wgMFStopRedirectCookieHost'] = MobileContext::singleton()->getStopMobileRedirectCookieDomain();
		return true;
	}
}

class MobileFrontendSiteModule extends ResourceLoaderSiteModule {
	protected function getPages( ResourceLoaderContext $context ) {
		global $wgMobileSiteResourceLoaderModule;
		return $wgMobileSiteResourceLoaderModule;
	}

	public function isRaw() {
		return true;
	}
}
