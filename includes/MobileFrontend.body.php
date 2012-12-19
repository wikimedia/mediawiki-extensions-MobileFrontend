<?php

class ExtMobileFrontend extends ContextSource {

	protected $zeroRatedBanner;

	public function __construct( IContextSource $context ) {
		global $wgMFConfigProperties;
		$this->setContext( $context );
		$this->setPropertiesFromArray( $wgMFConfigProperties );
	}

	public function attachHooks() {
		global $wgHooks;
		$wgHooks['RequestContextCreateSkin'][] = array( &$this, 'requestContextCreateSkin' );
		$wgHooks['SkinTemplateOutputPageBeforeExec'][] = array( &$this, 'addMobileFooter' );
		$wgHooks['BeforePageRedirect'][] = array( &$this, 'beforePageRedirect' );
		$wgHooks['ResourceLoaderTestModules'][] = array( &$this, 'addTestModules' );
		$wgHooks['GetCacheVaryCookies'][] = array( &$this, 'getCacheVaryCookies' );
		$wgHooks['ResourceLoaderRegisterModules'][] = array( &$this, 'resourceLoaderRegisterModules' );
		$wgHooks['ResourceLoaderGetConfigVars'][] = array( &$this, 'resourceLoaderGetConfigVars' );
		$wgHooks['UserLoginForm'][] = array( &$this, 'renderLogin' );
		$wgHooks['UserCreateForm'][] = array( &$this, 'renderAccountCreate' );
		$wgHooks['SpecialPage_initList'][] = array( &$this, 'onSpecialPage_initList' );
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
	 * SkinTemplateOutputPageBeforeExec hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateOutputPageBeforeExec
	 *
	 * Adds a link to view the current page in 'mobile view' to the desktop footer.
	 *
	 * @param $obj Article
	 * @param $tpl QuickTemplate
	 * @return bool
	 */
	public function addMobileFooter( &$obj, &$tpl ) {
		global $wgMobileUrlTemplate;
		wfProfileIn( __METHOD__ );

		$title = $obj->getTitle();
		$isSpecial = $title->isSpecialPage();

		if ( ! $isSpecial ) {
			$footerlinks = $tpl->data['footerlinks'];
			/**
			 * Adds query string to force mobile view if we're not using $wgMobileUrlTemplate
			 * This is to preserve pretty/canonical links for a happy cache where possible (eg WMF cluster)
			 */
			$queryString =  strlen( $wgMobileUrlTemplate ) ? '' : 'mobileaction=toggle_view_mobile';
			$mobileViewUrl = $title->getFullURL( $queryString );

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

		$redirect = $context->getMobileUrl( $redirect );

		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $out OutputPage
	 * @return bool: Whether processing should be continued
	 */
	protected function beforePageDisplay( $out ) {
		wfProfileIn( __METHOD__ );

		$context = MobileContext::singleton();
		$context->checkUserLoggedIn();

		$this->setDefaultLogo();

		$this->disableCaching();
		$this->sendXDeviceVaryHeader();

		wfProfileOut( __METHOD__ );
		return true;
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
	 * Invocation of hook UserLoginForm
	 * @param object Login form template object
	 * @return bool
	 */
	public function renderLogin( &$template ) {
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$template = new UserLoginMobileTemplate( $template );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * Invocation of hook UserCreateForm
	 * @param object Account creation form template object
	 * @return bool
	 */
	public function renderAccountCreate( &$template ) {
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			// to be used when we actually have account creation designs to manipulate the form
			$template = new UserAccountCreateMobileTemplate( $template );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param OutputPage $out
	 * @return string
	 */
	public function DOMParse( OutputPage $out, $removeSections ) {
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
		$formatter->enableRemovableSections( $removeSections );
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
		if ( $context->getContentFormat() == 'HTML'
			&& $this->getRequest()->getText( 'search' ) == '' )
		{
			$formatter->enableExpandableSections();
		}
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		if ( $this->getRequest()->getText( 'format' ) === 'json' ) {
			# There used to be an antiquated API
			# @todo: Remove in March 2013
			wfProfileIn( __METHOD__ . '-json' );
			wfDebugLog( 'json-hack', $this->getRequest()->getHeader( 'User-Agent' ) . "\n" );
			$this->getRequest()->response()->header( 'HTTP/1.1 404 Not Found' );
			$t = SpecialPage::getTitleFor( 'ApiSandbox' );
			$url = htmlentities( $t->getFullURL() );
			# Was used only on English Wikipedia, so assuming that ApiSandbox is present
			echo "<html><head><title>Not Found</title></head><body><h1>HTTP 404 Not Found</h1>This API has been deprecated.
			Use <a href='$url#action=mobileview'>our normal API</a>.</body></html>";
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
			$wgMobileFrontendLogo = $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/common/images/mw.png';
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
			'scripts' => array( 'tests/js/fixtures.js', 'javascripts/common/mf-application.js',
				'javascripts/common/jquery-shim.js', 'tests/js/test_jQueryShim.js',
				'javascripts/common/mf-history.js', 'tests/js/test_mf-history.js',
				'tests/js/test_application.js',
				'javascripts/modules/mf-search.js', 'tests/js/test_beta_opensearch.js',
				'javascripts/common/mf-settings.js', 'tests/js/test_settings.js',
				'javascripts/modules/mf-banner.js', 'tests/js/test_banner.js',
				'javascripts/modules/mf-toggle.js', 'tests/js/test_toggle.js',
				'javascripts/modules/mf-toggle-dynamic.js',
				'javascripts/actions/mf-edit.js', 'tests/js/test_mf-edit.js',
				'javascripts/common/mf-navigation.js',
				'javascripts/common/mf-notification.js',
				'javascripts/modules/mf-references.js', 'tests/js/test_references.js',
				'javascripts/modules/mf-watchlist.js', 'tests/js/test_mf-watchlist.js' ),
				'dependencies' => array( ),
				'localBasePath' => dirname( dirname( __FILE__ ) ),
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
					'styles' => array( "stylesheets/devices/{$file}.css" ),
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

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array &$list: list of special page classes
	 * @return boolean hook return value
	 */
	public function onSpecialPage_initList( &$list ) {
		if ( MobileContext::singleton()->shouldDisplayMobileView() ) {
			// Replace the standard watchlist view with our custom one
			$list['Watchlist'] = 'SpecialMobileWatchlist';
		}
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
