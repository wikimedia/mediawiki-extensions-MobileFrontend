<?php

class ExtMobileFrontend {

	public $contentFormat = '';

	/**
	 * @var Title
	 */
	public static $title;
	public static $messages = array();
	public static $htmlTitle;
	public static $dir;
	public static $code;
	public static $device;
	public static $headings;
	public static $mainPageUrl;
	public static $randomPageUrl;
	public static $format;
	public static $search;
	public static $callback;
	public static $disableImages;
	public static $enableImages;
	public static $isMainPage = false;
	public static $searchField;
	public static $disableImagesURL;
	public static $enableImagesURL;
	public static $viewNormalSiteURL;
	public static $currentURL;
	public static $displayNoticeId;
	public static $leaveFeedbackURL;
	public static $mobileRedirectFormAction;
	public static $isBetaGroupMember = false;
	public static $minifyJS = true;
	public static $hideSearchBox = false;
	public static $hideLogo = false;
	public static $hideFooter = false;
	public static $languageUrls;
	public static $wsLoginToken = '';
	public static $wsLoginFormAction = '';
	public static $isFilePage;
	public static $logoutHtml;
	public static $loginHtml;
	public static $zeroRatedBanner;
	public static $useFormatCookieName;

	protected $useFormat;

	/**
	 * @var string xDevice header information
	 */
	protected $xDevice;

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

	public static $messageKeys = array(
		'mobile-frontend-show-button',
		'mobile-frontend-hide-button',
		'mobile-frontend-empty-homepage',
		'mobile-frontend-back-to-top-of-section',
		'mobile-frontend-regular-site',
		'mobile-frontend-home-button',
		'mobile-frontend-random-button',
		'mobile-frontend-are-you-sure',
		'mobile-frontend-explain-disable',
		'mobile-frontend-disable-button',
		'mobile-frontend-back-button',
		'mobile-frontend-opt-in-message',
		'mobile-frontend-opt-in-yes-button',
		'mobile-frontend-opt-in-no-button',
		'mobile-frontend-opt-in-title',
		'mobile-frontend-opt-out-message',
		'mobile-frontend-opt-out-yes-button',
		'mobile-frontend-opt-out-no-button',
		'mobile-frontend-opt-out-title',
		'mobile-frontend-opt-in-explain',
		'mobile-frontend-opt-out-explain',
		'mobile-frontend-disable-images',
		'mobile-frontend-wml-continue',
		'mobile-frontend-wml-back',
		'mobile-frontend-enable-images',
		'mobile-frontend-featured-article',
		'mobile-frontend-news-items',
		'mobile-frontend-leave-feedback-title',
		'mobile-frontend-leave-feedback-notice',
		'mobile-frontend-leave-feedback-subject',
		'mobile-frontend-leave-feedback-message',
		'mobile-frontend-leave-feedback-cancel',
		'mobile-frontend-leave-feedback-submit',
		'mobile-frontend-leave-feedback-link-text',
		'mobile-frontend-leave-feedback',
		'mobile-frontend-feedback-page',
		'mobile-frontend-leave-feedback-thanks',
		'mobile-frontend-search-submit',
		'mobile-frontend-language',
		'mobile-frontend-username',
		'mobile-frontend-password',
		'mobile-frontend-login',
		'mobile-frontend-placeholder',
		'mobile-frontend-dismiss-notification',
		'mobile-frontend-sopa-notice',
		'mobile-frontend-clear-search',
		'mobile-frontend-footer-more',
		'mobile-frontend-footer-less',
		'mobile-frontend-footer-contact',
		'mobile-frontend-footer-sitename',
		'mobile-frontend-footer-license',
	);

	public function __construct() {
		global $wgMFConfigProperties;
		$this->wmlContext = new WmlContext();
		$this->setPropertiesFromArray( $wgMFConfigProperties );
	}

	public function requestContextCreateSkin( $context, &$skin ) {
		if ( !$this->shouldDisplayMobileView() ) {
			return true;
		}

		$skin = new SkinMobile( $this );
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
	 * Work out the site and language name from a database name
	 * @param $site string
	 * @param $lang string
	 * @return string
	 */
	public function getSite( &$site, &$lang ) {
		global $wgConf;
		wfProfileIn( __METHOD__ );
		$DB = wfGetDB( DB_MASTER );
		$DBName = $DB->getDBname();
		list( $site, $lang ) = $wgConf->siteFromDB( $DBName );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
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
	 * @param $obj Article
	 * @param $tpl MobileFrontendTemplate
	 * @return bool
	 */
	public function addMobileFooter( &$obj, &$tpl ) {
		global $wgRequest, $wgServer;
		wfProfileIn( __METHOD__ );

		$title = $obj->getTitle();
		$isSpecial = $title->isSpecialPage();

		if ( ! $isSpecial ) {
			$footerlinks = $tpl->data['footerlinks'];
			$mobileViewUrl = htmlspecialchars(
					$this->removeQueryStringParameter( $wgRequest->appendQuery( 'useformat=mobile' ), 'mobileaction' )
					);

			$mobileViewUrl = $this->getMobileUrl( $wgServer . $mobileViewUrl );
			$tpl->set( 'mobileview', "<a href='{$mobileViewUrl}' class='noprint'>" . wfMsg( 'mobile-frontend-view' ) . "</a>" );
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
		$url = preg_replace( '/(.*)(\?|&)' . $field . '=[^&]+?(&)(.*)/i', '$1$2$4', $url . '&' );
		$url = substr( $url, 0, -1 );
		wfProfileOut( __METHOD__ );
		return $url;
	}

	public function getMsg() {
		global $wgContLang, $wgRequest, $wgServer, $wgMobileRedirectFormAction, $wgOut, $wgLanguageCode;
		wfProfileIn( __METHOD__ );

		self::$disableImagesURL = $wgRequest->escapeAppendQuery( 'disableImages=1' );
		self::$enableImagesURL = $wgRequest->escapeAppendQuery( 'enableImages=1' );
		self::$viewNormalSiteURL = $this->getDesktopUrl( wfExpandUrl( $wgRequest->escapeAppendQuery( 'useformat=desktop' ) ) );
		self::$currentURL = $wgRequest->getFullRequestURL();
		self::$leaveFeedbackURL = $wgRequest->escapeAppendQuery( 'mobileaction=leave_feedback' );

		$skin = RequestContext::getMain()->getSkin();
		$copyright = $skin->getCopyright();

		// Need to stash the results of the "wfMsg" call before the Output Buffering handler
		// because at this point the database connection is shut down, etc.

		self::$messages['mobile-frontend-footer-copyright'] = $copyright;

		foreach ( self::$messageKeys as $messageKey ) {

			if ( $messageKey == 'mobile-frontend-leave-feedback-notice' ) {
				$linkText = wfMsg( 'mobile-frontend-leave-feedback-link-text' );
				$linkTarget = wfMsgNoTrans( 'mobile-frontend-feedback-page' );
				self::$messages[$messageKey] = wfMsgExt( $messageKey, array( 'replaceafter' ), Html::element( 'a', array( 'href' => Title::newFromText( $linkTarget )->getFullURL(), 'target' => '_blank' ), $linkText ) );
			} elseif ( $messageKey == 'mobile-frontend-feedback-page' ) {
				self::$messages[$messageKey] = wfMsgNoTrans( $messageKey );
			} else {
				self::$messages[$messageKey] = wfMsg( $messageKey );
			}
		}

		self::$dir = $wgContLang->getDir();
		self::$code = $wgContLang->getCode();

		$languageUrls = array();

		$languageUrls[] = array(
			'href' => self::$currentURL,
			'text' => self::$htmlTitle,
			'language' => $wgContLang->getLanguageName( $wgLanguageCode ),
			'class' => 'interwiki-' . $wgLanguageCode,
			'lang' => $wgLanguageCode,
		);

		foreach ( $wgOut->getLanguageLinks() as $l ) {
			$tmp = explode( ':', $l, 2 );
			$class = 'interwiki-' . $tmp[0];
			$lang = $tmp[0];
			unset( $tmp );
			$nt = Title::newFromText( $l );
			if ( $nt ) {
				$languageUrl = $this->getMobileUrl( $nt->getFullURL() );
				$languageUrls[] = array(
					'href' => $languageUrl,
					'text' => ( $wgContLang->getLanguageName( $nt->getInterwiki() ) != ''
							? $wgContLang->getLanguageName( $nt->getInterwiki() )
							: $l ),
					'language' => $wgContLang->getLanguageName( $lang ),
					'class' => $class,
					'lang' => $lang,
				);
			}
		}

		self::$languageUrls = $languageUrls;

		self::$mobileRedirectFormAction = ( $wgMobileRedirectFormAction !== false )
				? $wgMobileRedirectFormAction
				: "{$wgServer}/w/mobileRedirect.php";

		self::$mainPageUrl = Title::newMainPage()->getLocalUrl();
		self::$randomPageUrl = $this->getRelativeURL( SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl() );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * Invocation of BeforePageRedirect hook.
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
	 * @param $text String
	 * @return bool
	 */
	public function beforePageDisplayHTML( &$out ) {
		global $wgRequest, $wgUser;
		wfProfileIn( __METHOD__ );

		// Note: The WebRequest Class calls are made in this block because
		// since PHP 5.1.x, all objects have their destructors called
		// before the output buffer callback function executes.
		// Thus, globalized objects will not be available as expected in the function.
		// This is stated to be intended behavior, as per the following: [http://bugs.php.net/bug.php?id=40104]

		$xDevice = $this->getXDevice();
		$this->checkUseFormatCookie();
		$useFormat = $this->getUseFormat();
		$this->wmlContext->setUseFormat( $useFormat );
		$mobileAction = $this->getMobileAction();

		if ( !$this->shouldDisplayMobileView() ) {
			wfProfileOut( __METHOD__ );
			return true;
		}

		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		$acceptHeader = isset( $_SERVER["HTTP_ACCEPT"] ) ? $_SERVER["HTTP_ACCEPT"] : '';
		self::$title = $out->getTitle();

		if ( self::$title->isMainPage() ) {
			self::$isMainPage = true;
		}
		if ( self::$title->getNamespace() == NS_FILE ) {
			self::$isFilePage = true;
		}

		self::$htmlTitle = $out->getHTMLTitle();
		self::$disableImages = $wgRequest->getText( 'disableImages', 0 );
		self::$enableImages = $wgRequest->getText( 'enableImages', 0 );
		self::$displayNoticeId = $wgRequest->getText( 'noticeid', '' );

		if ( self::$disableImages == 1 ) {
			$wgRequest->response()->setcookie( 'disableImages', 1 );
			$location = str_replace( '?disableImages=1', '', str_replace( '&disableImages=1', '', $wgRequest->getFullRequestURL() ) );
			$location = str_replace( '&mfi=1', '', str_replace( '&mfi=0', '', $location ) );
			$location = $this->getRelativeURL( $location );
			$wgRequest->response()->header( 'Location: ' . $location . '&mfi=0' );
		} elseif ( self::$disableImages == 0 ) {
			$disableImages = $wgRequest->getCookie( 'disableImages' );
			if ( $disableImages ) {
				self::$disableImages = $disableImages;
			}
		}

		if ( self::$enableImages == 1 ) {
			$disableImages = $wgRequest->getCookie( 'disableImages' );
			if ( $disableImages ) {
				$wgRequest->response()->setcookie( 'disableImages', '' );
			}
			$location = str_replace( '?enableImages=1', '', str_replace( '&enableImages=1', '', $wgRequest->getFullRequestURL() ) );
			$location = str_replace( '&mfi=1', '', str_replace( '&mfi=0', '', $location ) );
			$location = $this->getRelativeURL( $location );
			$wgRequest->response()->header( 'Location: ' . $location . '&mfi=1' );
		}

		self::$format = $wgRequest->getText( 'format' );
		self::$callback = $wgRequest->getText( 'callback' );
		$this->wmlContext->setRequestedSegment( $wgRequest->getInt( 'seg', 0 ) );
		self::$search = $wgRequest->getText( 'search' );
		self::$searchField = $wgRequest->getText( 'search', '' );

		$device = new DeviceDetection();

		if ( $xDevice ) {
			$formatName = $xDevice;
		} else {
			$formatName = $device->formatName( $userAgent, $acceptHeader );
		}

		self::$device = $device->format( $formatName );
		$this->checkUserStatus();
		$this->setDefaultLogo();

		// honor useformat=mobile-wap if it's set, otherwise determine by device
		$viewFormat = ( $this->getUseFormat() == 'mobile-wap' ) ? 'mobile-wap' : self::$device['view_format'];
		$this->contentFormat = self::parseContentFormat( $viewFormat );

		if ( $mobileAction == 'leave_feedback' ) {
			echo $this->renderLeaveFeedbackXHTML();
			wfProfileOut( __METHOD__ );
			exit();
		}

		if ( $mobileAction == 'leave_feedback_post' ) {

			$this->getMsg();

			$subject = $wgRequest->getText( 'subject', '' );
			$message = $wgRequest->getText( 'message', '' );
			$token = $wgRequest->getText( 'edittoken', '' );

			$title = Title::newFromText( self::$messages['mobile-frontend-feedback-page'] );

			if ( $title->userCan( 'edit' ) &&
				!$wgUser->isBlockedFrom( $title ) &&
				$wgUser->matchEditToken( $token ) ) {
				$article = new Article( $title, 0 );
				$rawtext = $article->getRawText();
				$rawtext .= "\n== {$subject} == \n {$message} ~~~~ \n <small>User agent: {$userAgent}</small> ";
				$article->doEdit( $rawtext, '' );
			}

			$location = str_replace( '&mobileaction=leave_feedback_post', '', $wgRequest->getFullRequestURL() . '&noticeid=1&useformat=mobile' );
			$location = $this->getRelativeURL( $location );
			$wgRequest->response()->header( 'Location: ' . $location );
			wfProfileOut( __METHOD__ );
			exit();
		}

		if ( $mobileAction == 'opt_in_mobile_site' && $this->contentFormat == 'XHTML' ) {
			echo $this->renderOptInMobileSiteXHTML();
			wfProfileOut( __METHOD__ );
			exit();
		}

		if ( $mobileAction == 'opt_out_mobile_site' && $this->contentFormat == 'XHTML' ) {
			echo $this->renderOptOutMobileSiteXHTML();
			wfProfileOut( __METHOD__ );
			exit();
		}

		if ( $mobileAction == 'opt_in_cookie' ) {
			wfIncrStats( 'mobile.opt_in_cookie_set' );
			$this->setOptInOutCookie( '1' );
			$this->disableCaching();
			$location = wfExpandUrl( Title::newMainPage()->getFullURL(), PROTO_CURRENT );
			$wgRequest->response()->header( 'Location: ' . $location );
		}

		if ( $mobileAction == 'opt_out_cookie' ) {
			$this->setOptInOutCookie( '' );
		}

		$this->getMsg();
		$this->disableCaching();
		$this->sendXDeviceVaryHeader();
		$this->sendApplicationVersionVaryHeader();
		$this->checkUserLoggedIn();

		if ( self::$title->isSpecial( 'Userlogin' ) ) {
			self::$wsLoginToken = $wgRequest->getSessionData( 'wsLoginToken' );
			$q = array( 'action' => 'submitlogin', 'type' => 'login' );
			$returnToVal = $wgRequest->getVal( 'returnto' );

			if ( $returnToVal ) {
				$q['returnto'] = $returnToVal;
			}

			self::$wsLoginFormAction = self::$title->getLocalURL( $q );
		}

		wfProfileOut( __METHOD__ );
		return true;
	}

	public static function parseContentFormat( $format ) {
		if ( $format === 'wml' ) {
			return 'WML';
		} elseif ( $format === 'html' ) {
			return 'XHTML';
		}
		if ( $format === 'mobile-wap' ) {
			return 'WML';
		}
		return 'XHTML';
	}

	/**
	 * @return bool
	 */
	private function checkUserLoggedIn() {
		global $wgUser, $wgCookieDomain, $wgRequest, $wgCookiePrefix;
		wfProfileIn( __METHOD__ );
		$tempWgCookieDomain = $wgCookieDomain;
		$wgCookieDomain = $this->getBaseDomain();
		$tempWgCookiePrefix = $wgCookiePrefix;
		$wgCookiePrefix = '';

		if ( $wgUser->isLoggedIn() ) {
			$wgRequest->response()->setcookie( 'mfsecure', '1', 0, '' );
		} else {
			$mfSecure = $wgRequest->getCookie( 'mfsecure', '' );
			if ( $mfSecure && $mfSecure == '1' ) {
				$wgRequest->response()->setcookie( 'mfsecure', '', 0, '' );
			}
		}

		$wgCookieDomain = $tempWgCookieDomain;
		$wgCookiePrefix = $tempWgCookiePrefix;
		wfProfileOut( __METHOD__ );
		return true;
	}

	private function checkUserStatus() {
		global $wgRequest;
		wfProfileIn( __METHOD__ );

		$hideSearchBox = $wgRequest->getInt( 'hidesearchbox' );

		if ( $hideSearchBox === 1 ) {
			self::$hideSearchBox = true;
		}

		$hideLogo = $wgRequest->getInt( 'hidelogo' );

		if ( $hideLogo === 1 ) {
			self::$hideLogo = true;
		}

		if ( !empty( $_SERVER['HTTP_APPLICATION_VERSION'] ) &&
			strpos( $_SERVER['HTTP_APPLICATION_VERSION'], 'Wikipedia Mobile' ) !== false ) {
			self::$hideSearchBox = true;
			if ( strpos( $_SERVER['HTTP_APPLICATION_VERSION'], 'Android' ) !== false ) {
				self::$hideLogo = true;
			}
		}

		if ( self::$hideLogo == true ) {
			self::$hideFooter = true;
		}

		$optInCookie = $this->getOptInOutCookie();
		if ( !empty( $optInCookie ) &&
			$optInCookie == 1 ) {
			self::$isBetaGroupMember = true;
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $value string
	 * @return bool
	 */
	private function setOptInOutCookie( $value ) {
		global $wgCookieDomain, $wgRequest, $wgCookiePrefix;
		wfProfileIn( __METHOD__ );
		$tempWgCookieDomain = $wgCookieDomain;
		$wgCookieDomain = $this->getBaseDomain();
		$tempWgCookiePrefix = $wgCookiePrefix;
		$wgCookiePrefix = '';
		$wgRequest->response()->setcookie( 'optin', $value, 0, '' );
		$wgCookieDomain = $tempWgCookieDomain;
		$wgCookiePrefix = $tempWgCookiePrefix;
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @return Mixed
	 */
	private function getOptInOutCookie() {
		global $wgRequest;
		wfProfileIn( __METHOD__ );
		$optInCookie = $wgRequest->getCookie( 'optin', '' );
		wfProfileOut( __METHOD__ );
		return $optInCookie;
	}

	/**
	 * @return string
	 */
	private function getBaseDomain() {
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
	 * @param $url string
	 * @return string
	 */
	private function getRelativeURL( $url ) {
		wfProfileIn( __METHOD__ );
		$parsedUrl = parse_url( $url );
		// Validates value as IP address
		if ( !empty( $parsedUrl['host'] ) && !IP::isValid( $parsedUrl['host'] ) ) {
			$baseUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
			$baseUrl = str_replace( $baseUrl, '', $url );
			wfProfileOut( __METHOD__ );
			return $baseUrl;
		}
		wfProfileOut( __METHOD__ );
		return $url;
	}

	/**
	 * Disables caching if the request is coming from a trusted proxy
	 * @return bool
	 */
	private function disableCaching() {
		global $wgRequest;
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
		$trustedProxyCheckFunction = ( function_exists( 'wfIsConfiguredProxy' ) ) ? 'wfIsConfiguredProxy' : 'wfIsTrustedProxy';
		if ( $trustedProxyCheckFunction( $ip ) ) {
			$wgRequest->response()->header( 'Cache-Control: no-cache, must-revalidate' );
			$wgRequest->response()->header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' );
			$wgRequest->response()->header( 'Pragma: no-cache' );
		}

		wfProfileOut( __METHOD__ );
		return true;
	}

	private function sendXDeviceVaryHeader() {
		global $wgOut, $wgRequest;
		wfProfileIn( __METHOD__ );
		if ( isset( $_SERVER['HTTP_X_DEVICE'] ) ) {
			$wgRequest->response()->header( 'X-Device: ' . $_SERVER['HTTP_X_DEVICE'] );
			$wgOut->addVaryHeader( 'X-Device' );
		}
		$wgOut->addVaryHeader( 'Cookie' );
		$wgOut->addVaryHeader( 'X-Carrier' );
		$wgOut->addVaryHeader( 'X-Images' );
		wfProfileOut( __METHOD__ );
		return true;
	}

	private function sendApplicationVersionVaryHeader() {
		global $wgOut, $wgRequest;
		wfProfileIn( __METHOD__ );
		$wgOut->addVaryHeader( 'Application_Version' );
		if ( isset( $_SERVER['HTTP_APPLICATION_VERSION'] ) ) {
			$wgRequest->response()->header( 'Application_Version: ' . $_SERVER['HTTP_APPLICATION_VERSION'] );
		} else {
			if ( isset( $_SERVER['HTTP_X_DEVICE'] ) ) {
				if ( stripos( $_SERVER['HTTP_X_DEVICE'], 'iphone' ) !== false ||
					stripos( $_SERVER['HTTP_X_DEVICE'], 'android' ) !== false ) {
					$wgRequest->response()->header( 'Application_Version: ' . $_SERVER['HTTP_X_DEVICE'] );
				}
			}
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @return string
	 */
	private function renderLeaveFeedbackXHTML() {
		global $wgRequest, $wgUser;
		wfProfileIn( __METHOD__ );
		if ( $this->contentFormat == 'XHTML' ) {
			$this->getMsg();
			$searchTemplate = $this->getSearchTemplate();
			$searchWebkitHtml = $searchTemplate->getHTML();
			$footerTemplate = $this->getFooterTemplate();
			$footerHtml = $footerTemplate->getHTML();
			$leaveFeedbackTemplate = new LeaveFeedbackTemplate();
			$options = array(
							'feedbackPostURL' => str_replace( '&mobileaction=leave_feedback', '', $wgRequest->getFullRequestURL() ) . '&mobileaction=leave_feedback_post',
							'editToken' => $wgUser->getEditToken(),
							'title' => self::$messages['mobile-frontend-leave-feedback-title'],
							'notice' => self::$messages['mobile-frontend-leave-feedback-notice'],
							'subject' => self::$messages['mobile-frontend-leave-feedback-subject'],
							'message' => self::$messages['mobile-frontend-leave-feedback-message'],
							'cancel' => self::$messages['mobile-frontend-leave-feedback-cancel'],
							'submit' => self::$messages['mobile-frontend-leave-feedback-submit'],
							);
			$leaveFeedbackTemplate->setByArray( $options );
			$leaveFeedbackHtml = $leaveFeedbackTemplate->getHTML();
			$contentHtml = $leaveFeedbackHtml;
			$applicationTemplate = $this->getApplicationTemplate();
			$options = array(
							'htmlTitle' => self::$messages['mobile-frontend-leave-feedback'],
							'searchWebkitHtml' => $searchWebkitHtml,
							'contentHtml' => $contentHtml,
							'footerHtml' => $footerHtml,
							);
			$applicationTemplate->setByArray( $options );
			$applicationHtml = $applicationTemplate->getHTML();
			wfProfileOut( __METHOD__ );
			return $applicationHtml;
		}
		wfProfileOut( __METHOD__ );
		return '';
	}

	/**
	 * @return string
	 */
	private function renderOptInMobileSiteXHTML() {
		wfProfileIn( __METHOD__ );
		if ( $this->contentFormat == 'XHTML' ) {
			$this->getMsg();
			$searchTemplate = $this->getSearchTemplate();
			$searchWebkitHtml = $searchTemplate->getHTML();
			$footerTemplate = $this->getFooterTemplate();
			$footerHtml = $footerTemplate->getHTML();
			$optInTemplate = new OptInTemplate();
			$options = array(
							'explainOptIn' => self::$messages['mobile-frontend-opt-in-explain'],
							'optInMessage' => self::$messages['mobile-frontend-opt-in-message'],
							'yesButton' => self::$messages['mobile-frontend-opt-in-yes-button'],
							'noButton' => self::$messages['mobile-frontend-opt-in-no-button'],
							'formAction' => wfExpandUrl( Title::newMainPage()->getFullURL(), PROTO_CURRENT ),
							);
			$optInTemplate->setByArray( $options );
			$optInHtml = $optInTemplate->getHTML();
			$contentHtml = $optInHtml;
			$applicationTemplate = $this->getApplicationTemplate();
			$options = array(
							'htmlTitle' => self::$messages['mobile-frontend-opt-in-title'],
							'searchWebkitHtml' => $searchWebkitHtml,
							'contentHtml' => $contentHtml,
							'footerHtml' => $footerHtml,
							);
			$applicationTemplate->setByArray( $options );
			$applicationHtml = $applicationTemplate->getHTML();
			wfProfileOut( __METHOD__ );
			return $applicationHtml;
		}
		wfProfileOut( __METHOD__ );
		return '';
	}

	/**
	 * @return string
	 */
	private function renderOptOutMobileSiteXHTML() {
		wfProfileIn( __METHOD__ );
		if ( $this->contentFormat == 'XHTML' ) {
			$this->getMsg();
			$searchTemplate = $this->getSearchTemplate();
			$searchWebkitHtml = $searchTemplate->getHTML();
			$footerTemplate = $this->getFooterTemplate();
			$footerHtml = $footerTemplate->getHTML();
			$optOutTemplate = new OptOutTemplate();
			$options = array(
							'explainOptOut' => self::$messages['mobile-frontend-opt-out-explain'],
							'optOutMessage' => self::$messages['mobile-frontend-opt-out-message'],
							'yesButton' => self::$messages['mobile-frontend-opt-out-yes-button'],
							'noButton' => self::$messages['mobile-frontend-opt-out-no-button'],
							'formAction' => wfExpandUrl( Title::newMainPage()->getFullURL(), PROTO_CURRENT ),
							);
			$optOutTemplate->setByArray( $options );
			$optOutHtml = $optOutTemplate->getHTML();
			$contentHtml = $optOutHtml;
			$applicationTemplate = $this->getApplicationTemplate();
			$options = array(
							'htmlTitle' => self::$messages['mobile-frontend-opt-out-title'],
							'searchWebkitHtml' => $searchWebkitHtml,
							'contentHtml' => $contentHtml,
							'footerHtml' => $footerHtml,
							);
			$applicationTemplate->setByArray( $options );
			$applicationHtml = $applicationTemplate->getHTML();
			wfProfileOut( __METHOD__ );
			return $applicationHtml;
		}
		wfProfileOut( __METHOD__ );
		return '';
	}

	/**
	 * @return DomElement
	 */
	public function renderLogin() {
		wfProfileIn( __METHOD__ );
		$form = Html::openElement( 'form',
					array( 'name' => 'userlogin',
				   		   'method' => 'post',
				   		   'action' => self::$wsLoginFormAction ) ) .
				Html::openElement( 'table',
					array( 'class' => 'user-login' ) ) .
				Html::openElement( 'tbody' ) .
				Html::openElement( 'tr' ) .
				Html::openElement( 'td',
					array( 'class' => 'mw-label' ) ) .
				Html::element( 'label',
		 			array( 'for' => 'wpName1' ), self::$messages['mobile-frontend-username'] ) .
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
		 			array( 'for' => 'wpPassword1' ), self::$messages['mobile-frontend-password'] ) .
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
				Html::input( 'wpLoginAttempt', self::$messages['mobile-frontend-login'], 'submit',
					array( 'id' => 'wpLoginAttempt',
						   'tabindex' => '3' ) ) .
				Html::closeElement( 'td' ) .
				Html::closeElement( 'tr' ) .
				Html::closeElement( 'tbody' ) .
				Html::closeElement( 'table' ) .
				Html::input( 'wpLoginToken', self::$wsLoginToken, 'hidden' ) .
				Html::closeElement( 'form' );
		$result = $this->getDomDocumentNodeByTagName( $form, 'form' );
		wfProfileOut( __METHOD__ );
		return $result;
	}

	/**
	 * @param $html string
	 * @param $tagName string
	 * @return DomElement
	 */
	private function getDomDocumentNodeByTagName( $html, $tagName ) {
		wfProfileIn( __METHOD__ );
		libxml_use_internal_errors( true );
		$dom = new DOMDocument();
		$dom->loadHTML( $html );
		libxml_use_internal_errors( false );
		$dom->preserveWhiteSpace = false;
		$dom->strictErrorChecking = false;
		$dom->encoding = 'UTF-8';
		$node = $dom->getElementsByTagName( $tagName )->item( 0 );
		wfProfileOut( __METHOD__ );
		return $node;
	}

	/**
	 * @param $html string
	 * @return string
	 */
	public function DOMParse( $html ) {
		global $wgScript;
		wfProfileIn( __METHOD__ );

		wfProfileIn( __METHOD__ . '-formatter-init' );
		$formatter = new MobileFormatter( $html, self::$title, $this->contentFormat, $this->wmlContext );
		$formatter->useMessages( self::$messages );
		$doc = $formatter->getDoc();
		wfProfileOut( __METHOD__ . '-formatter-init' );

		wfProfileIn( __METHOD__ . '-zero' );
		$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner' );

		if ( !$zeroRatedBannerElement ) {
			$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner-red' );
		}

		if ( $zeroRatedBannerElement ) {
			self::$zeroRatedBanner = $doc->saveXML( $zeroRatedBannerElement, LIBXML_NOEMPTYTAG );
		}
		wfProfileOut( __METHOD__ . '-zero' );

		wfProfileIn( __METHOD__ . '-beta' );
		if ( self::$isBetaGroupMember ) {
			$ptLogout = $doc->getElementById( 'pt-logout' );

			if ( $ptLogout ) {
				$ptLogoutLink = $ptLogout->firstChild;
				self::$logoutHtml = $doc->saveXML( $ptLogoutLink, LIBXML_NOEMPTYTAG );
			}
			$ptAnonLogin = $doc->getElementById( 'pt-anonlogin' );

			if ( !$ptAnonLogin ) {
				$ptAnonLogin = $doc->getElementById( 'pt-login' );
			}

			if ( $ptAnonLogin ) {
				$ptAnonLoginLink = $ptAnonLogin->firstChild;
				if ( $ptAnonLoginLink && $ptAnonLoginLink->hasAttributes() ) {
					$ptAnonLoginLinkHref = $ptAnonLoginLink->getAttributeNode( 'href' );
					$ptAnonLoginLinkTitle = $ptAnonLoginLink->getAttributeNode( 'title' );
					if ( $ptAnonLoginLinkTitle ) {
						$ptAnonLoginLinkTitle->nodeValue = self::$messages['mobile-frontend-login'];
					}
					if ( $ptAnonLoginLinkHref ) {
						$ptAnonLoginLinkHref->nodeValue = str_replace( "&", "&amp;", $ptAnonLoginLinkHref->nodeValue );
					}
					$ptAnonLoginLinkText = $ptAnonLoginLink->firstChild;
					if ( $ptAnonLoginLinkText ) {
						$ptAnonLoginLinkText->nodeValue = self::$messages['mobile-frontend-login'];
					}
				}
				self::$loginHtml = $doc->saveXML( $ptAnonLoginLink, LIBXML_NOEMPTYTAG );
			}
		}
		$robotsText = '';
		$xpath = new DOMXpath( $doc );
		foreach ( $xpath->query( '//meta[@name="robots"]' ) as $tag ) {
			$robotsText .= $doc->saveXML( $tag );
		}

		if ( self::$title->isSpecial( 'Userlogin' ) ) {
			$userlogin = $doc->getElementById( 'userloginForm' );

			if ( $userlogin && get_class( $userlogin ) === 'DOMElement' ) {
				$firstHeading = $doc->getElementById( 'firstHeading' );
				if ( $firstHeading ) {
					$firstHeading->nodeValue = '';
				}
			}
		}
		wfProfileOut( __METHOD__ . '-beta' );

		wfProfileIn( __METHOD__ . '-filter' );
		$formatter->removeImages( self::$disableImages == 1 );
		$formatter->whitelistIds( 'zero-language-search' );
		$formatter->filterContent();
		wfProfileOut( __METHOD__ . '-filter' );

		wfProfileIn( __METHOD__ . '-userlogin' );
		if ( self::$title->isSpecial( 'Userlogin' ) ) {
			if ( $userlogin && get_class( $userlogin ) === 'DOMElement' ) {
				$login = $this->renderLogin();
				$loginNode = $doc->importNode( $login, true );
				$userlogin->appendChild( $loginNode );
			}
		}
		wfProfileOut( __METHOD__ . '-userlogin' );

		wfProfileIn( __METHOD__ . '-getText' );
		$formatter->setIsMainPage( self::$isMainPage );
		if ( $this->contentFormat == 'XHTML'
			&& self::$device['supports_javascript'] === true
			&& empty( self::$search ) )
		{
			$formatter->enableExpandableSections();
		}
		$contentHtml = $formatter->getText( 'content' );
		wfProfileOut( __METHOD__ . '-getText' );

		wfProfileIn( __METHOD__ . '-templates' );
		$htmlTitle = htmlspecialchars( self::$htmlTitle );
		if ( $this->contentFormat == 'WML' ) {
			header( 'Content-Type: text/vnd.wap.wml' );

			// Wml for searching
			$prepend = '<p><input emptyok="true" format="*M" type="text" name="search" value="" size="16" />' .
				'<do type="accept" label="' . self::$messages['mobile-frontend-search-submit'] . '">' .
				'<go href="' . $wgScript . '?title=Special%3ASearch&amp;search=$(search)"></go></do></p>';
			$html = $prepend . $html;

			$applicationWmlTemplate = new ApplicationWmlTemplate();
			$options = array(
							'mainPageUrl' => self::$mainPageUrl,
							'randomPageUrl' => self::$randomPageUrl,
							'dir' => self::$dir,
							'code' => self::$code,
							'contentHtml' => $contentHtml,
							'homeButton' => self::$messages['mobile-frontend-home-button'],
							'randomButton' => self::$messages['mobile-frontend-random-button'],
							);
			$applicationWmlTemplate->setByArray( $options );
			$applicationHtml = $applicationWmlTemplate->getHTML();
		}

		if ( $this->contentFormat == 'XHTML' && self::$format != 'json' ) {
			if ( !empty( self::$displayNoticeId ) ) {
				if ( intval( self::$displayNoticeId ) === 1 ) {
					$thanksNoticeTemplate = new ThanksNoticeTemplate();
					$thanksNoticeTemplate->set( 'messages', self::$messages );
					$noticeHtml = $thanksNoticeTemplate->getHTML();
				}
			}

			if ( !empty( self::$displayNoticeId ) ) {
				if ( intval( self::$displayNoticeId ) === 2 ) {
					$sopaNoticeTemplate = new SopaNoticeTemplate();
					$sopaNoticeTemplate->set( 'messages', self::$messages );
					$noticeHtml = $sopaNoticeTemplate->getHTML();
				}
			}

			// header( 'Content-Type: application/xhtml+xml; charset=utf-8' );
			$searchTemplate = $this->getSearchTemplate();
			$searchWebkitHtml = $searchTemplate->getHTML();
			$footerTemplate = $this->getFooterTemplate();
			$footerHtml = $footerTemplate->getHTML();
			$noticeHtml = ( !empty( $noticeHtml ) ) ? $noticeHtml : '';
			$applicationTemplate = $this->getApplicationTemplate();
			$options = array(
							'noticeHtml' => $noticeHtml,
							'htmlTitle' => $htmlTitle,
							'searchWebkitHtml' => $searchWebkitHtml,
							'contentHtml' => $contentHtml,
							'footerHtml' => $footerHtml,
							'robots' => $robotsText,
							);
			$applicationTemplate->setByArray( $options );
			$applicationHtml = $applicationTemplate->getHTML();
		}
		wfProfileOut( __METHOD__ . '-templates' );

		if ( self::$format === 'json' ) {
			wfProfileIn( __METHOD__ . '-json' );
			header( 'Content-Type: application/javascript' );
			header( 'Content-Disposition: attachment; filename="data.js";' );
			$json_data = array();
			$json_data['title'] = htmlspecialchars ( self::$title->getText() );
			$json_data['html'] = $contentHtml;

			$json = FormatJson::encode( $json_data );

			if ( !empty( self::$callback ) ) {
				$json = urlencode( htmlspecialchars( self::$callback ) ) . '(' . $json . ')';
			}
			wfProfileOut( __METHOD__ . '-json' );

			wfProfileOut( __METHOD__ );
			return $json;
		}

		wfProfileOut( __METHOD__ );
		return $applicationHtml;
	}

	public function getFooterTemplate() {
		global $wgExtensionAssetsPath, $wgLanguageCode;
		wfProfileIn( __METHOD__ );
		$footerTemplate = new FooterTemplate();
		$logoutHtml = ( self::$logoutHtml ) ? self::$logoutHtml : '';
		$loginHtml = ( self::$loginHtml ) ? self::$loginHtml : '';
		$options = array(
						'messages' => self::$messages,
						'leaveFeedbackURL' => self::$leaveFeedbackURL,
						'viewNormalSiteURL' => self::$viewNormalSiteURL,
						'disableImages' => self::$disableImages,
						'disableImagesURL' => self::$disableImagesURL,
						'enableImagesURL' => self::$enableImagesURL,
						'logoutHtml' => $logoutHtml,
						'loginHtml' => $loginHtml,
						'code' => self::$code,
						'language-code' => 'en',
						'copyright-symbol' => $wgLanguageCode === 'en' ? '®': '™',
						'copyright-has-logo' => $wgLanguageCode === 'en',
						'hideFooter' => self::$hideFooter,
						'wgExtensionAssetsPath' => $wgExtensionAssetsPath,
						'isBetaGroupMember' => self::$isBetaGroupMember,
						);
		$footerTemplate->setByArray( $options );
		wfProfileOut( __METHOD__ );
		return $footerTemplate;
	}

	public function getSearchTemplate() {
		global $wgExtensionAssetsPath, $wgMobileFrontendLogo;
		wfProfileIn( __METHOD__ );
		$searchTemplate = new SearchTemplate();
		$options = array(
						'viewNormalSiteURL' => self::$viewNormalSiteURL,
						'searchField' => self::$searchField,
						'mainPageUrl' => self::$mainPageUrl,
						'randomPageUrl' => self::$randomPageUrl,
						'messages' => self::$messages,
						'hideSearchBox' => self::$hideSearchBox,
						'hideLogo' => self::$hideLogo,
						'buildLanguageSelection' => self::buildLanguageSelection(),
						'device' => self::$device,
						'wgExtensionAssetsPath' => $wgExtensionAssetsPath,
						'wgMobileFrontendLogo' => $wgMobileFrontendLogo,
						);
		$searchTemplate->setByArray( $options );
		wfProfileOut( __METHOD__ );
		return $searchTemplate;
	}

	public function getApplicationTemplate() {
		global $wgAppleTouchIcon, $wgExtensionAssetsPath, $wgScriptPath, $wgCookiePath, $wgOut;
		wfProfileIn( __METHOD__ );
		if( self::$isBetaGroupMember ) {
			$wgOut->addModuleStyles( 'ext.mobileFrontendBeta' );
		} else {
			$wgOut->addModuleStyles( 'ext.mobileFrontend' );
		}
		$cssLinks = $wgOut->buildCssLinks();
		$applicationTemplate = new ApplicationTemplate();
		$options = array(
						'dir' => self::$dir,
						'code' => self::$code,
						'placeholder' => self::$messages['mobile-frontend-placeholder'],
						'dismissNotification' => self::$messages['mobile-frontend-dismiss-notification'],
						'wgAppleTouchIcon' => $wgAppleTouchIcon,
						'isBetaGroupMember' => self::$isBetaGroupMember,
						'minifyJS' => self::$minifyJS,
						'device' => self::$device,
						'cssLinks' => $cssLinks,
						'wgExtensionAssetsPath' => $wgExtensionAssetsPath,
						'wgScriptPath' => $wgScriptPath,
						'isFilePage' => self::$isFilePage,
						'zeroRatedBanner' => self::$zeroRatedBanner,
						'showText' => self::$messages[ 'mobile-frontend-show-button' ],
						'hideText' => self::$messages[ 'mobile-frontend-hide-button' ],
						'configure-empty-homepage' => self::$messages[ 'mobile-frontend-empty-homepage' ],
						'useFormatCookieName' => self::$useFormatCookieName,
						'useFormatCookieDuration' => $this->getUseFormatCookieDuration(),
						'useFormatCookiePath' => $wgCookiePath,
						'useFormatCookieDomain' => $this->getBaseDomain(),
						);
		$applicationTemplate->setByArray( $options );
		wfProfileOut( __METHOD__ );
		return $applicationTemplate;
	}

	public static function buildLanguageSelection() {
		global $wgLanguageCode;
		wfProfileIn( __METHOD__ );
		$output = Html::openElement( 'select',
			array( 'id' => 'languageselection' ) );
		foreach ( self::$languageUrls as $languageUrl ) {
			if ( $languageUrl['lang'] == $wgLanguageCode ) {
				$output .=	Html::element( 'option',
							array( 'value' => $languageUrl['href'], 'selected' => 'selected' ),
									$languageUrl['language'] );
			} else {
				$output .=	Html::element( 'option',
							array( 'value' => $languageUrl['href'] ),
									$languageUrl['language'] );
			}
		}
		$output .= Html::closeElement( 'select', array() );
		wfProfileOut( __METHOD__ );
		return $output;
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

		if ( self::$isBetaGroupMember ) {
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

	public function addTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.mobilefrontend.tests'] = array(
			'scripts' => array( 'tests/js/fixtures.js', 'javascripts/application.js',
				'javascripts/opensearch.js', 'javascripts/banner.js',
				'javascripts/toggle.js', 'tests/js/test_toggle.js',
				'tests/js/test_application.js', 'tests/js/test_opensearch.js', 'tests/js/test_banner.js' ),
				'dependencies' => array( ),
				'localBasePath' => dirname( __FILE__ ),
				'remoteExtPath' => 'MobileFrontend',
		);
		$testModules['qunit']['ext.mobilefrontend.tests.beta'] = array(
			'scripts' => array( 'tests/js/fixtures.js', 'javascripts/application.js',
				'javascripts/beta_opensearch.js', 'tests/js/test_beta_opensearch.js' ),
				'dependencies' => array( ),
				'localBasePath' => dirname( __FILE__ ),
				'remoteExtPath' => 'MobileFrontend',
		);
		return true;
	}

	/**
	 * Take a URL and return a copy that conforms to the mobile URL template
	 * @param $url string
	 * @param $forceHttps bool
	 * @return string
	 */
	public function getMobileUrl( $url, $forceHttps = false ) {
		$parsedUrl = wfParseUrl( $url );
		$this->updateMobileUrlHost( $parsedUrl );
		$this->updateMobileUrlQueryString( $parsedUrl );
		if ( $forceHttps ) {
			$parsedUrl[ 'scheme' ] = 'https';
		}
		return wfAssembleUrl( $parsedUrl );
	}

	/**
	 * Take a URL and return a copy that removes any mobile tokens
	 * @param string
	 * @return string
	 */
	public function getDesktopUrl( $url ) {
		$parsedUrl = wfParseUrl( $url );
		$this->updateDesktopUrlHost( $parsedUrl );
		return wfAssembleUrl( $parsedUrl );
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
		$mobileToken = preg_replace( "/%h[0-9]\.{0,1}/", "", $mobileUrlHostTemplate );

		// replace the mobile token with nothing, resulting in the normal hostname
		$parsedUrl['host'] = str_replace( $mobileToken, '', $parsedUrl['host'] );
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

	protected function updateMobileUrlQueryString( &$parsedUrl ) {
		if ( !$this->isFauxMobileDevice() ) {
			return;
		}
		$useFormat = $this->getUseFormat();
		if ( !isset( $parsedUrl[ 'query' ] ) ) {
			$parsedUrl[ 'query' ] = 'useformat=' . urlencode( $useFormat );
		} else {
			$query = wfCgiToArray( $parsedUrl[ 'query' ] );
			$query[ 'useformat' ] = urlencode( $useFormat );
			$parsedUrl[ 'query' ] = wfArrayToCgi( $query );
		}
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

	public function shouldDisplayMobileView() {
		// always display desktop view if it's explicitly requested
		$useFormat = $this->getUseFormat();
		if ( $useFormat == 'desktop' ) {
			return false;
		}

		if ( !$this->isMobileDevice() && !$this->isFauxMobileDevice() ) {
			return false;
		}

		$action = $this->getAction();


		if ( $action === 'edit' || $action === 'history' ) {
			return false;
		}

		return true;
	}

	public function getXDevice() {
		if ( is_null( $this->xDevice ) ) {
			$this->xDevice = isset( $_SERVER['HTTP_X_DEVICE'] ) ?
					$_SERVER['HTTP_X_DEVICE'] : '';
		}

		return $this->xDevice;
	}

	public function getMobileAction() {
		global $wgRequest;
		if ( is_null( $this->mobileAction ) ) {
			$this->mobileAction = $wgRequest->getText( 'mobileaction' );
		}

		return $this->mobileAction;
	}

	public function getAction() {
		global $wgRequest;
		if ( is_null( $this->action ) ) {
			$this->action = $wgRequest->getText( 'action' );
		}

		return $this->action;
	}

	public function getUseFormat() {
		global $wgRequest;
		if ( !isset( $this->useFormat ) ) {
			$useFormat = $wgRequest->getText( 'useformat' );
			$this->setUseFormat( $useFormat );
		}
		return $this->useFormat;
	}

	public function setUseFormat( $useFormat ) {
		$this->useFormat = $useFormat;
	}

	public function checkUseFormatCookie() {
		global $wgRequest, $wgScriptPath;

		if ( !isset( self::$useFormatCookieName ) ) {
			self::$useFormatCookieName = 'mf_useformat';
		}

		$useFormat = $this->getUseFormat();
		$useFormatFromCookie = $wgRequest->getCookie( 'mf_useformat', '' );

		// fetch format from cookie and set it if one is not otherwise specified
		if ( !strlen( $useFormat ) && !is_null( $useFormatFromCookie ) ) {
			$this->setUseFormat( $useFormatFromCookie );
		}

		// set appropriate cookie if necessary, ignoring certain URL patterns
		// eg initial requests to a mobile-specific domain with no path. this
		// is intended to avoid pitfalls for certain server configurations
		// but should not get in the way of out-of-the-box configs
		$reqUrl = $wgRequest->getRequestUrl();
		$urlsToIgnore = array( '/?useformat=mobile', $wgScriptPath . '/?useformat=mobile' );
		if ( ( ( $useFormatFromCookie != 'mobile' && $useFormat == 'mobile' ) ||
		 		( $useFormatFromCookie != 'desktop' && $useFormat == 'desktop' ) ) &&
				!in_array( $reqUrl, $urlsToIgnore ) ) {
			$this->setUseFormatCookie( $useFormat );
		}
	}

	/**
	 * Set the mf_useformat cookie
	 *
	 * This cookie can determine whether or not a user should see the mobile
	 * version of pages.
	 *
	 * @param string $useFormat The format to store in the cookie
	 */
	protected function setUseFormatCookie( $useFormat ) {
		global $wgCookiePath, $wgCookieSecure;
		$expiry = $this->getUseFormatCookieExpiry();

		// use regular php setcookie() rather than WebResponse::setCookie
		// so we can ignore $wgCookieHttpOnly since the protection it provides
		// is irrelevant for this cookie.
		setcookie( self::$useFormatCookieName, $useFormat, $expiry, $wgCookiePath, $this->getBaseDomain(), $wgCookieSecure );
		wfIncrStats( 'mobile.useformat_' . $useFormat . '_cookie_set' );
	}

	/**
	 * Get the expiration time for the mf_useformat cookie
	 *
	 * @param int $startTime The base time (in seconds since Epoch) from which to calculate
	 * 		cookie expiration. If null, time() is used.
	 * @return int The time (in seconds since Epoch) that the cookie should expire
	 */
	protected function getUseFormatCookieExpiry( $startTime = null ) {
		$cookieDuration = $this->getUseFormatCookieDuration();
		if ( intval( $startTime ) === 0 ) $startTime = time();
		$expiry = $startTime + $cookieDuration;
		return $expiry;
	}

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
	protected function getUseFormatCookieDuration() {
		global $wgMobileFrontendFormatCookieExpiry, $wgCookieExpiration;
		$cookieDuration = ( abs( intval( $wgMobileFrontendFormatCookieExpiry ) ) > 0 ) ?
				$wgMobileFrontendFormatCookieExpiry : $wgCookieExpiration;
		return $cookieDuration;
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}
