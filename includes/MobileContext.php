<?php
/**
 * MobileContext.php
 */

/**
 * Provide various request-dependant methods to use in mobile context
 */
class MobileContext extends ContextSource {
	const USEFORMAT_COOKIE_NAME = 'mf_useformat';
	/**
	 * Saves the testing mode user has opted in: 'alpha', 'beta' or 'stable'
	 * @var string $mobileMode
	 */
	protected $mobileMode;
	/**
	 * Save whether images are disabled for the current user
	 * @var boolean $disableImages
	 */
	protected $disableImages;
	/**
	 * Save explicitly requested format
	 * @var string $useFormat
	 */
	protected $useFormat;
	/**
	 * Save whether current page is blacklisted from displaying in mobile view
	 * @var boolean $blacklistedPage
	 */
	protected $blacklistedPage;

	/**
	 * Key/value pairs of things to add to X-Analytics response header for anlytics
	 * @var array
	 */
	protected $analyticsLogItems = array();

	/** @var IDeviceProperties $device Saves current device description */
	private $device;

	/**
	 * @var string $action MediaWiki 'action'
	 */
	protected $action;

	/**
	 * Saves requested Mobile action
	 * @var string $mobileAction
	 */
	protected $mobileAction;

	/**
	 * Save whether mobile view is explicity requested
	 * @var boolean $forceMobileView
	 */
	private $forceMobileView = false;
	/**
	 * Save whether content should be transformed to better suit mobile devices
	 * @var boolean $contentTransformations
	 */
	private $contentTransformations = true;
	/**
	 * Save whether or not we should display the mobile view
	 * @var boolean $mobileView
	 */
	private $mobileView = null;
	/**
	 * Have we already checked for desktop/mobile view toggling?
	 * @var boolean $toggleViewChecked
	 */
	private $toggleViewChecked = false;
	/**
	 * Save an instance of this class
	 * @var MobileContext $instance
	 */
	private static $instance = null;
	/**
	 * @var string What to switch the view to
	 */
	private $viewChange = '';
	/**
	 * @var Config MobileFrontend's config object
	 */
	private $configObj;

	/**
	 * Returns the actual MobileContext Instance or create a new if no exists
	 * @return MobileContext
	 */
	public static function singleton() {
		if ( !self::$instance ) {
			self::$instance = new MobileContext( RequestContext::getMain() );
		}
		return self::$instance;
	}

	/**
	 * Set $this->instance to the given instance of MobileContext or null
	 * @param MobileContext|null $instance MobileContext instance or null to set
	 * @return MobileContext|null
	 */
	public static function setInstance( /* MobileContext|null */ $instance ) {
		self::$instance = $instance;
	}

	/**
	 * Set the IontextSource Object
	 * @param IContextSource $context The IContextSource Object has to set
	 */
	protected function __construct( IContextSource $context ) {
		$this->setContext( $context );
	}

	/**
	 * Get MobileFrontend's config object.
	 * @return Config
	 */
	public function getMFConfig() {
		if ( !$this->configObj instanceof Config ) {
			$this->configObj = ConfigFactory::getDefaultInstance()->makeConfig( 'mobilefrontend' );
		}
		return $this->configObj;
	}

	/**
	 * Gets the current device description
	 * @return IDeviceProperties
	 */
	public function getDevice() {
		$mobileHeader = $this->getMFConfig()->get( 'MFMobileHeader' );

		if ( $this->device ) {
			return $this->device;
		}
		$detector = DeviceDetection::factory();
		$request = $this->getRequest();

		if ( $mobileHeader && $this->getRequest()->getHeader( $mobileHeader ) !== false ) {
			$this->device = new HtmlDeviceProperties();
		} else {
			$userAgent = $request->getHeader( 'User-agent' );
			$acceptHeader = $request->getHeader( 'Accept' );
			$acceptHeader = $acceptHeader === false ? '' : $acceptHeader;
			$this->device = $detector->detectDeviceProperties( $userAgent, $acceptHeader );
		}

		return $this->device;
	}

	/**
	 * Checks whether images are disabled for the current user
	 * @return bool
	 */
	public function imagesDisabled() {
		if ( is_null( $this->disableImages ) ) {
			$this->disableImages = (bool)$this->getRequest()->getCookie( 'disableImages' );
		}

		return $this->disableImages;
	}

	/**
	 * Whether the user is allowed to upload
	 * @return boolean
	 */
	public function userCanUpload() {
		$config = $this->getMFConfig();
		$user = $this->getUser();

		// check if upload is enabled local or to remote location (to commons e.g.)
		// TODO: what if the user cannot upload to the destination wiki in $wgMFPhotoUploadEndpoint?
		$uploadEnabled = ( UploadBase::isEnabled() &&
			UploadBase::isallowed( $user )
		) || $config->get( 'MFPhotoUploadEndpoint' );

		if ( $uploadEnabled ) {
			// Make sure the user is either in desktop mode or meets the special
			// conditions necessary for uploading in mobile mode.
			if ( !$this->shouldDisplayMobileView() ||
				(
					$user->isAllowed( 'mf-uploadbutton' ) &&
					$user->getEditCount() >= $config->get( 'MFUploadMinEdits' )
				)
			) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check whether the device is a mobile device
	 * @return bool
	 */
	public function isMobileDevice() {
		$config = $this->getMFConfig();

		if ( !$config->get( 'MFAutodetectMobileView' ) ) {
			return false;
		}
		if ( $this->getAMF() ) {
			return true;
		}
		$device = $this->getDevice();
		return $device->isMobileDevice()
			&& !( !$config->get( 'MFShowMobileViewToTablets' ) && $device->isTablet() );

	}

	/**
	 * Check for mobile device when using Apache Mobile Filter (AMF)
	 *
	 * IF AMF is enabled, make sure we use it to detect mobile devices.
	 * Tablets are currently served desktop site.
	 *
	 * AMF docs: http://wiki.apachemobilefilter.org/
	 *
	 * @return bool
	 */
	public function getAMF() {
		$showMobileViewToTablets = $this->getMFConfig()->get( 'MFShowMobileViewToTablets' );

		$amf = isset( $_SERVER['AMF_DEVICE_IS_MOBILE'] ) && $_SERVER['AMF_DEVICE_IS_MOBILE'] === 'true';
		if ( !$showMobileViewToTablets && $amf ) {
			$amf &= $_SERVER['AMF_DEVICE_IS_TABLET'] === 'false';
		}
		return $amf;
	}

	/**
	 * Save whether mobile view should always be enforced
	 * @param bool $value
	 */
	public function setForceMobileView( $value ) {
		$this->forceMobileView = $value;
	}

	/**
	 * Whether mobile view should always be enforced
	 * @return bool
	 */
	public function getForceMobileView() {
		return $this->forceMobileView;
	}

	/**
	 * Whether content should be transformed to better suit mobile devices
	 * @param bool $value
	 */
	public function setContentTransformations( $value ) {
		$this->contentTransformations = $value;
	}

	/**
	 * Whether content should be transformed to better suit mobile devices
	 * @return bool
	 */
	public function getContentTransformations() {
		return $this->contentTransformations;
	}

	/**
	 * Wether useformat is mobile
	 * @return bool
	 */
	protected function isFauxMobileDevice() {
		$useFormat = $this->getUseFormat();
		if ( $useFormat !== 'mobile' && $useFormat !== 'mobile-wap' ) {
			return false;
		}

		return true;
	}

	/**
	 * Returns the testing mode user has opted in: 'alpha', 'beta' or any other value for stable
	 * @return string
	 */
	protected function getMobileMode() {
		$enableBeta = $this->getMFConfig()->get( 'MFEnableBeta' );

		if ( !$enableBeta ) {
			return '';
		}
		if ( is_null( $this->mobileMode ) ) {
			$mobileAction = $this->getMobileAction();
			if ( $mobileAction === 'alpha' || $mobileAction === 'beta' || $mobileAction === 'stable' ) {
				$this->mobileMode = $mobileAction;
			} else {
				$req = $this->getRequest();
				$this->mobileMode = $req->getCookie( 'optin', '' );
			}
		}
		return $this->mobileMode;
	}

	/**
	 * Sets testing group membership, both cookie and this class variables
	 * @param string $mode Mode to set
	 */
	public function setMobileMode( $mode ) {
		if ( $mode !== 'alpha' && $mode !== 'beta' ) {
			$mode = '';
		}
		// Update statistics
		if ( $mode === 'alpha' && !is_null( $this->mobileMode ) ) {
			wfIncrStats( 'mobile.alpha.opt_in_cookie_set' );
		}
		if ( $mode === 'beta' ) {
			if ( $this->mobileMode === 'alpha' ) {
				wfIncrStats( 'mobile.alpha.opt_in_cookie_unset' );
			} else {
				wfIncrStats( 'mobile.opt_in_cookie_set' );
			}
		}
		if ( !$mode ) {
			wfIncrStats( 'mobile.opt_in_cookie_unset' );
		}
		$this->mobileMode = $mode;

		$host = $this->getBaseDomain();
		// Deal with people running off localhost. see http://curl.haxx.se/rfc/cookie_spec.html
		if ( strpos( $host, '.' ) === false ) {
			$host = false;
		}
		$this->getRequest()->response()->setcookie( 'optin', $mode, 0,
			array( 'prefix' => '', 'domain' => $host )
		);
	}

	/**
	 * Wether user is Alpha group member
	 * @return boolean
	 */
	public function isAlphaGroupMember() {
		return $this->getMobileMode() === 'alpha';
	}

	/**
	 * Wether user is Beta group member
	 * @return boolean
	 */
	public function isBetaGroupMember() {
		$mode = $this->getMobileMode();
		return $mode === 'beta' || $mode === 'alpha';
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
		if ( !is_null( $this->mobileView ) ) {
			return $this->mobileView;
		}
		// check if we need to toggle between mobile/desktop view
		$this->checkToggleView();
		$this->mobileView = $this->shouldDisplayMobileViewInternal();
		if ( $this->mobileView ) {
			$this->redirectMobileEnabledPages();
			Hooks::run( 'EnterMobileMode', array( $this ) );
		}
		return $this->mobileView;
	}

	/**
	 * If a page has an equivalent but different mobile page redirect to it
	 */
	private function redirectMobileEnabledPages() {
		$redirectUrl = null;
		if ( $this->getRequest()->getCheck( 'diff' ) ) {
			$redirectUrl = SpecialMobileDiff::getMobileUrlFromDesktop();
		}

		if ( $this->getRequest()->getVal( 'action' ) === 'history' ) {
			$values = $this->getRequest()->getValues();
			// avoid infinite redirect loops
			unset( $values['action'] );
			// Avoid multiple history parameters
			unset( $values['title'] );
			$redirectUrl = SpecialPage::getTitleFor( 'History', $this->getTitle() )->
				getLocalURL( $values );
		}

		if ( $redirectUrl ) {
			$this->getOutput()->redirect( $redirectUrl );
		}
	}

	/**
	 * Value for shouldDisplayMobileView()
	 * @return bool
	 */
	private function shouldDisplayMobileViewInternal() {
		$config = $this->getMFConfig();
		$mobileHeader = $config->get( 'MFMobileHeader' );

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

		/**
		 * If a mobile-domain is specified by the $wgMobileUrlTemplate and
		 * there's a mobile header, then we assume the user is accessing
		 * the site from the mobile-specific domain (because why would the
		 * desktop site set the header?). If a user is accessing the
		 * site from a mobile domain, then we should always display the mobile
		 * version of the site (otherwise, the cache may get polluted). See
		 * https://bugzilla.wikimedia.org/show_bug.cgi?id=46473
		 */
		if ( $config->get( 'MobileUrlTemplate' )
			&& $mobileHeader
			&& $this->getRequest()->getHeader( $mobileHeader ) !== false )
		{
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

	/**
	 * Checks whether current page is blacklisted from displaying mobile view
	 * @return bool
	 */
	public function isBlacklistedPage() {
		if ( is_null( $this->blacklistedPage ) ) {
			$this->blacklistedPage = $this->isBlacklistedPageInternal();
		}

		return $this->blacklistedPage;
	}

	/**
	 * Value for isBlacklistedPage()
	 * @return bool
	 */
	private function isBlacklistedPageInternal() {
		$config = $this->getMFConfig();
		$noMobilePages = $config->get( 'MFNoMobilePages' );
		$noMobileCategory = $config->get( 'MFNoMobileCategory' );

		// Check for blacklisted category membership
		$title = $this->getTitle();
		if ( $noMobileCategory && $title ) {
			$id = $title->getArticleID();
			if ( $id ) {
				$dbr = wfGetDB( DB_SLAVE );
				if ( $dbr->selectField( 'categorylinks',
					'cl_from',
					array( 'cl_from' => $id, 'cl_to' => $noMobileCategory ),
					__METHOD__
				) ) {
					return true;
				}
			}
		}
		// ...and individual page blacklisting
		if ( $noMobilePages && $title ) {
			$name = $title->getPrefixedText();
			foreach ( $noMobilePages as $page ) {
				if ( $page === $name ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Get requested mobile action
	 * @return string
	 */
	public function getMobileAction() {
		if ( is_null( $this->mobileAction ) ) {
			$this->mobileAction = $this->getRequest()->getText( 'mobileaction' );
		}

		return $this->mobileAction;
	}

	/**
	 * Get useformat from request for e.g. for isFauxMobileDevice()
	 * @return string
	 */
	public function getUseFormat() {
		if ( !isset( $this->useFormat ) ) {
			$useFormat = $this->getRequest()->getText( 'useformat' );
			$this->setUseFormat( $useFormat );
		}
		return $this->useFormat;
	}

	/**
	 * Set useformat as var
	 * @param string $useFormat The useformat value to set
	 */
	public function setUseFormat( $useFormat ) {
		$this->useFormat = $useFormat;
	}

	/**
	 * Set Cookie to stop automatically redirect to mobile page
	 * @param integer $expiry Expire time of cookie
	 */
	public function setStopMobileRedirectCookie( $expiry = null ) {
		if ( is_null( $expiry ) ) {
			$expiry = $this->getUseFormatCookieExpiry();
		}

		$this->getRequest()->response()->setcookie( 'stopMobileRedirect', 'true', $expiry,
			array(
				'domain' => $this->getStopMobileRedirectCookieDomain(),
				'prefix' => '',
				'secure' => false,
			)
		);
	}

	/**
	 * Remove cookie and continue automatic redirect to mobile page
	 * @return string
	 */
	public function unsetStopMobileRedirectCookie() {
		if ( is_null( $this->getStopMobileRedirectCookie() ) ) {
			return;
		}
		$expire = $this->getUseFormatCookieExpiry( time(), -3600 );
		$this->setStopMobileRedirectCookie( $expire );
	}

	/**
	 * Read cookie for stop automatic mobile redirect
	 * @return string
	 */
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
		$useFormatFromCookie = $this->getRequest()->getCookie( self::USEFORMAT_COOKIE_NAME, '' );

		return $useFormatFromCookie;
	}

	/**
	 * Set cookie to disable images on pages
	 * @param bool $disable
	 */
	public function setDisableImagesCookie( $disable ) {
		$this->getRequest()->response()->setcookie( 'disableImages', $disable ? '1' : '' );
	}

	/**
	 * Return the basic second level domain or just IP adress
	 * @return string
	 */
	public function getBaseDomain() {
		$server = $this->getConfig()->get( 'Server' );

		$parsedUrl = wfParseUrl( $server );
		$host = $parsedUrl['host'];
		// Validates value as IP address
		if ( !IP::isValid( $host ) ) {
			$domainParts = explode( '.', $host );
			$domainParts = array_reverse( $domainParts );
			// Although some browsers will accept cookies without the initial .,
			// » RFC 2109 requires it to be included.
			$host = count( $domainParts ) >= 2 ? '.' . $domainParts[1] . '.' . $domainParts[0] : $host;
		}

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
	 * @param string $cookieFormat
	 * @param null $expiry
	 */
	public function setUseFormatCookie( $cookieFormat = 'true', $expiry = null ) {
		if ( is_null( $expiry ) ) {
			$expiry = $this->getUseFormatCookieExpiry();
		}
		$this->getRequest()->response()->setcookie(
			self::USEFORMAT_COOKIE_NAME,
			$cookieFormat,
			$expiry,
			array(
				'prefix' => '',
				'httpOnly' => false,
			)
		);
		wfIncrStats( 'mobile.useformat_' . $cookieFormat . '_cookie_set' );
	}

	/**
	 * Remove cookie based saved useformat value
	 */
	public function unsetUseFormatCookie() {
		if ( is_null( $this->getUseFormatCookie() ) ) {
			return;
		}

		// set expiration date in the past
		$expire = $this->getUseFormatCookieExpiry( time(), -3600 );
		$this->setUseFormatCookie( '', $expire, true );
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
		$mobileFrontendFormatCookieExpiry =
			$this->getMFConfig()->get( 'MobileFrontendFormatCookieExpiry' );

		$cookieExpiration = $this->getConfig()->get( 'CookieExpiration' );

		$cookieDuration = ( abs( intval( $mobileFrontendFormatCookieExpiry ) ) > 0 ) ?
			$mobileFrontendFormatCookieExpiry : $cookieExpiration;
		return $cookieDuration;
	}

	/**
	 * Take a URL Host Template and return the mobile token portion
	 *
	 * Eg if a desktop domain is en.wikipedia.org, but the mobile variant is
	 * en.m.wikipedia.org, the mobile token is 'm.'
	 * @param $mobileUrlHostTemplate string
	 * @return string
	 */
	public function getMobileHostToken( $mobileUrlHostTemplate ) {
		return preg_replace( '/%h[0-9]\.{0,1}/', '', $mobileUrlHostTemplate );
	}

	/**
	 * Take a URL and return a copy that conforms to the mobile URL template
	 * @param string $url
	 * @param bool $forceHttps
	 * @return string
	 */
	public function getMobileUrl( $url, $forceHttps = false ) {

		if ( $this->shouldDisplayMobileView() ) {
			$subdomainTokenReplacement = null;
			if ( Hooks::run( 'GetMobileUrl', array( &$subdomainTokenReplacement, $this ) ) ) {
				if ( !empty( $subdomainTokenReplacement ) ) {
					global $wgMobileUrlTemplate;
					$mobileUrlHostTemplate = $this->parseMobileUrlTemplate( 'host' );
					$mobileToken = $this->getMobileHostToken( $mobileUrlHostTemplate );
					$wgMobileUrlTemplate = str_replace(
						$mobileToken,
						$subdomainTokenReplacement,
						$wgMobileUrlTemplate
					);
				}
			}
		}

		$parsedUrl = wfParseUrl( $url );
		$this->updateMobileUrlHost( $parsedUrl );
		if ( $forceHttps ) {
			$parsedUrl['scheme'] = 'https';
			$parsedUrl['delimiter'] = '://';
		}

		$assembleUrl = wfAssembleUrl( $parsedUrl );
		return $assembleUrl;
	}

	/**
	 * Take a URL and return a copy that removes any mobile tokens
	 * @param string $url
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
	 * @param array $parsedUrl
	 * 		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateMobileUrlHost( &$parsedUrl ) {
		if ( IP::isIPAddress( $parsedUrl['host'] ) ) {
			return; // Do not update host when IP is used
		}
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
				if ( !array_key_exists( $parsedHostPartKey, $parsedHostParts ) ) {
					return; // invalid pattern for this host, ignore
				}
				$targetHostParts[$key] = $parsedHostParts[$parsedHostPartKey];
			} elseif ( isset( $parsedHostParts[$key] )
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
	 * @param array $parsedUrl
	 *		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateDesktopUrlHost( &$parsedUrl ) {
		$server = $this->getConfig()->get( 'Server' );

		$mobileUrlHostTemplate = $this->parseMobileUrlTemplate( 'host' );
		if ( !strlen( $mobileUrlHostTemplate ) ) {
			return;
		}

		$parsedWgServer = wfParseUrl( $server );
		$parsedUrl['host'] = $parsedWgServer['host'];
	}

	/**
	 * Update the query portion of a given URL to remove any 'useformat' params
	 * @param array $parsedUrl
	 * 		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateDesktopUrlQuery( &$parsedUrl ) {
		if ( isset( $parsedUrl['query'] ) && strpos( $parsedUrl['query'], 'useformat' ) !== false ) {
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
	 * @param array $parsedUrl
	 * 		Result of parseUrl() or wfParseUrl()
	 */
	protected function updateMobileUrlPath( &$parsedUrl ) {
		$scriptPath = $this->getConfig()->get( 'ScriptPath' );

		$mobileUrlPathTemplate = $this->parseMobileUrlTemplate( 'path' );

		// if there's no path template, no reason to continue.
		if ( !strlen( $mobileUrlPathTemplate ) ) {
			return;
		}

		// find out if we already have a templated path
		$templatePathOffset = strpos( $mobileUrlPathTemplate, '%p' );
		$templatePathSansToken = substr( $mobileUrlPathTemplate, 0, $templatePathOffset );
		if ( substr_compare( $parsedUrl[ 'path' ], $scriptPath . $templatePathSansToken, 0 ) > 0 ) {
			return;
		}

		$scriptPathLength = strlen( $scriptPath );
		// the "+ 1" removes the preceding "/" from the path sans $wgScriptPath
		$pathSansScriptPath = substr( $parsedUrl[ 'path' ], $scriptPathLength + 1 );
		$parsedUrl[ 'path' ] = $scriptPath . $templatePathSansToken . $pathSansScriptPath;
	}

	/**
	 * Parse mobile URL template into its host and path components.
	 *
	 * Optionally specify which portion of the template you want returned.
	 * @param string $part
	 * @return mixed
	 */
	public function parseMobileUrlTemplate( $part = null ) {
		$mobileUrlTemplate = $this->getMFConfig()->get( 'MobileUrlTemplate' );

		$pathStartPos = strpos( $mobileUrlTemplate, '/' );

		/**
		 * This if/else block exists because of an annoying aspect of substr()
		 * Even if you pass 'null' or 'false' into the 'length' param, it
		 * will return an empty string.
		 * http://www.stopgeek.com/wp-content/uploads/2007/07/sense.jpg
		 */
		if ( $pathStartPos === false ) {
			$host = substr( $mobileUrlTemplate, 0 );
		} else {
			$host = substr( $mobileUrlTemplate, 0,  $pathStartPos );
		}

		$path = substr( $mobileUrlTemplate, $pathStartPos );

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
	 *
	 * @param string $view User requested particular view
	 */
	public function toggleView( $view ) {
		$this->viewChange = $view;
		if ( !strlen( trim( $this->getMFConfig()->get( 'MobileUrlTemplate' ) ) ) ) {
			$this->setUseFormat( $view );
		}
	}

	/**
	 * Performs view change as requested vy toggleView()
	 */
	public function doToggling() {
		$mobileUrlTemplate = $this->getMFConfig()->get( 'MobileUrlTemplate' );

		if ( !$this->viewChange ) {
			return;
		}

		$url = $this->getRequest()->getFullRequestURL();
		$parsed = wfParseUrl( $url );
		$query = isset( $parsed['query'] ) ? wfCgiToArray( $parsed['query'] ) : array();
		unset( $query['mobileaction'] );
		unset( $query['useformat'] );
		unset( $query['title'] );
		$url = $this->getTitle()->getFullURL( $query, false, PROTO_CURRENT );

		if ( $this->viewChange == 'mobile' ) {
			// unset stopMobileRedirect cookie
			// @TODO is this necessary with unsetting the cookie via JS?
			$this->unsetStopMobileRedirectCookie();

			// if no mobileurl template, set mobile cookie
			if ( !strlen( trim( $mobileUrlTemplate ) ) ) {
				$this->setUseFormatCookie();
			} else {
				// else redirect to mobile domain
				$mobileUrl = $this->getMobileUrl( $url );
				$this->getOutput()->redirect( $mobileUrl, 301 );
			}
		} elseif ( $this->viewChange == 'desktop' ) {
			// set stopMobileRedirect cookie
			$this->setStopMobileRedirectCookie();
			// unset useformat cookie
			if ( $this->getUseFormatCookie() == "true" ) {
				$this->unsetUseFormatCookie();
			}

			if ( strlen( trim( $mobileUrlTemplate ) ) ) {
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
		if ( !$this->toggleViewChecked ) {
			$this->toggleViewChecked = true;
			$mobileAction = $this->getMobileAction();
			if ( $mobileAction == 'toggle_view_desktop' ) {
				$this->toggleView( 'desktop' );
			} elseif ( $mobileAction == 'toggle_view_mobile' ) {
				$this->toggleView( 'mobile' );
			}
		}
	}

	/**
	 * Determine whether or not a given URL is local
	 *
	 * @param string $url URL to check against
	 * @return bool
	 */
	public function isLocalUrl( $url ) {
		$parsedTarget = wfParseUrl( $url );
		$parsedServer = wfParseUrl( $this->getMFConfig()->get( 'Server' ) );
		return $parsedTarget['host'] === $parsedServer['host'];
	}

	/**
	 * Add key/value pairs for analytics purposes to $this->analyticsLogItems
	 * @param string $key
	 * @param string $val
	 */
	public function addAnalyticsLogItem( $key, $val ) {
		$key = trim( $key );
		$val = trim( $val );
		$this->analyticsLogItems[$key] = $val;
	}

	/**
	 * Read key/value pairs for analytics purposes from $this->analyticsLogItems
	 * @return array
	 */
	public function getAnalyticsLogItems() {
		return $this->analyticsLogItems;
	}

	/**
	 * Get HTTP header string for X-Analytics
	 *
	 * This is made up of key/vaule pairs and is used for analytics
	 * purposes.
	 *
	 * @return string|bool
	 */
	public function getXAnalyticsHeader() {
		$response = $this->getRequest()->response();
		$currentHeader = method_exists( $response, 'getHeader' ) ?
			$response->getHeader( 'X-Analytics' ) : '';
		parse_str( preg_replace( '/; */', '&', $currentHeader ), $logItems );
		$logItems += $this->getAnalyticsLogItems();
		if ( count( $logItems ) ) {
			$xanalytics_items = array();
			foreach ( $logItems as $key => $val ) {
				$xanalytics_items[] = urlencode( $key ) . "=" . urlencode( $val );
			}
			$headerValue = implode( ';', $xanalytics_items );
			return "X-Analytics: $headerValue";
		} else {
			return false;
		}
	}

	/**
	 * Take a key/val pair in string format and add it to $this->analyticsLogItems
	 *
	 * @param string $xanalytics_item In the format key=value
	 */
	public function addAnalyticsLogItemFromXAnalytics( $xanalytics_item ) {
		list( $key, $val ) = explode( '=', $xanalytics_item, 2 );
		$this->addAnalyticsLogItem( urldecode( $key ), urldecode( $val ));
	}

	/**
	 * Adds analytics log items if the user is in alpha or beta mode
	 *
	 * Invoked from MobileFrontendHooks::onRequestContextCreateSkin()
	 */
	public function logMobileMode() {
		if ( $this->isAlphaGroupMember() ) {
			$this->addAnalyticsLogItem( 'mf-m', 'a' );
		} elseif ( $this->isBetaGroupMember() ) {
			$this->addAnalyticsLogItem( 'mf-m', 'b' );
		}
	}
}
