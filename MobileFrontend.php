<?php
/**
 * Extension MobileFrontend — Mobile Frontend
 *
 * @file
 * @ingroup Extensions
 * @author Patrick Reilly
 * @copyright © 2011 Patrick Reilly
 * @licence GNU General Public Licence 2.0 or later
 */

// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo( "This is an extension to the MediaWiki package and cannot be run standalone.\n" );
	die( -1 );
}

// Define the extension; allows us make sure the extension is used correctly
define( 'MOBILEFRONTEND', 'MobileFrontend' );
// WURFL installation dir
define( 'WURFL_DIR', dirname(__FILE__) . DIRECTORY_SEPARATOR . 'library' .
		DIRECTORY_SEPARATOR . 'WURFL' . DIRECTORY_SEPARATOR );
// WURFL configuration files directory
define( 'RESOURCES_DIR', dirname(__FILE__) . DIRECTORY_SEPARATOR . 'library' .
		DIRECTORY_SEPARATOR. 'resources' . DIRECTORY_SEPARATOR );

require_once( WURFL_DIR . 'Application.php' );

// Extension credits that will show up on Special:Version
$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'MobileFrontend',
	'version' => ExtMobileFrontend::VERSION,
	'author' => '[http://www.mediawiki.org/wiki/User:Preilly Preilly]',
	'descriptionmsg' => 'mobile-frontend-desc',
	'url' => 'http://www.mediawiki.org/wiki/Extension:MobileFrontend',
);

$cwd = dirname(__FILE__) . DIRECTORY_SEPARATOR;
$wgExtensionMessagesFiles['MobileFrontend'] = $cwd . 'MobileFrontend.i18n.php';
//autoload extension classes
$wgAutoloadClasses['DeviceDetection'] = $cwd . 'DeviceDetection.php';
$wgAutoloadClasses['CssDetection']	  = $cwd . 'CssDetection.php';

/**
 * Path to the logo used in the mobile view
 *
 * Should be 22px tall at most
 */
$wgMobileFrontendLogo = false;


$wgExtMobileFrontend = new ExtMobileFrontend();

$wgHooks['BeforePageDisplay'][] = array( &$wgExtMobileFrontend, 'beforePageDisplayHTML' );

$wgHooks['SkinTemplateOutputPageBeforeExec'][] = array( &$wgExtMobileFrontend, 'addMobileFooter' );
$wgExtensionFunctions[] = array( &$wgExtMobileFrontend, 'setDefaultLogo' );

/**
 * Make the classes stripped from page content configurable. Each item will
 * be stripped from the page. See $itemsToRemove for more info
 */
$wgMFRemovableClasses = array(
	'table.metadata',	  # ugly metadata
	'.metadata mbox-small',
	'.metadata plainlinks ambox ambox-content',
	'.metadata plainlinks ambox ambox-move',
	'.metadata plainlinks ambox ambox-style',
);

class ExtMobileFrontend {
	const VERSION = '0.5.37';

	/**
	 * @var DOMDocument
	 */
	private $doc;
	private $mainPage;

	public static $messages = array();

	public $contentFormat = '';
	public $WMLSectionSeperator = '***************************************************************************';

	/**
	 * @var Title
	 */
	public static $title;
	public static $htmlTitle;
	public static $dir;
	public static $code;
	public static $device;
	public static $headings;
	public static $mainPageUrl;
	public static $randomPageUrl;
	public static $requestedSegment;
	public static $format;
	public static $search;
	public static $callback;
	public static $useFormat;
	public static $disableImages;
	public static $enableImages;
	public static $isMainPage = false;
	public static $searchField;

	public $itemsToRemove = array(
		'#contentSub',		  # redirection notice
		'div.messagebox',	  # cleanup data
		'#siteNotice',		  # site notice
		'#siteSub',			  # "From Wikipedia..."
		'#jump-to-nav',		  # jump-to-nav
		'div.editsection',	  # edit blocks
		'div.infobox',		  # Infoboxes in the article
		'table.toc',		  # table of contents
		'#catlinks',		  # category links
		'div.stub',			  # stub warnings
		'form',
		'div.sister-project',
		'script',
		'div.magnify',		  # stupid magnify thing
		'.editsection',
		'span.t',
		'sup[style*="help"]',
		'.portal',
		'#protected-icon',
		'.printfooter',
		'.boilerplate',
		'#id-articulo-destacado',
		'#coordinates',
		'#top',
		'.hiddenStructure',
		'.noprint',
		'.medialist',
		'.mw-search-createlink',
		'#ogg_player_1',
		'.nomobile',
	);

	public function addMobileFooter( &$obj, &$tpl ) {
		global $wgRequest;
		$footerlinks = $tpl->data['footerlinks'];
		$mobileViewUrl = $wgRequest->escapeAppendQuery( 'useformat=mobile' );

		$tpl->set('mobileview', "<a href='{$mobileViewUrl}'>".wfMsg( 'mobile-frontend-view')."</a>");
		$footerlinks['places'][] = 'mobileview';
		$tpl->set('footerlinks', $footerlinks);

		return true;
	}

	public function getMsg() {
		global $wgUser, $wgContLang;
		$skin = $wgUser->getSkin();
		$copyright = $skin->getCopyright();
		// Need to stash the results of the "wfMsg" call before the Output Buffering handler
		// because at this point the database connection is shut down, etc.
		self::$messages['mobile-frontend-show'] = wfMsg( 'mobile-frontend-show-button' );
		self::$messages['mobile-frontend-hide'] = wfMsg( 'mobile-frontend-hide-button' );
		self::$messages['mobile-frontend-back-to-top'] = wfMsg( 'mobile-frontend-back-to-top-of-section' );
		self::$messages['mobile-frontend-regular-site'] = wfMsg( 'mobile-frontend-regular-site' );
		self::$messages['mobile-frontend-perm-stop-redirect'] = wfMsg( 'mobile-frontend-perm-stop-redirect' );
		self::$messages['mobile-frontend-copyright'] = $copyright;
		self::$messages['mobile-frontend-home-button'] = wfMsg( 'mobile-frontend-home-button' );
		self::$messages['mobile-frontend-random-button'] = wfMsg( 'mobile-frontend-random-button' );
		self::$messages['mobile-frontend-are-you-sure'] = wfMsg( 'mobile-frontend-are-you-sure' );
		self::$messages['mobile-frontend-explain-disable'] = wfMsg( 'mobile-frontend-explain-disable' );
		self::$messages['mobile-frontend-disable-button'] = wfMsg( 'mobile-frontend-disable-button' );
		self::$messages['mobile-frontend-back-button'] = wfMsg( 'mobile-frontend-back-button' );
		self::$messages['mobile-frontend-opt-in-message'] = wfMsg( 'mobile-frontend-opt-in-message' );
		self::$messages['mobile-frontend-opt-in-yes-button'] = wfMsg( 'mobile-frontend-opt-in-yes-button' );
		self::$messages['mobile-frontend-opt-in-no-button'] = wfMsg( 'mobile-frontend-opt-in-no-button' );
		self::$messages['mobile-frontend-opt-in-title'] = wfMsg( 'mobile-frontend-opt-in-title' );
		self::$messages['mobile-frontend-opt-out-message'] = wfMsg( 'mobile-frontend-opt-out-message' );
		self::$messages['mobile-frontend-opt-out-yes-button'] = wfMsg( 'mobile-frontend-opt-out-yes-button' );
		self::$messages['mobile-frontend-opt-out-no-button'] = wfMsg( 'mobile-frontend-opt-out-no-button' );
		self::$messages['mobile-frontend-opt-out-title'] = wfMsg( 'mobile-frontend-opt-out-title' );
		self::$messages['mobile-frontend-opt-in-explain'] = wfMsg( 'mobile-frontend-opt-in-explain' );
		self::$messages['mobile-frontend-opt-out-explain'] = wfMsg( 'mobile-frontend-opt-out-explain' );
		self::$messages['mobile-frontend-disable-images'] = wfMsg( 'mobile-frontend-disable-images' );
		self::$messages['mobile-frontend-wml-continue'] = wfMsg( 'mobile-frontend-wml-continue' );
		self::$messages['mobile-frontend-wml-back'] = wfMsg( 'mobile-frontend-wml-back' );
		self::$messages['mobile-frontend-enable-images'] = wfMsg( 'mobile-frontend-enable-images' );
		self::$messages['mobile-frontend-featured-article'] = wfMsg( 'mobile-frontend-featured-article' );
		self::$messages['mobile-frontend-news-items'] = wfMsg( 'mobile-frontend-news-items' );

		self::$dir = $wgContLang->getDir();
		self::$code = $wgContLang->getCode();

		self::$mainPageUrl = Title::newMainPage()->getLocalUrl();
		self::$randomPageUrl = SpecialPage::getTitleFor( 'Randompage' )->getLocalUrl();
	}

	/**
	 * @param $out Outputpage
	 * @param $text String
	 * @return bool
	 */
	public function beforePageDisplayHTML( &$out, &$text ) {
		global $wgContLang, $wgRequest, $wgMemc, $wgUser;

		// The title
		self::$title = $out->getTitle();
		
		if (  Title::newMainPage()->equals( self::$title ) ) {
			self::$isMainPage = true;
		}
		
		self::$htmlTitle = $out->getHTMLTitle();

		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		$uAmd5 = md5($userAgent);

		$key = wfMemcKey( 'mobile', 'ua', $uAmd5 );

		try {
			$props = $wgMemc->get( $key );
			if ( ! $props ) {
				$wurflConfigFile = RESOURCES_DIR . 'wurfl-config.xml';
				$wurflConfig = new WURFL_Configuration_XmlConfig( $wurflConfigFile );
				$wurflManagerFactory = new WURFL_WURFLManagerFactory( $wurflConfig );
				$wurflManager = $wurflManagerFactory->create();
				$device = $wurflManager->getDeviceForHttpRequest( $_SERVER );

				if ( $device->isSpecific() === true ) {
					$props = $device->getAllCapabilities();
					$wgMemc->set( $key, $props, 86400 );
				} else {
					$wgMemc->set( $key, "generic", 86400 );
					$props = "generic";
				}
			}
		} catch (Exception $e) {
			//echo $e->getMessage();
		}

		// Note: The WebRequest Class calls are made in this block because
		// since PHP 5.1.x, all objects have their destructors called
		// before the output buffer callback function executes.
		// Thus, globalized objects will not be available as expected in the function.
		// This is stated to be intended behavior, as per the following: [http://bugs.php.net/bug.php?id=40104]

		$mobileAction = $wgRequest->getText( 'mobileaction' );
		$action = $wgRequest->getText( 'action' );
		self::$disableImages = $wgRequest->getText( 'disableImages', 0 );
		self::$enableImages = $wgRequest->getText( 'enableImages', 0 );

		if ( self::$disableImages == 1 ) {
			$wgRequest->response()->setcookie( 'disableImages', 1 );
		}

		if ( self::$disableImages == 0 ) {
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
		}


		self::$useFormat = $wgRequest->getText( 'useformat' );
		self::$format = $wgRequest->getText( 'format' );
		self::$requestedSegment = $wgRequest->getText( 'seg', 0 );
		self::$search = $wgRequest->getText( 'search' );
		self::$callback = $wgRequest->getText( 'callback' );
		self::$searchField = $wgRequest->getText( 'search', '' );

		$acceptHeader = $_SERVER["HTTP_ACCEPT"];
		$device = new DeviceDetection();
		$formatName = $device->formatName( $userAgent, $acceptHeader );
		self::$device = $device->format( $formatName );

		if ( self::$device['view_format'] === 'wml' ) {
			$this->contentFormat = 'WML';
		} elseif ( self::$device['view_format'] === 'html' ) {
			$this->contentFormat = 'XHTML';
		}

		if ( self::$useFormat === 'mobile-wap' ) {
			$this->contentFormat = 'WML';
		}

		if ( $mobileAction == 'disable_mobile_site' ) {
			if ( $this->contentFormat == 'XHTML' ) {
				echo $this->renderDisableMobileSiteXHTML();
				exit();
			}
		}

		if ( $mobileAction == 'opt_in_mobile_site' ) {
			if ( $this->contentFormat == 'XHTML' ) {
				echo $this->renderOptInMobileSiteXHTML();
				exit();
			}
		}

		if ( $mobileAction == 'opt_out_mobile_site' ) {
			if ( $this->contentFormat == 'XHTML' ) {
				echo $this->renderOptOutMobileSiteXHTML();
				exit();
			}
		}

		if ( $mobileAction == 'opt_in_cookie' ) {
			$this->setOptInOutCookie( '1' );
			$this->disableCaching();
			$location = Title::newMainPage()->getFullURL();
			header( 'Location: ' . $location );
		}

		if ( $mobileAction  == 'opt_out_cookie' ) {
			$this->setOptInOutCookie( '' );
		}

		// WURFL documentation: http://wurfl.sourceforge.net/help_doc.php
		// Determine the kind of markup
		if( is_array( $props ) && $props['preferred_markup'] ) {
			//wfDebug( __METHOD__ . ": preferred markup for this device: " . $props['preferred_markup'] );
			// xhtml/html: html_web_3_2, html_web_4_0
			// xthml basic/xhtmlmp (wap 2.0): html_wi_w3_xhtmlbasic html_wi_oma_xhtmlmp_1_0
			// chtml (imode): html_wi_imode_*
			// wml (wap 1): wml_1_1, wml_1_2, wml_1_3
		}
		// WML options that might influence our 'style' of output
		// $props['access_key_support'] (for creating easy keypad navigation)
		// $props['softkey_support'] ( for creating your own menu)

		// WAP2/XHTML MP
		// xhtmlmp_preferred_mime_type ( the mime type with which you should serve your xhtml to this device

		// HTML
		// $props['pointing_method'] == touchscreen
		// ajax_support_javascript
		// html_preferred_dtd

		// Determine

		$xDevice = isset( $_SERVER['HTTP_X_DEVICE'] ) ? $_SERVER['HTTP_X_DEVICE'] : '';

		if (self::$useFormat === 'mobile' ||
			self::$useFormat === 'mobile-wap' ||
			!empty( $xDevice ) ) {
				if ( $action !== 'edit' && 
					 $mobileAction !== 'view_normal_site' ) {
					$this->getMsg();
					$this->disableCaching();
					$this->sendXDeviceVaryHeader();
					ob_start( array( $this, 'DOMParse' ) );
				}
		}

		return true;
	}

	private function setOptInOutCookie( $value ) {
		global $wgCookieDomain, $wgRequest;
		$tempWgCookieDomain = $wgCookieDomain;
		$wgCookieDomain = $this->getBaseDomain();
		$wgRequest->response()->setcookie( 'optin', $value );
		$wgCookieDomain = $tempWgCookieDomain;
	}

	private function getBaseDomain() {
		//Validates value as IP address
		if( !IP::isValid( $_SERVER['HTTP_HOST'] ) ) {
			$domainParts = explode( '.', $_SERVER['HTTP_HOST'] );
			$domainParts = array_reverse( $domainParts );
			//Although some browsers will accept cookies without the initial ., » RFC 2109 requires it to be included.
			return '.' . $domainParts[1] . '.' . $domainParts[0];
		} else {
			return $_SERVER['HTTP_HOST'];
		}
	}

	private function disableCaching() {
		if ( isset( $_SERVER['HTTP_VIA'] ) &&
			stripos( $_SERVER['HTTP_VIA'], '.wikimedia.org:3128' ) !== false ) {
			header( 'Cache-Control: no-cache, must-revalidate' );
			header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' );
			header( 'Pragma: no-cache' );
		}
	}
	
	private function sendXDeviceVaryHeader() {
		global $wgOut;
		
		if ( !empty( $_SERVER['HTTP_X_DEVICE'] ) ) {
			header( 'X-Device: ' . $_SERVER['HTTP_X_DEVICE'] );
			$wgOut->addVaryHeader( 'X-Device' );
		}
	}

	private function renderOptInMobileSiteXHTML() {
		if ( $this->contentFormat == 'XHTML' ) {
			$this->getMsg();
			$yesButton = self::$messages['mobile-frontend-opt-in-yes-button'];
			$noButton = self::$messages['mobile-frontend-opt-in-no-button'];
			$htmlTitle = self::$messages['mobile-frontend-opt-in-title'];
			$explainOptIn = self::$messages['mobile-frontend-opt-in-explain'];
			$optInMessage = self::$messages['mobile-frontend-opt-in-message'];
			require( 'views/layout/_search_webkit.html.php' );
			require( 'views/layout/_footmenu_default.html.php' );
			require( 'views/information/optin.html.php' );
			$contentHtml = $optInHtml;
			require( 'views/layout/application.html.php' );
			return $applicationHtml;
		}
		return '';
	}

	private function renderOptOutMobileSiteXHTML() {
		if ( $this->contentFormat == 'XHTML' ) {
			$this->getMsg();
			$yesButton = self::$messages['mobile-frontend-opt-out-yes-button'];
			$noButton = self::$messages['mobile-frontend-opt-out-no-button'];
			$htmlTitle = self::$messages['mobile-frontend-opt-out-title'];
			$explainOptOut = self::$messages['mobile-frontend-opt-out-explain'];
			$optOutMessage = self::$messages['mobile-frontend-opt-out-message'];
			require( 'views/layout/_search_webkit.html.php' );
			require( 'views/layout/_footmenu_default.html.php' );
			require( 'views/information/optout.html.php' );
			$contentHtml = $optOutHtml;
			require( 'views/layout/application.html.php' );
			return $applicationHtml;
		}
		return '';
	}

	private function renderDisableMobileSiteXHTML() {
		if ( $this->contentFormat == 'XHTML' ) {
			$this->getMsg();
			$areYouSure = self::$messages['mobile-frontend-are-you-sure'];
			$explainDisable = self::$messages['mobile-frontend-explain-disable'];
			$disableButton = self::$messages['mobile-frontend-disable-button'];
			$backButton = self::$messages['mobile-frontend-back-button'];
			$htmlTitle = $areYouSure;
			$title = $areYouSure;
			require( 'views/layout/_search_webkit.html.php' );
			require( 'views/layout/_footmenu_default.html.php' );
			require( 'views/information/disable.html.php' );
			$contentHtml = $disableHtml;
			require( 'views/layout/application.html.php' );
			return $applicationHtml;
		}
		return '';
	}

	private function headingTransformCallbackWML( $matches ) {
		static $headings = 0;
		++$headings;

		$base = $this->WMLSectionSeperator .
				"<h2 class='section_heading' id='section_{$headings}'>{$matches[2]}</h2>";

		self::$headings = $headings;

		return $base;
	}

	private function headingTransformCallbackXHTML( $matches ) {

		if ( isset( $matches[0] ) ) {
			preg_match('/id="([^"]*)"/', $matches[0], $headlineMatches);
		}

		$headlineId = ( isset( $headlineMatches[1] ) ) ? $headlineMatches[1] : '';

		static $headings = 0;
		$show = self::$messages['mobile-frontend-show'];
		$hide = self::$messages['mobile-frontend-hide'];
		$backToTop = self::$messages['mobile-frontend-back-to-top'];
		++$headings;
		// Back to top link
		$base = "<div class='section_anchors' id='anchor_" . intval( $headings - 1 ) .
			"'><a href='#section_" . intval( $headings - 1 ) .
			"' class='back_to_top'>&uarr; {$backToTop}</a></div>";
		// generate the HTML we are going to inject
		$buttons = "<button class='section_heading show' section_id='{$headings}'>{$show}</button>" .
			"<button class='section_heading hide' section_id='{$headings}'>{$hide}</button>";
		$base .= "<h2 class='section_heading' id='section_{$headings}'{$matches[1]}{$buttons} <span id='{$headlineId}'>" .
			"{$matches[2]}</span></h2><div class='content_block' id='content_{$headings}'>";

		if ( $headings > 1 ) {
			// Close it up here
			$base = '</div>' . $base;
		}

		self::$headings = $headings;

		return $base;
	}

	/**
	 * @param $s string
	 * @return string
	 */
	public function headingTransform( $s ) {
		$callback = 'headingTransformCallback';
		$callback .= $this->contentFormat;

		// Closures are a PHP 5.3 feature.
		// MediaWiki currently requires PHP 5.2.3 or higher.
		// So, using old style for now.
		$s = preg_replace_callback(
			'/<h2(.*)<span class="mw-headline" [^>]*>(.+)<\/span>\w*<\/h2>/',
			array( $this, $callback ),
			$s
		);

		// if we had any, make sure to close the whole thing!
		if ( isset( self::$headings ) && self::$headings > 0 ) {
			$s = str_replace(
				'<div class="visualClear">',
				'</div><div class="visualClear">',
				$s
			);
		}

		return $s;
	}

	private function createWMLCard( $s ) {
		$segments = explode( $this->WMLSectionSeperator, $s );
		$card = '';
		$idx = 0;
		$requestedSegment = self::$requestedSegment;
		$title = htmlspecialchars( self::$title->getText() );

		$card .= "<card id='{$idx}' title='{$title}'><p>{$segments[$requestedSegment]}</p>";
		$idx = $requestedSegment + 1;
		$segmentsCount = count($segments);
		$card .= "<p>" . $idx . "/" . $segmentsCount . "</p>";

		$useFormatParam = ( isset( self::$useFormat ) ) ? '&' . 'useformat=' . self::$useFormat : '';

		$basePage = htmlspecialchars( $_SERVER['PHP_SELF'] );

		if ( $idx < $segmentsCount ) {
			$card .= "<p><a href=\"{$basePage}?seg={$idx}{$useFormatParam}\">" . self::$messages['mobile-frontend-wml-continue'] . "</a></p>";
		}

		if ( $idx > 1 ) {
			$back_idx = $requestedSegment - 1;
			$card .= "<p><a href=\"{$basePage}?seg={$back_idx}{$useFormatParam}\">" . self::$messages['mobile-frontend-wml-back'] . "</a></p>";
		}

		$card .= '</card>';
		return $card;
	}

	private function parseItemsToRemove() {
		global $wgMFRemovableClasses;
		$itemToRemoveRecords = array();

		foreach ( array_merge( $this->itemsToRemove, $wgMFRemovableClasses )
				as $itemToRemove )
		{
			$type = '';
			$rawName = '';
			CssDetection::detectIdCssOrTag( $itemToRemove, $type, $rawName );
			$itemToRemoveRecords[$type][] = $rawName;
		}

		return $itemToRemoveRecords;
	}
	
	public function DOMParseMainPage( $html ) {
		$html = mb_convert_encoding($html, 'HTML-ENTITIES', "UTF-8");
		libxml_use_internal_errors( true );
		$this->mainPage = new DOMDocument();
		//It seems that loadhtml() does not "attach" the html dtd that defines id as an id-attribute to the DOM.
		$this->mainPage->loadHTML( '<?xml encoding="UTF-8"><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
									<html><head><title></title></head><body>' . $html . '</body></html>' );
		libxml_use_internal_errors( false );
		$this->mainPage->preserveWhiteSpace = false;
		$this->mainPage->strictErrorChecking = false;
		$this->mainPage->encoding = 'UTF-8';
		
		$featuredArticle = $this->mainPage->getElementById( 'mp-tfa' );
		$newsItems = $this->mainPage->getElementById( 'mp-itn' );

		$content = $this->mainPage->createElement( 'div' );
		$content->setAttribute( 'id', 'main_box' );
		
		if ( $featuredArticle ) {
			$h2FeaturedArticle = $this->mainPage->createElement( 'h2', self::$messages['mobile-frontend-featured-article'] );
			$content->appendChild( $h2FeaturedArticle );
			$content->appendChild( $featuredArticle );
		}
		
		if ( $newsItems ) {
			$h2NewsItems = $this->mainPage->createElement( 'h2', self::$messages['mobile-frontend-news-items'] );
			$content->appendChild( $h2NewsItems );
			$content->appendChild( $newsItems );
		}
		
		$contentHtml = $this->mainPage->saveXML( $content, LIBXML_NOEMPTYTAG );
		
		return $contentHtml;
	}

	public function DOMParse( $html ) {
		global $wgSitename;

		$html = mb_convert_encoding($html, 'HTML-ENTITIES', "UTF-8");
		libxml_use_internal_errors( true );
		$this->doc = new DOMDocument();
		$this->doc->loadHTML( '<?xml encoding="UTF-8">' . $html );
		libxml_use_internal_errors( false );
		$this->doc->preserveWhiteSpace = false;
		$this->doc->strictErrorChecking = false;
		$this->doc->encoding = 'UTF-8';

		$itemToRemoveRecords = $this->parseItemsToRemove();

		// Tags

		// You can't remove DOMNodes from a DOMNodeList as you're iterating
		// over them in a foreach loop. It will seemingly leave the internal
		// iterator on the foreach out of wack and results will be quite
		// strange. Though, making a queue of items to remove seems to work.
		// For example:

		if ( self::$disableImages == 1 ) {
			$itemToRemoveRecords['TAG'][] = "img";
			$itemToRemoveRecords['TAG'][] = "audio";
			$itemToRemoveRecords['TAG'][] = "video";
			$itemToRemoveRecords['CLASS'][] = "thumb tright";
			$itemToRemoveRecords['CLASS'][] = "thumb tleft";
			$itemToRemoveRecords['CLASS'][] = "thumbcaption";
			$itemToRemoveRecords['CLASS'][] = "gallery";
		}

		$domElemsToRemove = array();
		foreach ( $itemToRemoveRecords['TAG'] as $tagToRemove ) {
			$tagToRemoveNodes = $this->doc->getElementsByTagName( $tagToRemove );

			foreach( $tagToRemoveNodes as $tagToRemoveNode ) {
				if ( $tagToRemoveNode ) {
					$domElemsToRemove[] = $tagToRemoveNode;
				}
			}
		}

		foreach( $domElemsToRemove as $domElement ) {
			$domElement->parentNode->removeChild( $domElement );
		}

		// Elements with named IDs
		foreach ( $itemToRemoveRecords['ID'] as $itemToRemove ) {
			$itemToRemoveNode = $this->doc->getElementById( $itemToRemove );
			if ( $itemToRemoveNode ) {
				$removedItemToRemove = $itemToRemoveNode->parentNode->removeChild( $itemToRemoveNode );
			}
		}

		// CSS Classes
		$xpath = new DOMXpath( $this->doc );
		foreach ( $itemToRemoveRecords['CLASS'] as $classToRemove ) {
			$elements = $xpath->query( '//*[@class="' . $classToRemove . '"]' );

			foreach( $elements as $element ) {
				$removedElement = $element->parentNode->removeChild( $element );
			}
		}

		// Tags with CSS Classes
		foreach ( $itemToRemoveRecords['TAG_CLASS'] as $classToRemove ) {
			$parts = explode( '.', $classToRemove );

			$elements = $xpath->query(
				'//' . $parts[0] . '[@class="' . $parts[1] . '"]'
			);

			foreach( $elements as $element ) {
				$removedElement = $element->parentNode->removeChild( $element );
			}
		}

		// Handle red links with action equal to edit
		$redLinks = $xpath->query( '//a[@class="new"]' );
		foreach( $redLinks as $redLink ) {
			//PHP Bug #36795 — Inappropriate "unterminated entity reference"
			$spanNode = $this->doc->createElement( "span", str_replace( "&", "&amp;", $redLink->nodeValue ) );

			if ( $redLink->hasAttributes() ) {
				$attributes = $redLink->attributes;
				foreach ( $attributes as $i => $attribute ) {
					$spanNode->setAttribute( $attribute->name, $attribute->value );
				}
			}

			$redLink->parentNode->replaceChild( $spanNode, $redLink );
		}
		$content = $this->doc->getElementById( 'content' );

		$contentHtml = $this->doc->saveXML( $content, LIBXML_NOEMPTYTAG );
		
		if ( self::$isMainPage ) {
			$contentHtml = $this->DOMParseMainPage( $contentHtml );
		}

		$title = htmlspecialchars( self::$title->getText() );
		$htmlTitle = htmlspecialchars( self::$htmlTitle );

		if ( strlen( $contentHtml ) > 4000 && $this->contentFormat == 'XHTML'
			&& self::$device['supports_javascript'] === true
			&& empty( self::$search ) ) {
			$contentHtml =	$this->headingTransform( $contentHtml );
		} elseif ( $this->contentFormat == 'WML' ) {
			header( 'Content-Type: text/vnd.wap.wml' );

			// TODO: Content transformations required
			// WML Validator:
			// http://validator.w3.org
			//
			// div -> p
			// no style, no class, no h1-h6, sup, sub, ol, ul, li etc.
			// table requires "columns" property
			// lang and dir officially unsupported (but often work on rtl phones)

			// Add segmentation markers
			$contentHtml = $this->headingTransform( $contentHtml );

			// Content wrapping
			$contentHtml = $this->createWMLCard( $contentHtml );
			require( 'views/layout/application.wml.php' );
		}

		if ( $this->contentFormat == 'XHTML' && self::$format != 'json' ) {
			require( 'views/layout/_search_webkit.html.php' );
			require( 'views/layout/_footmenu_default.html.php' );
			require( 'views/layout/application.html.php' );
		}

		if ( self::$format === 'json' ) {
			header( 'Content-Type: application/json' );
			header( 'Content-Disposition: attachment; filename="data.js";' );
			$json_data = array();
			$json_data['title'] = self::$title->getText();
			$json_data['html'] = $contentHtml;

			$json = json_encode( $json_data );

			if ( !empty( self::$callback ) ) {
				$json = urlencode( self::$callback ) . '(' . $json . ')';
			}

			return $json;
		}

		return $applicationHtml;
	}

	/**
	 * Sets up the default logo image used in mobile view if none is set
	 */
	public function setDefaultLogo() {
		global $wgMobileFrontendLogo, $wgExtensionAssetsPath;
		if ( $wgMobileFrontendLogo === false ) {
			$wgMobileFrontendLogo = $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/images/mw.png';
		}
	}
}
