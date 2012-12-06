<?php

class MobileContext extends ContextSource {
	protected $betaGroupMember;
	protected $alphaGroupMember;
	protected $contentFormat = '';
	protected $useFormatCookieName;
	protected $disableImages;
	protected $useFormat;

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

	private $forceMobileView = false;
	private $forceLeftMenu = false;
	private $contentTransformations = true;

	private static $instance = null;

	/**
	 * @return MobileContext
	 */
	public static function singleton() {
		if ( !self::$instance ) {
			self::$instance = new MobileContext( RequestContext::getMain() );
		}
		return self::$instance;
	}

	public static function setInstance( /* MobileContext|null */ $instance ) {
		self::$instance = $instance;
	}

	private function __construct( IContextSource $context ) {
		$this->setContext( $context );
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
		$request = $this->getRequest();

		$xDevice = $this->getXDevice();
		if ( $xDevice ) {
			$formatName = $xDevice;
		} else {
			$userAgent = $request->getHeader( 'User-agent' );
			$acceptHeader = $request->getHeader( 'Accept' );
			$acceptHeader = $acceptHeader === false ? '' : $acceptHeader;
			$formatName = $detector->detectFormatName( $userAgent, $acceptHeader );
		}
		$this->device = $detector->getDevice( $formatName );

		wfProfileOut( __METHOD__ );
		return $this->device;
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
		$this->contentFormat = ExtMobileFrontend::parseContentFormat( $viewFormat );
		return $this->contentFormat;
	}

	public function imagesDisabled() {
		if ( is_null( $this->disableImages ) ) {
			$this->disableImages = (bool)$this->getRequest()->getCookie( 'disableImages' );
		}

		return $this->disableImages;
	}

	public function isMobileDevice() {
		$xDevice = $this->getXDevice();

		if ( empty( $xDevice ) ) {
			return false;
		}

		return true;
	}

	/**
	 * @return bool: Whether skin should render the left menu
	 */
	public function getForceLeftMenu() {
		return $this->forceLeftMenu;
	}

	public function setForceLeftMenu( $value ) {
		$this->forceLeftMenu = $value;
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

	protected function isFauxMobileDevice() {
		$useFormat = $this->getUseFormat();
		if ( $useFormat !== 'mobile' && $useFormat !== 'mobile-wap' ) {
			return false;
		}

		return true;
	}

	public function isAlphaGroupMember() {
		if ( is_null( $this->alphaGroupMember ) ) {
			$this->checkUserStatus();
			if ( $this->getMobileAction() == 'alpha' ) {
				$this->setAlphaGroupMember( true );
			}
		}
		return $this->alphaGroupMember;
	}

	public function setAlphaGroupMember( $value ) {
		$this->alphaGroupMember = $value;
	}

	public function isBetaGroupMember() {
		if ( is_null( $this->betaGroupMember ) ) {
			$this->checkUserStatus();
			if ( $this->getMobileAction() == 'beta' ) {
				$this->setBetaGroupMember( true );
			}
		}
		return $this->betaGroupMember;
	}

	public function setBetaGroupMember( $value ) {
		$this->betaGroupMember = $value;
	}

	public function getMobileToken() {
		$token = $this->getRequest()->getSessionData( 'wsMobileToken' );
		if ( $token === null ) {
			if ( $this->getUser()->isAnon() ) {
				wfSetupSession();
			}
			$token = MWCryptRand::generateHex( 32 );
			$this->getRequest()->setSessionData( 'wsMobileToken', $token );
		}
		return $token;
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
		if ( $action === 'edit' && !$this->isBetaGroupMember() ) {
			return false;
		}

		if ( $action === 'history' || $isDiff ) {
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
			$this->xDevice = $this->getRequest()->getHeader( 'X-Device' );
			$this->xDevice = $this->xDevice === false ? '' : $this->xDevice;
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

		setcookie( 'stopMobileRedirect', 'true', $expiry, $wgCookiePath, $this->getStopMobileRedirectCookieDomain(), $wgCookieSecure );
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
	 * @return bool
	 */
	public function checkUserLoggedIn() {
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
		$alpha = $this->getAlphaOptInOutCookie();
		if ( !empty( $optInCookie ) &&
			$optInCookie == 1 ) {
			$this->betaGroupMember = true;
		}
		if ( !empty( $alpha ) &&
			$alpha == 1 ) {
			$this->setAlphaGroupMember( true );
		} else {
			$this->setAlphaGroupMember( false );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $value bool
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
		$this->getRequest()->response()->setcookie( 'optin', $value ? '1' : '', 0, '' );
		$wgCookieDomain = $tempWgCookieDomain;
		$wgCookiePrefix = $tempWgCookiePrefix;
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $value bool
	 * @return bool
	 */
	public function setAlphaOptInOutCookie( $value, $disabled = false ) {
		wfProfileIn( __METHOD__ );
		// track opt ins
		if ( $value ) {
			wfIncrStats( 'mobile.alpha.opt_in_cookie_set' );
		}
		// track opt outs
		if ( $disabled ) {
			wfIncrStats( 'mobie.alpha.opt_in_cookie_unset' );
		}
		$cookieDomain = $this->getBaseDomain();
		$this->getRequest()->response()->setcookie( 'mf_alpha', $value ? '1' : '', 0, '', $cookieDomain );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @return Mixed
	 */
	private function getAlphaOptInOutCookie() {
		wfProfileIn( __METHOD__ );
		$optInCookie = $this->getRequest()->getCookie( 'mf_alpha', '' );
		wfProfileOut( __METHOD__ );
		return $optInCookie;
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
	 * @param $disable bool
	 */
	public function setDisableImagesCookie( $disable ) {
		$this->getRequest()->response()->setcookie( 'disableImages', $disable ? '1' : '' );
	}

	/**
	 * @return string
	 */
	public function getBaseDomain() {
		wfProfileIn( __METHOD__ );
		// Validates value as IP address
		$host = $this->getRequest()->getHeader( 'Host' );
		if ( !IP::isValid( $host ) ) {
			$domainParts = explode( '.', $host );
			$domainParts = array_reverse( $domainParts );
			// Although some browsers will accept cookies without the initial ., » RFC 2109 requires it to be included.
			wfProfileOut( __METHOD__ );
			return count( $domainParts ) >= 2 ? '.' . $domainParts[1] . '.' . $domainParts[0] : $host;
		}
		wfProfileOut( __METHOD__ );
		return $host;
	}

	/**
	 * Determine the correct domain to use for the stopMobileRedirect cookie
	 *
	 * Will use $wgMFStopRedirectCookieHost if it's set, otherwise will use
	 * result of getBaseDomain()
	 * @return string
	 */
	public function getStopMobileRedirectCookieDomain() {
		global $wgMFStopRedirectCookieHost;

		if ( !$wgMFStopRedirectCookieHost ) {
			$wgMFStopRedirectCookieHost = $this->getBaseDomain();
		}

		return $wgMFStopRedirectCookieHost;
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
	 * @param string $cookieFormat
	 * @param null $expiry
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

		setcookie( $this->getUseFormatCookieName(), $cookieFormat, $expiry, $wgCookiePath,
			$this->getRequest()->getHeader( 'Host' ), $wgCookieSecure );
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
	 * Take a URL Host Template and return the host portion
	 * @param $mobileUrlHostTemplate string
	 * @return string
	 */
	public function getMobileHost( $mobileUrlHostTemplate ) {
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
					$mobileToken = $this->getMobileHost( $mobileUrlHostTemplate );
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
		$mobileToken = $this->getMobileHost( $mobileUrlHostTemplate );

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
	 *
	 * @param $parsedUrl
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

	/**
	 * Toggles view to one specified by the user
	 *
	 * If a user has requested a particular view (eg clicked 'Desktop' from
	 * a mobile page), set the requested view for this particular request
	 * and set a cookie to keep them on that view for subsequent requests.
	 */
	public function toggleView( $view, $temporary = false ) {
		global $wgMobileUrlTemplate;

		$url = $this->getTitle()->getFullURL();

		if ( $view == 'mobile' ) {
			// unset stopMobileRedirect cookie
			if ( !$temporary ) {
				// @TODO is this necessary with unsetting the cookie via JS?
				$this->unsetStopMobileRedirectCookie();
			}

			// if no mobileurl template, set mobile cookie
			if ( !strlen( trim( $wgMobileUrlTemplate ) ) ) {
				if ( !$temporary ) {
					$this->setUseFormatCookie();
				}
				$this->setUseFormat( $view );
			} else {
				// else redirect to mobile domain
				$mobileUrl = $this->getMobileUrl( $url );
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
				$desktopUrl = $this->getDesktopUrl( $url );
				$this->getOutput()->redirect( $desktopUrl, 301 );
			}
		}
	}

	/**
	 * Determine whether or not we need to toggle the view, and toggle it
	 */
	public function checkToggleView() {
		$mobileAction = $this->getMobileAction();
		if ( $mobileAction == 'toggle_view_desktop' ) {
			$this->toggleView( 'desktop' );
		} elseif ( $mobileAction == 'toggle_view_mobile' ) {
			$this->toggleView( 'mobile' );
		}
	}
}
