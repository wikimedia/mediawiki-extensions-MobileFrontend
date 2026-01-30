<?php

use MediaWiki\Config\Config;
use MediaWiki\Context\ContextSource;
use MediaWiki\Context\IContextSource;
use MediaWiki\Context\RequestContext;
use MediaWiki\MediaWikiServices;
use MediaWiki\Utils\UrlUtils;
use MobileFrontend\Amc\UserMode;
use MobileFrontend\Devices\DeviceDetectorService;
use MobileFrontend\WMFBaseDomainExtractor;

/**
 * Provide various request-dependant methods to use in mobile context
 */
class MobileContext extends ContextSource {
	public const STOP_MOBILE_REDIRECT_COOKIE_NAME = 'stopMobileRedirect';
	public const USEFORMAT_COOKIE_NAME = 'mf_useformat';
	// Keep in sync with https://wikitech.wikimedia.org/wiki/X-Analytics.
	private const ANALYTICS_HEADER_KEY = 'mf-m';
	private const ANALYTICS_HEADER_DELIMITER = ',';
	private const ANALYTICS_HEADER_VALUE_AMC = 'amc';

	/**
	 * Save explicitly requested format
	 */
	protected ?string $useFormat = null;

	/**
	 * Key/value pairs of things to add to X-Analytics response header for analytics
	 * @var array[]
	 */
	protected array $analyticsLogItems = [];

	/**
	 * The memoized result of `MobileContext#isMobileDevice`.
	 *
	 * This defaults to `null`, meaning that `MobileContext#isMobileDevice` has
	 * yet to be called.
	 *
	 * @see MobileContext#isMobileDevice
	 */
	private ?bool $isMobileDevice = null;

	/**
	 * Saves requested Mobile action
	 */
	protected ?string $mobileAction = null;

	/**
	 * Save whether the mobile view is explicitly requested
	 */
	private bool $forceMobileView = false;

	/**
	 * Save whether we should display the mobile view
	 */
	private ?bool $mobileView = null;

	/**
	 * Have we already checked for desktop/mobile view toggling?
	 */
	private bool $toggleViewChecked = false;

	private static ?self $instance = null;

	/**
	 * @var string|null What to switch the view to
	 */
	private ?string $viewChange = null;

	/**
	 * @var string|null Domain to use for the stopMobileRedirect cookie
	 */
	public static ?string $mfStopRedirectCookieHost = null;

	/**
	 * In-process cache for checking whether the current wiki has a mobile URL that's
	 * different from the desktop one.
	 */
	private ?bool $hasMobileUrl = null;

	/**
	 * Returns the actual MobileContext Instance or create a new if no exists
	 * @deprecated use MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
	 * @return self
	 */
	public static function singleton() {
		if ( !self::$instance ) {
			self::$instance = new self(
				RequestContext::getMain(),
				MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' )
			);
		}
		return self::$instance;
	}

	/**
	 * Resets the singleton instance.
	 */
	public static function resetInstanceForTesting() {
		self::$instance = null;
	}

	protected function __construct(
		IContextSource $context,
		private readonly Config $config,
	) {
		$this->setContext( $context );
	}

	/**
	 * Detects whether the UA is sending the request from a device and, if so,
	 * whether to display the mobile view to that device.
	 *
	 * The mobile view will always be displayed to mobile devices. However, it
	 * will only be displayed to tablet devices if `$wgMFShowMobileViewToTablets`
	 * is truthy.
	 *
	 * @fixme This should be renamed to something more appropriate, e.g.
	 * `shouldDisplayMobileViewToDevice`.
	 *
	 * @see MobileContext::shouldDisplayMobileView
	 *
	 * @return bool
	 */
	public function isMobileDevice() {
		if ( $this->isMobileDevice !== null ) {
			return $this->isMobileDevice;
		}

		$this->isMobileDevice = false;

		$properties = DeviceDetectorService::factory( $this->config )
			->detectDeviceProperties( $this->getRequest(), $_SERVER );

		if ( $properties ) {
			$showMobileViewToTablets = $this->config->get( 'MFShowMobileViewToTablets' );

			$this->isMobileDevice =
				$properties->isMobileDevice()
				|| ( $properties->isTabletDevice() && $showMobileViewToTablets );
		}

		return $this->isMobileDevice;
	}

	/**
	 * Save whether mobile view should always be enforced
	 * @param bool $value should mobile view be enforced?
	 */
	public function setForceMobileView( $value ) {
		$this->forceMobileView = $value;
	}

	/**
	 * Whether the current user has advanced mobile contributions enabled.
	 * @return bool
	 */
	private static function isAmcUser() {
		$services = MediaWikiServices::getInstance();
		/** @var UserMode $userMode */
		$userMode = $services->getService( 'MobileFrontend.AMC.UserMode' );
		return $userMode->isEnabled();
	}

	/**
	 * Determine whether we should display the mobile view
	 *
	 * Step through the hierarchy of what should or should not trigger
	 * the mobile view.
	 *
	 * Primacy is given to the page action - we will never show the mobile view
	 * for page edits or page history. 'useformat' request param is then
	 * honored, followed by cookie settings, then actual device detection,
	 * finally falling back on false.
	 * @return bool
	 */
	public function shouldDisplayMobileView() {
		if ( $this->mobileView === null ) {
			// Compute viewChange, to toggle between mobile/desktop view
			$this->checkToggleView();
			$this->mobileView = $this->shouldDisplayMobileViewInternal();
		}
		return $this->mobileView;
	}

	/**
	 * Value for shouldDisplayMobileView()
	 * @return bool
	 */
	private function shouldDisplayMobileViewInternal() {
		// May be overridden programmatically
		if ( $this->forceMobileView ) {
			return true;
		}

		// always display the desktop or mobile view if it's explicitly requested
		$useFormat = $this->getUseFormat();
		if ( $useFormat === 'desktop' ) {
			return false;
		} elseif ( $useFormat === 'mobile' ) {
			return true;
		}

		if ( $this->getRequest()->getRawVal( 'mobileformat' ) !== null ) {
			return true;
		}

		/**
		 * If a user is accessing the site from a mobile domain, then we should
		 * always display the mobile version of the site (otherwise, the cache
		 * may get polluted). See
		 * https://phabricator.wikimedia.org/T48473
		 */
		if ( $this->usingMobileDomain() ) {
			return true;
		}

		// check cookies for what to display
		$useMobileFormat = $this->getUseFormatCookie();
		if ( $useMobileFormat === 'true' ) {
			return true;
		}
		$stopMobileRedirect = $this->getStopMobileRedirectCookie();
		if ( $stopMobileRedirect === 'true' ) {
			return false;
		}

		// do device detection
		if ( $this->isMobileDevice() ) {
			return true;
		}

		return false;
	}

	/**
	 * Get requested mobile action
	 * @return string
	 */
	public function getMobileAction() {
		if ( $this->mobileAction === null ) {
			$this->mobileAction = $this->getRequest()->getRawVal( 'mobileaction' );
		}

		return $this->mobileAction;
	}

	/**
	 * Gets the value of the `useformat` query string parameter.
	 *
	 * @return string Typically "desktop" or "mobile"
	 */
	private function getUseFormat() {
		if ( $this->useFormat === null ) {
			$this->useFormat = $this->getRequest()->getRawVal( 'useformat' );
		}
		return $this->useFormat;
	}

	/**
	 * Set Cookie to stop automatically redirect to mobile page
	 * @param int|null $expiry Expire time of cookie
	 */
	public function setStopMobileRedirectCookie( $expiry = null ) {
		$this->getRequest()->response()->setCookie(
			self::STOP_MOBILE_REDIRECT_COOKIE_NAME,
			'true',
			$expiry ?? $this->getUseFormatCookieExpiry(),
			[
				'domain' => $this->getStopMobileRedirectCookieDomain(),
				'prefix' => '',
				'secure' => (bool)$this->config->get( 'MFStopMobileRedirectCookieSecureValue' ),
			]
		);
	}

	/**
	 * Remove cookie and continue automatic redirect to mobile page
	 */
	public function unsetStopMobileRedirectCookie() {
		if ( $this->getStopMobileRedirectCookie() === null ) {
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
		return $this->getRequest()
			->getCookie( self::STOP_MOBILE_REDIRECT_COOKIE_NAME, '' );
	}

	/**
	 * This cookie can determine whether a user should see the mobile
	 * version of a page.
	 *
	 * @return string|null
	 */
	public function getUseFormatCookie() {
		return $this->getRequest()->getCookie( self::USEFORMAT_COOKIE_NAME, '' );
	}

	/**
	 * Return the base level domain or IP address
	 *
	 * @return string|null
	 */
	public function getCookieDomain() {
		return ( new WMFBaseDomainExtractor() )->getCookieDomain( $this->config->get( 'Server' ) );
	}

	/**
	 * Determine the correct domain to use for the stopMobileRedirect cookie
	 *
	 * Will use $wgMFStopRedirectCookieHost if it's set, otherwise will use
	 * the result of getCookieDomain()
	 * @return string|null
	 */
	public function getStopMobileRedirectCookieDomain() {
		$mfStopRedirectCookieHost = $this->config->get( 'MFStopRedirectCookieHost' );

		if ( !$mfStopRedirectCookieHost ) {
			self::$mfStopRedirectCookieHost = $this->getCookieDomain();
		} else {
			self::$mfStopRedirectCookieHost = $mfStopRedirectCookieHost;
		}

		return self::$mfStopRedirectCookieHost;
	}

	/**
	 * Set the mf_useformat cookie
	 *
	 * This cookie can determine whether a user should see the mobile
	 * version of pages.
	 *
	 * @param string $cookieFormat should user see the mobile version of pages?
	 * @param int|null $expiry Expiration of cookie
	 */
	public function setUseFormatCookie( $cookieFormat = 'true', $expiry = null ) {
		$this->getRequest()->response()->setCookie(
			self::USEFORMAT_COOKIE_NAME,
			$cookieFormat,
			$expiry ?? $this->getUseFormatCookieExpiry(),
			[
				'prefix' => '',
				'httpOnly' => true,
			]
		);
		$stats = MediaWikiServices::getInstance()->getStatsdDataFactory();
		$stats->updateCount( 'mobile.useformat_' . $cookieFormat . '_cookie_set', 1 );
	}

	/**
	 * Remove cookie based saved useformat value
	 */
	public function unsetUseFormatCookie() {
		if ( $this->getUseFormatCookie() === null ) {
			return;
		}

		// set expiration date in the past
		$expire = $this->getUseFormatCookieExpiry( time(), -3600 );
		$this->setUseFormatCookie( '', $expire );
	}

	/**
	 * Get the expiration time for the mf_useformat cookie
	 *
	 * @param int|null $startTime The base time (in seconds since Epoch) from which to calculate
	 *  cookie expiration. If null, time() is used.
	 * @param int|null $cookieDuration The time (in seconds) the cookie should last
	 * @return int The time (in seconds since Epoch) that the cookie should expire
	 */
	protected function getUseFormatCookieExpiry( $startTime = null, $cookieDuration = null ) {
		// use $cookieDuration if it's valid
		if ( intval( $cookieDuration ) === 0 ) {
			$cookieDuration = $this->getUseFormatCookieDuration();
		}

		// use $startTime if it's valid
		if ( intval( $startTime ) === 0 ) {
			$startTime = time();
		}

		return $startTime + $cookieDuration;
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
			$this->config->get( 'MobileFrontendFormatCookieExpiry' );

		return ( abs( (int)$mobileFrontendFormatCookieExpiry ) > 0 )
			? $mobileFrontendFormatCookieExpiry
			: $this->getConfig()->get( 'CookieExpiration' );
	}

	/**
	 * Returns the callback from $wgMobileUrlCallback, which changes
	 *   a desktop domain into a mobile domain.
	 * @return callable|null
	 * @phan-return callable(string):string|null
	 */
	private function getMobileUrlCallback(): ?callable {
		return $this->config->get( 'MobileUrlCallback' );
	}

	/**
	 * True if the current wiki has separate mobile and desktop domains (regardless
	 * of which domain is used by the current request).
	 */
	public function hasMobileDomain(): bool {
		if ( $this->hasMobileUrl !== null ) {
			return $this->hasMobileUrl;
		}

		$mobileUrlCallback = $this->getMobileUrlCallback();
		if ( $mobileUrlCallback ) {
			$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
			$server = $urlUtils->expand( $this->getConfig()->get( 'Server' ), PROTO_CANONICAL ) ?? '';
			$host = $urlUtils->parse( $server )['host'] ?? '';
			$mobileDomain = $mobileUrlCallback( $host );
			$this->hasMobileUrl = $mobileDomain !== $host;
		} else {
			$this->hasMobileUrl = false;
		}

		return $this->hasMobileUrl;
	}

	/**
	 * Take a URL and return the equivalent mobile URL (ie. replace the domain with the
	 * mobile domain).
	 *
	 * Typically, this is a URL for the current wiki, but it can be anything as long as
	 * $wgMobileUrlCallback can convert its domain (so e.g. interwiki links can be
	 * converted). If the domain is already a mobile domain, or not recognized by
	 * $wgMobileUrlCallback, or the wiki does not use mobile domains, and so
	 * $wgMobileUrlCallback is not set, the URL will be returned unchanged (except
	 * $forceHttps will still be applied).
	 *
	 * @param string $url URL to convert
	 * @param bool $forceHttps Force HTTPS, even if the original URL used HTTP
	 * @return string|bool
	 */
	public function getMobileUrl( $url, $forceHttps = false ) {
		$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
		$parsedUrl = $urlUtils->parse( $url );
		// if parsing failed, maybe it's a local Url, try to expand and reparse it - task T107505
		if ( !$parsedUrl ) {
			$expandedUrl = $urlUtils->expand( $url, PROTO_CURRENT );
			if ( $expandedUrl ) {
				$parsedUrl = $urlUtils->parse( $expandedUrl );
			}
			if ( !$expandedUrl || !$parsedUrl ) {
				return false;
			}
		}

		$mobileUrlCallback = $this->getMobileUrlCallback();
		if ( $mobileUrlCallback ) {
			$parsedUrl['host'] = $mobileUrlCallback( $parsedUrl['host'] );
		}
		if ( $forceHttps ) {
			$parsedUrl['scheme'] = 'https';
			$parsedUrl['delimiter'] = '://';
		}

		return UrlUtils::assemble( $parsedUrl );
	}

	/**
	 * Checks whether the current request is using the mobile domain.
	 *
	 * This assumes that some infrastructure outside MediaWiki will set a
	 * header (specified by $wgMFMobileHeader) on requests which should use the
	 * mobile format. This means that the traffic routing layer can rewrite
	 * any m-dot hostnames to be canonical, allowing non-MobileFrontend-aware
	 * code in MediaWiki to work as-is.
	 *
	 * @return bool
	 */
	public function usingMobileDomain() {
		$mobileHeader = $this->config->get( 'MFMobileHeader' );
		return ( $mobileHeader
			&& $this->getRequest()->getHeader( $mobileHeader ) !== false
		);
	}

	/**
	 * Take a URL and return a copy that removes any mobile tokens.
	 *
	 * This only works with URLs of the current wiki.
	 *
	 * @param string $url representing a page on the mobile domain e.g. `https://en.m.wikipedia.org/`
	 * @return string (absolute url)
	 */
	public function getDesktopUrl( $url ) {
		$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
		$parsedUrl = $urlUtils->parse( $url ) ?? [];
		$this->updateDesktopUrlHost( $parsedUrl );
		$this->updateDesktopUrlQuery( $parsedUrl );

		return UrlUtils::assemble( $parsedUrl );
	}

	/**
	 * Update the host of a given URL to strip out any mobile tokens
	 * @param array &$parsedUrl Result of parseUrl() or UrlUtils::parse()
	 */
	protected function updateDesktopUrlHost( array &$parsedUrl ) {
		if ( !$this->hasMobileDomain() ) {
			return;
		}

		$parsedWgServer = MediaWikiServices::getInstance()->getUrlUtils()
			->parse( $this->getConfig()->get( 'Server' ) );
		$parsedUrl['host'] = $parsedWgServer['host'] ?? '';
	}

	/**
	 * Update the query portion of a given URL to remove any 'useformat' params
	 * @param array &$parsedUrl Result of parseUrl() or UrlUtils::parse()
	 */
	protected function updateDesktopUrlQuery( array &$parsedUrl ) {
		if ( isset( $parsedUrl['query'] ) && strpos( $parsedUrl['query'], 'useformat' ) !== false ) {
			$query = wfCgiToArray( $parsedUrl['query'] );
			unset( $query['useformat'] );
			$parsedUrl['query'] = wfArrayToCgi( $query );
		}
	}

	/**
	 * Toggles view to one specified by the user
	 *
	 * When a user requests a particular view (e.g. click 'Desktop view' on a mobile page),
	 * - apply the requested view to this particular request
	 * - set a cookie to keep them on that view for subsequent requests
	 * - redirect to strip off the 'mobileaction' parameter,
	 *   to avoid issues with CDN caching or URL sharing (T401595)
	 *
	 * @param string $view User requested particular view
	 */
	private function toggleView( $view ) {
		$this->viewChange = $view;
		$this->useFormat = $view;
	}

	/**
	 * Set the toggling cookie and redirect, as requested by toggleView()
	 */
	public function doToggling() {
		// Compute viewChange now, if not already
		$this->shouldDisplayMobileView();

		if ( !$this->viewChange ) {
			return;
		}

		$title = $this->getTitle();
		if ( !$title ) {
			return;
		}

		$query = $this->getRequest()->getQueryValues();
		unset( $query['mobileaction'] );
		unset( $query['useformat'] );
		unset( $query['title'] );
		$url = $title->getFullURL( $query, false, PROTO_CURRENT );

		if ( $this->viewChange === 'mobile' ) {
			// remove old desktop opt-in choice (if any)
			$this->unsetStopMobileRedirectCookie();

			// preserve mobile opt-in choice for future pageviews via same-domain cookie
			$this->setUseFormatCookie();

			// redirect to strip 'mobileaction' param (T401595)
			$mobileUrl = $this->getMobileUrl( $url );
			$this->getOutput()->redirect( $mobileUrl, 301 );
		} elseif ( $this->viewChange === 'desktop' ) {
			// remove old mobile opt-in choice (if any)
			if ( $this->getUseFormatCookie() === 'true' ) {
				$this->unsetUseFormatCookie();
			}

			// preserve desktop opt-in choice for future pageviews via same-domain cookie
			$this->setStopMobileRedirectCookie();

			// redirect to strip 'mobileaction' param (T401595)
			$desktopUrl = $this->getDesktopUrl( $url );
			$this->getOutput()->redirect( $desktopUrl, 301 );
		}
	}

	/**
	 * Determine whether we need to toggle the view, and toggle it
	 */
	public function checkToggleView() {
		if ( !$this->toggleViewChecked ) {
			$this->toggleViewChecked = true;
			$mobileAction = $this->getMobileAction();
			if ( $mobileAction === 'toggle_view_desktop' ) {
				$this->toggleView( 'desktop' );
			} elseif ( $mobileAction === 'toggle_view_mobile' ) {
				$this->toggleView( 'mobile' );
			}
		}
	}

	/**
	 * Determine whether a given URL is local
	 *
	 * @param string $url URL to check against
	 * @return bool
	 */
	public function isLocalUrl( $url ) {
		$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
		$parsedTargetHost = $urlUtils->parse( $url )['host'] ?? '';
		$parsedServerHost = $urlUtils->parse( $this->config->get( 'Server' ) )['host'] ?? '';
		return $parsedTargetHost === $parsedServerHost;
	}

	/**
	 * Add key/value pairs for analytics purposes to $this->analyticsLogItems. Pre-existing entries
	 * are appended to as sets delimited by commas.
	 * @param string $key for <key> in `X-Analytics: <key>=<value>`
	 * @param string $val for <value> in `X-Analytics: <key>=<value>`
	 */
	public function addAnalyticsLogItem( $key, $val ) {
		$key = trim( $key );
		$val = trim( $val );
		$items = $this->analyticsLogItems[$key] ?? [];
		if ( !in_array( $val, $items ) ) {
			$items[] = $val;
			$this->analyticsLogItems[$key] = $items;
		}
	}

	/**
	 * Read key/value pairs for analytics purposes from $this->analyticsLogItems
	 * @return array
	 */
	public function getAnalyticsLogItems() {
		return array_map(
			static function ( $val ) {
				return implode( self::ANALYTICS_HEADER_DELIMITER, $val );
			},
			$this->analyticsLogItems
		);
	}

	/**
	 * Get HTTP header string for X-Analytics
	 *
	 * This is made up of key/value pairs and is used for analytics purposes.
	 *
	 * @return string|bool
	 */
	public function getXAnalyticsHeader() {
		$response = $this->getRequest()->response();
		$currentHeader = method_exists( $response, 'getHeader' ) ?
			(string)$response->getHeader( 'X-Analytics' ) : '';
		parse_str( preg_replace( '/; */', '&', $currentHeader ), $logItems );
		$logItems += $this->getAnalyticsLogItems();
		if ( !count( $logItems ) ) {
			return false;
		}

		$items = [];
		foreach ( $logItems as $key => $val ) {
			$items[] = urlencode( $key ) . "=" . urlencode( $val );
		}
		$headerValue = implode( ';', $items );

		return "X-Analytics: $headerValue";
	}

	/**
	 * Take a key/val pair in string format and add it to $this->analyticsLogItems
	 *
	 * @param string $xanalytics_item In the format key=value
	 */
	public function addAnalyticsLogItemFromXAnalytics( $xanalytics_item ) {
		[ $key, $val ] = explode( '=', $xanalytics_item, 2 );
		$this->addAnalyticsLogItem( urldecode( $key ), urldecode( $val ) );
	}

	/**
	 * Adds analytics log items depending on which modes are enabled for the user
	 *
	 * Invoked from MobileFrontendHooks::onRequestContextCreateSkin()
	 *
	 * Making changes to what this method logs? Make sure you update the
	 * documentation for the X-Analytics header: https://wikitech.wikimedia.org/wiki/X-Analytics
	 */
	public function logMobileMode() {
		if ( self::isAmcUser() ) {
			$this->addAnalyticsLogItem( self::ANALYTICS_HEADER_KEY, self::ANALYTICS_HEADER_VALUE_AMC );
		}
	}

	/**
	 * Gets whether Wikibase descriptions should be shown in search results,
	 * and watchlists; or as taglines on article pages.
	 * Doesn't take into account whether the wikidata descriptions
	 * feature has been enabled.
	 *
	 * @param string $feature which description to show?
	 * @param Config $config
	 * @return bool
	 * @throws DomainException If `feature` isn't one that shows Wikidata descriptions. See the
	 *  `wgMFDisplayWikibaseDescriptions` configuration variable for detail
	 */
	public function shouldShowWikibaseDescriptions( $feature, Config $config ) {
		$displayWikibaseDescriptions = $config->get( 'MFDisplayWikibaseDescriptions' );
		if ( !isset( $displayWikibaseDescriptions[$feature] ) ) {
			throw new DomainException(
				"\"{$feature}\" isn't a feature that shows Wikidata descriptions."
			);
		}

		return $displayWikibaseDescriptions[$feature];
	}
}
