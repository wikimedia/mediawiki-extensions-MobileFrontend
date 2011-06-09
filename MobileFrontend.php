<?php
/**
 * Extension PatchOutputMobile — Patch HTML output for mobile
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
define( 'PATCHOUTPUTMOBILE', 'PatchOutputMobile' );
// WURFL installation dir
define( 'WURFL_DIR', dirname(__FILE__) . DIRECTORY_SEPARATOR . 'library' . 
		DIRECTORY_SEPARATOR . 'WURFL' . DIRECTORY_SEPARATOR );
// WURFL configuration files directory
define( 'RESOURCES_DIR', dirname(__FILE__) . DIRECTORY_SEPARATOR . 'library' . 
		DIRECTORY_SEPARATOR. 'resources' . DIRECTORY_SEPARATOR );

require_once( WURFL_DIR . 'Application.php' );

// Extension credits that will show up on Special:Version
$wgExtensionCredits['other'][] = array(
	'name' => 'PatchOutputMobile',
	'version' => ExtPatchOutputMobile::VERSION,
	'author' => '[http://www.mediawiki.org/wiki/User:Preilly Preilly]',
	'description' => 'Patch HTML output for mobile',
	'url' => 'http://www.mediawiki.org/wiki/Extension:PatchOutputMobile',
);

$cwd = dirname(__FILE__) . DIRECTORY_SEPARATOR;
$wgExtensionMessagesFiles['PatchOutputMobile'] = $cwd . 'PatchOutputMobile.i18n.php';
//autoload extension classes
$wgAutoloadClasses['DeviceDetection'] = $cwd . 'DeviceDetection.php';
$wgAutoloadClasses['CssDetection']    = $cwd . 'CssDetection.php';

$wgExtPatchOutputMobile = new ExtPatchOutputMobile();

$wgHooks['OutputPageBeforeHTML'][] = array( &$wgExtPatchOutputMobile,
											'onOutputPageBeforeHTML' );

class ExtPatchOutputMobile {
	const VERSION = '0.4.5';

	private $doc;
	
	public static $messages = array();
	
	public $contentFormat = '';
	public $WMLSectionSeperator = '***************************************************************************';
	public static $dir;
	public static $code;
	public static $device;
	public static $headings;

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
		'table.metadata',	  # ugly metadata
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

	public function onOutputPageBeforeHTML( &$out, &$text ) {
		global $wgContLang;
		
		// Need to stash the results of the "wfMsg" call before the Output Buffering handler
		// because at this point the database connection is shut down, etc.
		self::$messages['patch-output-mobile-show']               = wfMsg( 'patch-output-mobile-show-button' );
		self::$messages['patch-output-mobile-hide']               = wfMsg( 'patch-output-mobile-hide-button' );
		self::$messages['patch-output-mobile-back-to-top']        = wfMsg( 'patch-output-mobile-back-to-top-of-section' );
		self::$messages['patch-output-mobile-regular-wikipedia']  = wfMsg( 'patch-output-mobile-regular-wikipedia' );
		self::$messages['patch-output-mobile-perm-stop-redirect'] = wfMsg( 'patch-output-mobile-perm-stop-redirect' );
		self::$messages['patch-output-mobile-copyright']          = wfMsg( 'patch-output-mobile-copyright' );
		self::$messages['patch-output-mobile-home-button']        = wfMsg( 'patch-output-mobile-home-button' );
		self::$messages['patch-output-mobile-random-button']      = wfMsg( 'patch-output-mobile-random-button' );
		self::$messages['patch-output-mobile-are-you-sure']       = wfMsg( 'patch-output-mobile-are-you-sure' );
		self::$messages['patch-output-mobile-explain-disable']    = wfMsg( 'patch-output-mobile-explain-disable' );
		self::$messages['patch-output-mobile-disable-button']     = wfMsg( 'patch-output-mobile-disable-button' );
		self::$messages['patch-output-mobile-back-button']        = wfMsg( 'patch-output-mobile-back-button' );
		
		self::$dir = $wgContLang->getDir();
		self::$code = $wgContLang->getCode();
		
		try {
			$wurflConfigFile = RESOURCES_DIR . 'wurfl-config.xml';
			$wurflConfig = new WURFL_Configuration_XmlConfig( $wurflConfigFile );
			$wurflManagerFactory = new WURFL_WURFLManagerFactory( $wurflConfig );
			$wurflManager = $wurflManagerFactory->create();
			$device = $wurflManager->getDeviceForHttpRequest( $_SERVER );
			$props = $device->getAllCapabilities();
		} catch (Exception $e) {
			//echo $e->getMessage();
		}
		
		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		$acceptHeader = $_SERVER["HTTP_ACCEPT"];
		$device = new DeviceDetection();
		$formatName = $device->formatName( $userAgent, $acceptHeader );
		self::$device = $device->format( $formatName );
		
		if ( self::$device['view_format'] === 'wml' ) {
			$this->contentFormat = 'WML';
		} elseif ( self::$device['view_format'] === 'html' ) {
			$this->contentFormat = 'XHTML';
		}
		
		$mAction = isset( $_GET['m_action'] ) ? $_GET['m_action'] : '';

		if ( $mAction == 'disable_mobile_site' ) {
			if ( $this->contentFormat == 'XHTML' ) {
				echo $this->renderDisableMobileSiteXHTML();
				exit();
			}
		}
		
		if ( $mAction != 'view_normal_site' && $props['is_wireless_device'] === 'true' ) {
			ob_start( array( $this, 'DOMParse' ) );
		}
		return true;
	}
	
	private function renderDisableMobileSiteXHTML() {
		if ( $this->contentFormat == 'XHTML' ) {
			$dir = self::$dir;
			$code = self::$code;
			$regularWikipedia = self::$messages['patch-output-mobile-regular-wikipedia'];
			$permStopRedirect = self::$messages['patch-output-mobile-perm-stop-redirect'];
			$copyright = self::$messages['patch-output-mobile-copyright'];
			$homeButton = self::$messages['patch-output-mobile-home-button'];
			$randomButton = self::$messages['patch-output-mobile-random-button'];
			$areYouSure = self::$messages['patch-output-mobile-are-you-sure'];
			$explainDisable = self::$messages['patch-output-mobile-explain-disable'];
			$disableButton = self::$messages['patch-output-mobile-disable-button'];
			$backButton = self::$messages['patch-output-mobile-back-button'];
			$title = $areYouSure;
			$cssFileName = ( isset( self::$device['css_file_name'] ) ) ? self::$device['css_file_name'] : 'default';
			require( 'views/notices/_donate.html.php' );
			require( 'views/layout/_search_webkit.html.php' );
			require( 'views/layout/_footmenu_default.html.php' );
			require( 'views/information/disable.html.php' );
			$contentHtml = $disableHtml;
			require( 'views/layout/application.html.php' );
			return $applicationHtml;
		}
	}
	
	private function showHideCallbackWML( $matches ) {
		static $headings = 0;
		++$headings;

		$base = $this->WMLSectionSeperator .
			"<h2 class='section_heading' id='section_{$headings}'>{$matches[2]}</h2>";

		self::$headings = $headings;

		return $base;
	}

	private function showHideCallbackXHTML( $matches ) {
		static $headings = 0;
		$show = self::$messages['patch-output-mobile-show'];
		$hide = self::$messages['patch-output-mobile-hide'];
		$backToTop = self::$messages['patch-output-mobile-back-to-top'];
		++$headings;
		// Back to top link
		$base = "<div class='section_anchors' id='anchor_" . intval( $headings - 1 ) .
			"'><a href='#section_" . intval( $headings - 1 ) .
			"' class='back_to_top'>&uarr; {$backToTop}</a></div>";
		// generate the HTML we are going to inject
		$buttons = "<button class='section_heading show' section_id='{$headings}'>{$show}</button>" .
			"<button class='section_heading hide' section_id='{$headings}'>{$hide}</button>";
		$base .= "<h2 class='section_heading' id='section_{$headings}'{$matches[1]}{$buttons} <span>" .
			"{$matches[2]}</span></h2><div class='content_block' id='content_{$headings}'>";

		if ( $headings > 1 ) {
			// Close it up here
			$base = '</div>' . $base;
		}

		self::$headings = $headings;

		return $base;
	}

	public function javascriptize( $s ) {
		$callback = 'showHideCallback';
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
	
	private function createWMLCard( $s, $title = '' ) {
		$segments = explode( $this->WMLSectionSeperator, $s );
		$card = '';
		$idx = 0;

		$requestedSegment = isset( $_GET['seg'] ) ? $_GET['seg'] : 0;
		$card .= "<card id='{$idx}' title='{$title}'><p>{$segments[$requestedSegment]}</p>";
		$idx = $requestedSegment + 1;
		$segmentsCount = count($segments);
		$card .= $idx . "/" . $segmentsCount;

		if ( $idx < $segmentsCount ) {
			$card .= "<p><a href='{$_SERVER['PHP_SELF']}?seg={$idx}'>Continue ...</a></p>";
		}

		if ( $idx > 1 ) {
			$back_idx = $requestedSegment - 1;
			$card .= "<p><a href='{$_SERVER['PHP_SELF']}?seg={$back_idx}'>Back ...</a></p>";
		}

		$card .= '</card>';
		return $card;
	}

	private function parseItemsToRemove() {
		$itemToRemoveRecords = array();

		foreach ( $this->itemsToRemove as $itemToRemove ) {
			$type = '';
			$rawName = '';
			CssDetection::detectIdCssOrTag( $itemToRemove, $type, $rawName );
			$itemToRemoveRecords[$type][] = $rawName;
		}

		return $itemToRemoveRecords;
	}

	public function DOMParse( $html ) {
		libxml_use_internal_errors( true );
		$this->doc = DOMDocument::loadHTML( '<?xml encoding="UTF-8">' . $html );
		libxml_use_internal_errors( false );
		$this->doc->preserveWhiteSpace = false;
		$this->doc->strictErrorChecking = false;
		$this->doc->encoding = 'UTF-8';

		$itemToRemoveRecords = $this->parseItemsToRemove();

		$titleNode = $this->doc->getElementsByTagName( 'title' );

		if ( $titleNode->length > 0 ) {
			$title = $titleNode->item( 0 )->nodeValue;
		}

		// Tags

		// You can't remove DOMNodes from a DOMNodeList as you're iterating
		// over them in a foreach loop. It will seemingly leave the internal
		// iterator on the foreach out of wack and results will be quite
		// strange. Though, making a queue of items to remove seems to work.
		// For example:

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

		if ( empty( $title ) ) {
			$title = 'Wikipedia';
		}
		
		$format = isset( $_GET['format'] ) ? $_GET['format'] : ''; 
		
		$dir = self::$dir;
		$code = self::$code;
		$regularWikipedia = self::$messages['patch-output-mobile-regular-wikipedia'];
		$permStopRedirect = self::$messages['patch-output-mobile-perm-stop-redirect'];
		$copyright = self::$messages['patch-output-mobile-copyright'];
		$homeButton = self::$messages['patch-output-mobile-home-button'];
		$randomButton = self::$messages['patch-output-mobile-random-button'];
		
		$cssFileName = ( isset( self::$device['css_file_name'] ) ) ? self::$device['css_file_name'] : 'default';
		
		if ( strlen( $contentHtml ) > 4000 && $this->contentFormat == 'XHTML' 
			&& self::$device['supports_javascript'] === true ) {
			$contentHtml =	$this->javascriptize( $contentHtml );
		} else if ( $this->contentFormat == 'WML' ) {
			$contentHtml = $this->javascriptize( $contentHtml );
			$contentHtml = $this->createWMLCard( $contentHtml, $title );
			require( 'views/layout/application.wml.php' );
		}
		
		if ( $this->contentFormat == 'XHTML' && $format != 'json' ) {
			require( 'views/notices/_donate.html.php' );
			require( 'views/layout/_search_webkit.html.php' );
			require( 'views/layout/_footmenu_default.html.php' );
			require( 'views/layout/application.html.php' );
		}
		
		if ( $format === 'json' ) {
			header( 'Content-Type: application/json' );
			header( 'Content-Disposition: attachment; filename="data.js";' );
			$json_data = array();
			$json_data['title'] = $title;
			$json_data['html'] = $contentHtml;
			
			$callback = isset( $_GET['callback'] ) ? $_GET['callback'] : '';
			
			$json = json_encode( $json_data );
			
			if ( !empty( $callback ) ) {
				$json = urlencode( $callback ) . '(' . $json . ')';
			} 
			
			return $json;
		}
		
		return $applicationHtml;
	}
}
