<?php

class ExtMobileFrontend extends ContextSource {


	public $isBetaGroupMember = false;

	protected $contentFormat = '';
	protected $format;
	protected $wsLoginToken = '';
	protected $wsLoginFormAction = '';
	protected $useFormatCookieName;

	protected $disableImages;
	protected $useFormat;
	protected $zeroRatedBanner;

	/**
	 * @var string xDevice header information
	 */
	private $xDevice;
	private $device;

	/**
	 * @var string MediaWiki 'action'
	 */
	protected $action;

	/**
	 * @var string
	 */
	protected $mobileAction;

	/**
	 * @var WmlContext
	 */
	private $wmlContext;

	private $forceMobileView = false;
	private $contentTransformations = true;

	public function __construct( IContextSource $context ) {
		global $wgMFConfigProperties;
		$this->setContext( $context );
		$this->wmlContext = new WmlContext();
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
		// check whether or not the user has requested to toggle their view
		$mobileAction = $this->getMobileAction();
		if ( $mobileAction == 'toggle_view_desktop' ) {
			$this->toggleView( 'desktop' );
		} elseif ( $mobileAction == 'toggle_view_mobile' ) {
			$this->toggleView( 'mobile' );
		}

		if ( !$this->shouldDisplayMobileView() ) {
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
	 * Gets the current device description
	 * @return array
	 */
	public function getDevice() {
		wfProfileIn( __METHOD__ );
		if ( $this->device ) {
			wfProfileOut( __METHOD__ );
			return $this->device;
		}
		$detector = new DeviceDetection();

		$xDevice = $this->getXDevice();
		if ( $xDevice ) {
			$formatName = $xDevice;
		} else {
			$userAgent = $_SERVER['HTTP_USER_AGENT'];
			$acceptHeader = isset( $_SERVER["HTTP_ACCEPT"] ) ? $_SERVER["HTTP_ACCEPT"] : '';
			$formatName = $detector->detectFormatName( $userAgent, $acceptHeader );
		}
		$this->device = $detector->getDevice( $formatName );

		wfProfileOut( __METHOD__ );
		return $this->device;
	}

	/**
	 * @return string
	 */
	public function getZeroRatedBanner() {
		$zeroRatedBanner = $this->zeroRatedBanner ? str_replace( 'style="display:none;"', '', $this->zeroRatedBanner ) : '';

		if ( $zeroRatedBanner ) {
			if ( strstr( $zeroRatedBanner, 'id="zero-rated-banner"><span' ) ) {
				$zeroRatedBanner = str_replace( 'id="zero-rated-banner"><span', 'id="zero-rated-banner"><span', $zeroRatedBanner );
			}
		}
		return $zeroRatedBanner;
	}

	/**
	 * @return string
	 */
	public function getContentFormat() {
		if ( $this->contentFormat ) {
			return $this->contentFormat;
		}
		// honor useformat=mobile-wap if it's set, otherwise determine by device
		$device = $this->getDevice();
		$viewFormat = ( $this->getUseFormat() == 'mobile-wap' ) ? 'mobile-wap' : $device['view_format'];
		$this->contentFormat = self::parseContentFormat( $viewFormat );
		return $this->contentFormat;
	}

	public function imagesDisabled() {
		return $this->disableImages;
	}

	/**
	 * Returns notice to be displayed at the top of page
	 * @return string
	 */
	public function getNotice() {
		return ''; // no notices ATM
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
	 * @param $value bool: Whether mobile view should always be enforced
	 */
	public function setForceMobileView( $value ) {
		$this->forceMobileView = $value;
	}

	/**
	 * @return bool: Whether mobile view should always be enforced
	 */
	public function getForceMobileView() {
		return $this->forceMobileView;
	}

	/**
	 * @param $value bool: Whether content should be transformed to better suit mobile devices
	 */
	public function setContentTransformations( $value ) {
		$this->contentTransformations = $value;
	}

	/**
	 * @return bool: Whether content should be transformed to better suit mobile devices
	 */
	public function getContentTransformations() {
		return $this->contentTransformations;
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
		if ( !$this->shouldDisplayMobileView() ) {
			return true; // Let the redirect happen
		} else {
			if ( $title->getNamespace() == NS_SPECIAL ) {
				list( $name, $subpage ) = SpecialPage::resolveAlias( $title->getDBkey() );
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
				$targetUrl = $this->getMobileUrl( $targetUrl );
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

			$mobileViewUrl = $this->getMobileUrl( wfExpandUrl( $mobileViewUrl ) );
			$link = Html::element( 'a',
				array( 'href' => $mobileViewUrl, 'class' => 'noprint' ),
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
	 * @param $url string
	 * @param $field string
	 * @return string
	 */
	private function removeQueryStringParameter( $url, $field ) {
		wfProfileIn( __METHOD__ );
		static $coreSupport;
		if ( !isset( $coreSupport ) ) {
			$coreSupport = MFCompatCheck::checkRemoveQueryString();
		}

		if ( $coreSupport ) {
			$queryString = $this->getRequest()->removeQueryValue( $field );
			$url = $this->getTitle()->getFullUrl( $queryString );
		} else {
			$url = preg_replace( '/(.*)(\?|&)' . $field . '=[^&]+?(&)(.*)/i', '$1$2$4', $url . '&' );
			$url = substr( $url, 0, -1 );
		}
		wfProfileOut( __METHOD__ );
		return $url;
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

		$shouldDisplayMobileView = $this->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			wfProfileOut( __METHOD__ );
			return true;
		}

		if ( $out->getTitle()->isSpecial( 'Userlogin' ) ) {
			$forceHttps = true;
			$redirect = $this->getMobileUrl( $redirect, $forceHttps );
		} else if ( $out->getTitle()->isSpecial( 'Randompage' ) ||
				$out->getTitle()->isSpecial( 'Search' ) ) {
			$redirect = $this->getMobileUrl( $redirect );
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
		$this->setWmlContextFormat();
		$mobileAction = $this->getMobileAction();

		$bcRedirects = array(
			'opt_in_mobile_site' => 'BetaOptIn',
			'opt_out_mobile_site' => 'BetaOptOut',
		);
		if ( isset( $bcRedirects[$mobileAction] ) ) {
			$location = SpecialMobileOptions::getUrl( $bcRedirects[$mobileAction], null, true );
			$request->response()->header( 'Location: ' . wfExpandUrl( $location ) );
			return false;
		}

		if ( $mobileAction == 'beta' ) {
			$this->isBetaGroupMember = true;
		}

		$this->disableImages = $request->getCookie( 'disableImages' );

		$this->format = $request->getText( 'format' );
		$this->wmlContext->setRequestedSegment( $request->getInt( 'seg', 0 ) );

		$this->checkUserStatus();
		$this->setDefaultLogo();

		$this->disableCaching();
		$this->sendXDeviceVaryHeader();
		$this->sendApplicationVersionVaryHeader();
		$this->checkUserLoggedIn();

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

	public function setWmlContextFormat() {
		$useFormat = $this->getUseFormat();
		if ( $useFormat ) {
			$this->wmlContext->setUseFormat( $useFormat );
		}
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
	 * @return bool
	 */
	private function checkUserLoggedIn() {
		global $wgCookieDomain, $wgCookiePrefix;
		wfProfileIn( __METHOD__ );
		$tempWgCookieDomain = $wgCookieDomain;
		$wgCookieDomain = $this->getBaseDomain();
		$tempWgCookiePrefix = $wgCookiePrefix;
		$wgCookiePrefix = '';

		$request = $this->getRequest();
		if ( $this->getUser()->isLoggedIn() ) {
			$request->response()->setcookie( 'mfsecure', '1', 0, '' );
		} else {
			$mfSecure = $request->getCookie( 'mfsecure', '' );
			if ( $mfSecure && $mfSecure == '1' ) {
				$request->response()->setcookie( 'mfsecure', '', 0, '' );
			}
		}

		$wgCookieDomain = $tempWgCookieDomain;
		$wgCookiePrefix = $tempWgCookiePrefix;
		wfProfileOut( __METHOD__ );
		return true;
	}

	public function checkUserStatus() {
		wfProfileIn( __METHOD__ );

		$optInCookie = $this->getOptInOutCookie();
		if ( !empty( $optInCookie ) &&
			$optInCookie == 1 ) {
			$this->isBetaGroupMember = true;
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $value string
	 * @return bool
	 */
	public function setOptInOutCookie( $value ) {
		global $wgCookieDomain, $wgCookiePrefix;
		wfProfileIn( __METHOD__ );
		if ( $value ) {
			wfIncrStats( 'mobile.opt_in_cookie_set' );
		}
		$tempWgCookieDomain = $wgCookieDomain;
		$wgCookieDomain = $this->getBaseDomain();
		$tempWgCookiePrefix = $wgCookiePrefix;
		$wgCookiePrefix = '';
		$this->getRequest()->response()->setcookie( 'optin', $value, 0, '' );
		$wgCookieDomain = $tempWgCookieDomain;
		$wgCookiePrefix = $tempWgCookiePrefix;
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @return Mixed
	 */
	private function getOptInOutCookie() {
		wfProfileIn( __METHOD__ );
		$optInCookie = $this->getRequest()->getCookie( 'optin', '' );
		wfProfileOut( __METHOD__ );
		return $optInCookie;
	}

	/**
	 * @return string
	 */
	public function getBaseDomain() {
		wfProfileIn( __METHOD__ );
		// Validates value as IP address
		if ( !IP::isValid( $_SERVER['HTTP_HOST'] ) ) {
			$domainParts = explode( '.', $_SERVER['HTTP_HOST'] );
			$domainParts = array_reverse( $domainParts );
			// Although some browsers will accept cookies without the initial ., » RFC 2109 requires it to be included.
			wfProfileOut( __METHOD__ );
			return count( $domainParts ) >= 2 ? '.' . $domainParts[1] . '.' . $domainParts[0] : $_SERVER['HTTP_HOST'];
		}
		wfProfileOut( __METHOD__ );
		return $_SERVER['HTTP_HOST'];
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
		if ( isset( $_SERVER['HTTP_X_DEVICE'] ) ) {
			$this->getRequest()->response()->header( 'X-Device: ' . $_SERVER['HTTP_X_DEVICE'] );
			$out->addVaryHeader( 'X-Device' );
		}
		$out->addVaryHeader( 'Cookie' );
		$out->addVaryHeader( 'X-Carrier' );
		$out->addVaryHeader( 'X-Images' );
		wfProfileOut( __METHOD__ );
		return true;
	}

	private function sendApplicationVersionVaryHeader() {
		wfProfileIn( __METHOD__ );
		$this->getOutput()->addVaryHeader( 'Application_Version' );
		if ( isset( $_SERVER['HTTP_APPLICATION_VERSION'] ) ) {
			$this->getRequest()->response()->header( 'Application_Version: ' . $_SERVER['HTTP_APPLICATION_VERSION'] );
		} else {
			if ( isset( $_SERVER['HTTP_X_DEVICE'] ) ) {
				if ( stripos( $_SERVER['HTTP_X_DEVICE'], 'iphone' ) !== false ||
					stripos( $_SERVER['HTTP_X_DEVICE'], 'android' ) !== false ) {
					$this->getRequest()->response()->header( 'Application_Version: ' . $_SERVER['HTTP_X_DEVICE'] );
				}
			}
		}
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
				array( 'for' => 'wpName1' ), wfMsg( 'mobile-frontend-username' ) ) .
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
				array( 'for' => 'wpPassword1' ), wfMsg( 'mobile-frontend-password' ) ) .
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
			Html::input( 'wpLoginAttempt', wfMsg( 'mobile-frontend-login' ), 'submit',
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
		$formatter = new MobileFormatter( MobileFormatter::wrapHTML( $html ), $this->getTitle(),
			$this->getContentFormat(), $this->wmlContext
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

		if ( $this->contentTransformations ) {
			wfProfileIn( __METHOD__ . '-filter' );
			$formatter->removeImages( $this->disableImages );
			$formatter->whitelistIds( 'zero-language-search' );
			$formatter->filterContent();
			wfProfileOut( __METHOD__ . '-filter' );
		}

		wfProfileIn( __METHOD__ . '-getText' );
		$formatter->setIsMainPage( $this->getTitle()->isMainPage() );
		$device = $this->getDevice();
		if ( $this->getContentFormat() == 'HTML'
			&& $device['supports_javascript'] === true
			&& $this->getRequest()->getText( 'search' ) == '' )
		{
			$formatter->enableExpandableSections();
		}
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		if ( $this->format === 'json' ) {
			wfProfileIn( __METHOD__ . '-json' );
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

		if ( $this->isBetaGroupMember ) {
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
				'tests/js/test_application.js',
				'javascripts/beta_opensearch.js', 'tests/js/test_beta_opensearch.js',
				'javascripts/banner.js', 'tests/js/test_banner.js',
				'javascripts/toggle.js', 'tests/js/test_toggle.js',
				'javascripts/references.js', 'tests/js/test_references.js' ),
				'dependencies' => array( ),
				'localBasePath' => dirname( __FILE__ ),
				'remoteExtPath' => 'MobileFrontend',
		);
		return true;
	}

	/**
	* Take a URL Host Template and return the host portion
	* @param $mobileUrlHostTemplate string
	* @return string
	*/
	public function getMobileToken( $mobileUrlHostTemplate ) {
		wfProfileIn( __METHOD__ );
		$mobileToken = preg_replace( '/%h[0-9]\.{0,1}/', '', $mobileUrlHostTemplate );
		wfProfileOut( __METHOD__ );
		return $mobileToken;
	}

	/**
	 * Take a URL and return a copy that conforms to the mobile URL template
	 * @param $url string
	 * @param $forceHttps bool
	 * @return string
	 */
	public function getMobileUrl( $url, $forceHttps = false ) {
		if ( $this->shouldDisplayMobileView() ) {
			$subdomainTokenReplacement = null;
			if ( wfRunHooks( 'GetMobileUrl', array( &$subdomainTokenReplacement ) ) ) {
				if ( !empty( $subdomainTokenReplacement ) ) {
					global $wgMobileUrlTemplate;
					$mobileUrlHostTemplate = $this->parseMobileUrlTemplate( 'host' );
					$mobileToken = $this->getMobileToken( $mobileUrlHostTemplate );
					$wgMobileUrlTemplate = str_replace( $mobileToken, $subdomainTokenReplacement, $wgMobileUrlTemplate );
				}
			}
		}

		$parsedUrl = wfParseUrl( $url );
		$this->updateMobileUrlHost( $parsedUrl );
		$this->updateMobileUrlQueryString( $parsedUrl );
		if ( $forceHttps ) {
			$parsedUrl[ 'scheme' ] = 'https';
		}

		$assembleUrl = wfAssembleUrl( $parsedUrl );
		return $assembleUrl;
	}

	/**
	 * Take a URL and return a copy that removes any mobile tokens
	 * @param string
	 * @return string
	 */
	public function getDesktopUrl( $url ) {
		$parsedUrl = wfParseUrl( $url );
		$this->updateDesktopUrlHost( $parsedUrl );
		$this->updateDesktopUrlQuery( $parsedUrl );
		$desktopUrl = wfAssembleUrl( $parsedUrl );
		return $desktopUrl;
	}

	/**
	 * Update host of given URL to conform to mobile URL template.
	 * @param $parsedUrl array
	 * 		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateMobileUrlHost( &$parsedUrl ) {
		$mobileUrlHostTemplate = $this->parseMobileUrlTemplate( 'host' );
		if ( !strlen( $mobileUrlHostTemplate ) ) {
			return;
		}

		$parsedHostParts = explode( ".", $parsedUrl['host'] );
		$templateHostParts = explode( ".", $mobileUrlHostTemplate );
		$targetHostParts = array();

		foreach ( $templateHostParts as $key => $templateHostPart ) {
			if ( strstr( $templateHostPart, '%h' ) ) {
				$parsedHostPartKey = substr( $templateHostPart, 2 );
				$targetHostParts[ $key ] = $parsedHostParts[$parsedHostPartKey];
			} elseif ( isset( $parsedHostParts[ $key ] )
					&& $templateHostPart == $parsedHostParts[$key] ) {
				$targetHostParts = $parsedHostParts;
				break;
			} else {
				$targetHostParts[$key] = $templateHostPart;
			}
		}

		$parsedUrl['host'] = implode( ".", $targetHostParts );
	}

	/**
	 * Update the host of a given URL to strip out any mobile tokens
	 * @param $parsedUrl array
	 *		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateDesktopUrlHost( &$parsedUrl ) {
		$mobileUrlHostTemplate = $this->parseMobileUrlTemplate( 'host' );
		if ( !strlen( $mobileUrlHostTemplate ) ) {
			return;
		}

		// identify the mobile token by stripping out normal host parts
		$mobileToken = $this->getMobileToken( $mobileUrlHostTemplate );

		// replace the mobile token with nothing, resulting in the normal hostname
		$parsedUrl['host'] = str_replace( '.' . $mobileToken, '.', $parsedUrl['host'] );
	}

	/**
	 * Update the query portion of a given URL to remove any 'useformat' params
	 * @param $parsedUrl array
	 * 		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateDesktopUrlQuery( &$parsedUrl ) {
		if ( strpos( $parsedUrl['query'], 'useformat' ) !== false ) {
			$query = wfCgiToArray( html_entity_decode( $parsedUrl['query'] ) );
			unset( $query['useformat'] );
			$parsedUrl['query'] = wfArrayToCgi( $query );
		}
	}

	/**
	 * Update path of given URL to conform to mobile URL template.
	 *
	 * NB: this is not actually being used anywhere at the moment. It will
	 * take some magic to get MW to properly handle path modifications like
	 * this is intended to provide. This will hopefully be implemented someday
	 * in the not to distant future.
	 *
	 * @param $parsedUrl array
	 * 		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateMobileUrlPath( &$parsedUrl ) {
		global $wgScriptPath;

		$mobileUrlPathTemplate = $this->parseMobileUrlTemplate( 'path' );

		// if there's no path template, no reason to continue.
		if ( !strlen( $mobileUrlPathTemplate ) ) {
			return;
		}

		// find out if we already have a templated path
		$templatePathOffset = strpos( $mobileUrlPathTemplate, '%p' );
		$templatePathSansToken = substr( $mobileUrlPathTemplate, 0, $templatePathOffset );
		if ( substr_compare( $parsedUrl[ 'path' ], $wgScriptPath . $templatePathSansToken, 0 ) > 0 ) {
			return;
		}

		$scriptPathLength = strlen( $wgScriptPath );
		// the "+ 1" removes the preceding "/" from the path sans $wgScriptPath
		$pathSansScriptPath = substr( $parsedUrl[ 'path' ], $scriptPathLength + 1 );
		$parsedUrl[ 'path' ] = $wgScriptPath . $templatePathSansToken . $pathSansScriptPath;
	}

	/**
	 * Placeholder for potential future use of query string handling
	 */
	protected function updateMobileUrlQueryString( &$parsedUrl ) {
		return;
	}

	/**
	 * Parse mobile URL template into its host and path components.
	 *
	 * Optionally specify which portion of the template you want returned.
	 * @param $part string
	 * @return Mixed
	 */
	public function parseMobileUrlTemplate( $part = null ) {
		global $wgMobileUrlTemplate;

		$pathStartPos = strpos( $wgMobileUrlTemplate, '/' );

		/**
		 * This if/else block exists because of an annoying aspect of substr()
		 * Even if you pass 'null' or 'false' into the 'length' param, it
		 * will return an empty string.
		 * http://www.stopgeek.com/wp-content/uploads/2007/07/sense.jpg
		 */
		if ( $pathStartPos === false ) {
			$host = substr( $wgMobileUrlTemplate, 0 );
		} else {
			$host = substr( $wgMobileUrlTemplate, 0,  $pathStartPos );
		}

		$path = substr( $wgMobileUrlTemplate, $pathStartPos );

		if ( $part == 'host' ) {
			return $host;
		} elseif ( $part == 'path' ) {
			return $path;
		} else {
			return array( 'host' => $host, 'path' => $path );
		}
	}

	protected function isMobileDevice() {
		$xDevice = $this->getXDevice();

		if ( empty( $xDevice ) ) {
			return false;
		}

		return true;
	}

	protected function isFauxMobileDevice() {
		$useFormat = $this->getUseFormat();
		if ( $useFormat !== 'mobile' && $useFormat !== 'mobile-wap' ) {
			return false;
		}

		return true;
	}

	/**
	 * Determine whether or not we should display the mobile view
	 *
	 * Step through the hierarchy of what should or should not trigger
	 * the mobile view.
	 *
	 * Primacy is given to the page action - we will never show mobile view
	 * for page edits or page history. 'userformat' request param is then
	 * honored, followed by cookie settings, then actual device detection,
	 * finally falling back on false.
	 * @return bool
	 */
	public function shouldDisplayMobileView() {
		// always display non-mobile view for edit/history/diff
		$action = $this->getAction();
		$req = $this->getRequest();
		$isDiff = $req->getText( 'diff' );

		if ( $action === 'edit' || $action === 'history' || $isDiff ) {
			return false;
		}

		// May be overridden programmatically
		if ( $this->forceMobileView ) {
			return true;
		}

		// always display desktop or mobile view if it's explicitly requested
		$useFormat = $this->getUseFormat();
		if ( $useFormat == 'desktop' ) {
			return false;
		} elseif ( $this->isFauxMobileDevice() ) {
			return true;
		}

		// check cookies for what to display
		$useMobileFormat = $this->getUseFormatCookie();
		if ( $useMobileFormat == 'true' ) {
			return true;
		}
		$stopMobileRedirect = $this->getStopMobileRedirectCookie();
		if ( $stopMobileRedirect == 'true' ) {
			return false;
		}

		// do device detection
		if ( $this->isMobileDevice() ) {
			return true;
		}

		return false;
	}

	public function getXDevice() {
		if ( is_null( $this->xDevice ) ) {
			$this->xDevice = isset( $_SERVER['HTTP_X_DEVICE'] ) ?
					$_SERVER['HTTP_X_DEVICE'] : '';
		}

		return $this->xDevice;
	}

	public function getMobileAction() {
		if ( is_null( $this->mobileAction ) ) {
			$this->mobileAction = $this->getRequest()->getText( 'mobileaction' );
		}

		return $this->mobileAction;
	}

	public function getAction() {
		if ( is_null( $this->action ) ) {
			$this->action = $this->getRequest()->getText( 'action' );
		}

		return $this->action;
	}

	public function getUseFormat() {
		if ( !isset( $this->useFormat ) ) {
			$useFormat = $this->getRequest()->getText( 'useformat' );
			$this->setUseFormat( $useFormat );
		}
		return $this->useFormat;
	}

	public function setUseFormat( $useFormat ) {
		$this->useFormat = $useFormat;
	}

	public function setStopMobileRedirectCookie( $expiry = null ) {
		global $wgCookiePath, $wgCookieSecure;
		if ( is_null( $expiry ) ) {
			$expiry = $this->getUseFormatCookieExpiry();
		}

		setcookie( 'stopMobileRedirect', 'true', $expiry, $wgCookiePath, $this->getBaseDomain(), $wgCookieSecure );
	}

	public function unsetStopMobileRedirectCookie() {
		if ( is_null( $this->getStopMobileRedirectCookie() ) ) {
			return;
		}
		$expire = $this->getUseFormatCookieExpiry( time(), -3600 );
		$this->setStopMobileRedirectCookie( $expire );
	}

	public function getStopMobileRedirectCookie() {
		$stopMobileRedirectCookie = $this->getRequest()->getCookie( 'stopMobileRedirect', '' );

		return $stopMobileRedirectCookie;
	}

	/**
	 * Get the useformat cookie
	 *
	 * This cookie can determine whether or not a user should see the mobile
	 * version of a page.
	 *
	 * @return string|null
	 */
	public function getUseFormatCookie() {
		$useFormatFromCookie = $this->getRequest()->getCookie( $this->getUseFormatCookieName(), '' );

		return $useFormatFromCookie;
	}

	/**
	 * Set the mf_useformat cookie
	 *
	 * This cookie can determine whether or not a user should see the mobile
	 * version of pages.
	 *
	 * Uses regular php setcookie rather than WebResponse::setCookie()
	 * so we can ignore $wgCookieHttpOnly since the protection is provides
	 * is irrelevant for this cookie.
	 *
	 * @param string $useFormat The format to store in the cookie
	 * @param int $string The expiration to set
	 * @param bool $force Whether or not to force the cookie getting set
	 */
	public function setUseFormatCookie( $cookieFormat = 'true', $expiry = null, $force = false ) {
		global $wgCookiePath, $wgCookieSecure;

		// sanity check before setting the cookie
		if ( !$this->shouldSetUseFormatCookie() && !$force ) {
			return;
		}

		if ( is_null( $expiry ) ) {
			$expiry = $this->getUseFormatCookieExpiry();
		}

		setcookie( $this->getUseFormatCookieName(), $cookieFormat, $expiry, $wgCookiePath, $_SERVER['HTTP_HOST'], $wgCookieSecure );
		wfIncrStats( 'mobile.useformat_' . $cookieFormat . '_cookie_set' );
	}

	public function unsetUseFormatCookie() {
		if ( is_null( $this->getUseFormatCookie() ) ) {
			return;
		}

		// set expiration date in the past
		$expire = $this->getUseFormatCookieExpiry( time(), -3600 );
		$this->setUseFormatCookie( '', $expire, true );
	}

	public function getUseFormatCookieName() {
		if ( !isset( $this->useFormatCookieName ) ) {
			$this->useFormatCookieName = 'mf_mobileFormat';
		}
		return $this->useFormatCookieName;
	}

	/**
	 * Determine whether or not the requested cookie value should get set
	 *
	 * Ignores certain URL patterns, eg initial requests to a mobile-specific
	 * domain with no path. This is intended to avoid pitfalls for certain
	 * server configurations, but should not get in the way of
	 * out-of-the-box configs.
	 *
	 * Also will not set cookie if the cookie's value has already been
	 * appropriately set.
	 * @return bool
	 */
	protected function shouldSetUseFormatCookie() {
		global $wgScriptPath;

		$reqUrl = $this->getRequest()->getRequestUrl();
		$urlsToIgnore = array( '/?useformat=mobile', $wgScriptPath . '/?useformat=mobile' );
		if ( in_array( $reqUrl, $urlsToIgnore ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Get the expiration time for the mf_useformat cookie
	 *
	 * @param int $startTime The base time (in seconds since Epoch) from which to calculate
	 * 		cookie expiration. If null, time() is used.
	 * @param int $cookieDuration The time (in seconds) the cookie should last
	 * @return int The time (in seconds since Epoch) that the cookie should expire
	 */
	protected function getUseFormatCookieExpiry( $startTime = null, $cookieDuration = null ) {
		// use $cookieDuration if it's valid
		if ( intval( $cookieDuration ) === 0 ) {
			$cookieDuration = $this->getUseFormatCookieDuration();
		}

		// use $startTime if it's valid
		if ( intval( $startTime ) === 0 ) $startTime = time();

		$expiry = $startTime + $cookieDuration;
		return $expiry;
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
	 * Determine the duration the cookie should last.
	 *
	 * If $wgMobileFrontendFormatcookieExpiry has a non-0 value, use that
	 * for the duration. Otherwise, fall back to $wgCookieExpiration.
	 *
	 * @return int The number of seconds for which the cookie should last.
	 */
	public function getUseFormatCookieDuration() {
		global $wgMobileFrontendFormatCookieExpiry, $wgCookieExpiration;
		$cookieDuration = ( abs( intval( $wgMobileFrontendFormatCookieExpiry ) ) > 0 ) ?
				$wgMobileFrontendFormatCookieExpiry : $wgCookieExpiration;
		return $cookieDuration;
	}

	/**
	 * Toggles view to one specified by the user
	 *
	 * If a user has requested a particular view (eg clicked 'Desktop' from
	 * a mobile page), set the requested view for this particular request
	 * and set a cookie to keep them on that view for subsequent requests.
	 */
	public function toggleView( $view, $temporary = false ) {
		global $wgMobileUrlTemplate;

		if ( $view == 'mobile' ) {
			// unset stopMobileRedirect cookie
			if ( !$temporary ) $this->unsetStopMobileRedirectCookie();

			// if no mobileurl template, set mobile cookie
			if ( !strlen( trim( $wgMobileUrlTemplate ) ) ) {
				if ( !$temporary ) $this->setUseFormatCookie();
				$this->setUseFormat( $view );
			} else {
				// else redirect to mobile domain
				$currentUrl = wfExpandUrl( $this->getRequest()->getRequestURL() );
				$currentUrl = $this->removeQueryStringParameter( $currentUrl, 'mobileaction' );
				$mobileUrl = $this->getMobileUrl( $currentUrl );
				$this->getOutput()->redirect( $mobileUrl, 301 );
			}
		} elseif ( $view == 'desktop' ) {
			// set stopMobileRedirect cookie
			if ( !$temporary ) {
				$this->setStopMobileRedirectCookie();
				// unset useformat cookie
				if ( $this->getUseFormatCookie() == "true" ) {
					$this->unsetUseFormatCookie();
				}
			}

			// if no mobileurl template, unset useformat cookie
			if ( !strlen( trim( $wgMobileUrlTemplate ) ) ) {
				$this->setUseFormat( $view );
			} else {
				// if mobileurl template, redirect to desktop domain
				$currentUrl = wfExpandUrl( $this->getRequest()->getRequestURL() );
				$currentUrl = $this->removeQueryStringParameter( $currentUrl, 'mobileaction' );
				$desktopUrl = $this->getDesktopUrl( $currentUrl );
				$this->getOutput()->redirect( $desktopUrl, 301 );
			}
		}
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
			$resourceLoader->register( "ext.mobileFrontend.$file",
				array(
					'styles' => array( "stylesheets/{$file}.css" ),
					'localBasePath' => dirname( __FILE__ ),
					'remoteExtPath' => 'MobileFrontend',
				)
			);
		}
		return true;
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}