<?php

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter {
	const WML_SECTION_SEPARATOR = '***************************************************************************';

	/**
	 * @var DOMDocument
	 */
	protected $doc;
	protected $format;
	protected $removeImages = false;
	protected $idWhitelist = array();

	/**
	 * @var Ttile
	 */
	protected $title;

	protected $expandableSections = false;

	private $headings = 0;

	/**
	 * @var WmlContext
	 */
	protected $wmlContext;

	/**
	 * Message cache, false if they should be loaded dynamically
	 * @var Array|bool
	 */
	protected $messages = false;

	private static $defaultItemsToRemove = array(
		'#contentSub',
		'div.messagebox',
		'#siteNotice',
		'#siteSub',
		'#jump-to-nav',
		'div.editsection',
		'div.infobox',
		'table.toc',
		'#catlinks',
		'div.stub',
		'form',
		'div.sister-project',
		'script',
		'div.magnify',
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

	private $itemsToRemove = array();

	public function __construct( $html, $title, $format, WmlContext $wmlContext = null ) {
		wfProfileIn( __METHOD__ );

		$this->title = $title;
		$this->format = $format;
		if ( !$wmlContext && $format == 'WML' ) {
			throw new MWException( __METHOD__ . '(): WML context not set' );
		}
		$this->wmlContext = $wmlContext;

		$html = mb_convert_encoding( $html, 'HTML-ENTITIES', "UTF-8" );
		libxml_use_internal_errors( true );
		$this->doc = new DOMDocument();
		$this->doc->loadHTML( '<?xml encoding="UTF-8">' . $html );
		libxml_use_internal_errors( false );
		$this->doc->preserveWhiteSpace = false;
		$this->doc->strictErrorChecking = false;
		$this->doc->encoding = 'UTF-8';
	}

	/**
	 * Use the given message cache
	 * @param Array $messages
	 */
	public function useMessages( Array $messages ) {
		$this->messages = $messages;
	}

	/**
	 * @return DOMDocument: DOM to manipulate 
	 */
	public function getDoc() {
		return $this->doc;
	}

	/**
	 * @return string: Output format
	 */
	public function getFormat() {
		return $this->format;
	}

	public function enableExpandableSections( $flag = true ) {
		$this->expandableSections = $flag;
	}

	/**
	 * Sets whether images should be removed from output
	 * @param bool $flag 
	 */
	public function removeImages( $flag = true ) {
		$this->removeImages = $flag;
	}

	/**
	 * Adds one or more selector of content to remove
	 * @param Array|string $selectors: Selector(s) of stuff to remove
	 */
	public function remove( $selectors ) {
		$this->itemsToRemove = array_merge( $this->itemsToRemove, (array)$selectors );
	}

	/**
	 * @param Array|string $ids: Id(s) of content to keep
	 */
	public function whitelistIds( $ids ) {
		$this->idWhitelist = array_merge( $this->idWhitelist, array_flip( (array)$ids ) );
	}

	/**
	 * Removes content inappropriate for mobile devices
	 * @global type $wgMFRemovableClasses
	 * @param type $removeDefaults 
	 */
	public function filterContent( $removeDefaults = true ) {
		global $wgMFRemovableClasses;

		wfProfileIn(__METHOD__ );
		if ( $removeDefaults ) {
			$this->itemsToRemove = array_merge( $this->itemsToRemove,
				self::$defaultItemsToRemove, $wgMFRemovableClasses
			);
		}
		$removals = $this->parseItemsToRemove();
		
		// Remove tags

		// You can't remove DOMNodes from a DOMNodeList as you're iterating
		// over them in a foreach loop. It will seemingly leave the internal
		// iterator on the foreach out of wack and results will be quite
		// strange. Though, making a queue of items to remove seems to work.
		// For example:

		$domElemsToRemove = array();
		foreach ( $removals['TAG'] as $tagToRemove ) {
			$tagToRemoveNodes = $this->doc->getElementsByTagName( $tagToRemove );
			foreach ( $tagToRemoveNodes as $tagToRemoveNode ) {
				$tagToRemoveNodeIdAttributeValue = '';
				if ( $tagToRemoveNode ) {
					$tagToRemoveNodeIdAttribute = $tagToRemoveNode->getAttributeNode( 'id' );
					if ( $tagToRemoveNodeIdAttribute ) {
						$tagToRemoveNodeIdAttributeValue = $tagToRemoveNodeIdAttribute->value;
					}
					if ( !isset( $this->idWhitelist[$tagToRemoveNodeIdAttributeValue] ) ) {
						$domElemsToRemove[] = $tagToRemoveNode;
					}
				}
			}
		}

		foreach ( $domElemsToRemove as $domElement ) {
			$domElement->parentNode->removeChild( $domElement );
		}

		// Elements with named IDs
		foreach ( $removals['ID'] as $itemToRemove ) {
			$itemToRemoveNode = $this->doc->getElementById( $itemToRemove );
			if ( $itemToRemoveNode ) {
				$itemToRemoveNode->parentNode->removeChild( $itemToRemoveNode );
			}
		}

		// CSS Classes
		$xpath = new DOMXpath( $this->doc );
		foreach ( $removals['CLASS'] as $classToRemove ) {
			$elements = $xpath->query( '//*[@class="' . $classToRemove . '"]' );

			foreach ( $elements as $element ) {
				$element->parentNode->removeChild( $element );
			}
		}

		// Tags with CSS Classes
		foreach ( $removals['TAG_CLASS'] as $classToRemove ) {
			$parts = explode( '.', $classToRemove );

			$elements = $xpath->query(
				'//' . $parts[0] . '[@class="' . $parts[1] . '"]'
			);

			foreach ( $elements as $element ) {
				$removedElement = $element->parentNode->removeChild( $element );
			}
		}

		// Handle red links with action equal to edit
		$redLinks = $xpath->query( '//a[@class="new"]' );
		foreach ( $redLinks as $redLink ) {
			// PHP Bug #36795 — Inappropriate "unterminated entity reference"
			$spanNode = $this->doc->createElement( "span", str_replace( "&", "&amp;", $redLink->nodeValue ) );

			if ( $redLink->hasAttributes() ) {
				$attributes = $redLink->attributes;
				foreach ( $attributes as $i => $attribute ) {
					if ( $attribute->name != 'href' ) {
						$spanNode->setAttribute( $attribute->name, $attribute->value );
					}
				}
			}

			$redLink->parentNode->replaceChild( $spanNode, $redLink );
		}
		wfProfileOut( __METHOD__ );
	}

	public function getText( $id = false, $prependHtml = '', $appendHtml = '' ) {
		wfProfileIn( __METHOD__ );
		$element = $id ? $this->doc->getElementById( $id ) : null;
		$html = $this->doc->saveXML( $element, LIBXML_NOEMPTYTAG );
		
		switch ( $this->format ) {
			case 'XHTML':
				if ( $this->expandableSections && strlen( $html ) > 4000 ) {
					$html = $this->headingTransform( $html );
				}
				break;
			case 'WML':
				$html = $this->headingTransform( $html );
				// Content removal for WML rendering
				$elements = array( 'span', 'div', 'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'sup', 'sub' );
				foreach ( $elements as $element ) {
					$html = preg_replace( '#</?' . $element . '[^>]*>#is', '', $html );
				}
				// Content wrapping
				$html = $this->createWMLCard( $html );
				break;
		}
		
		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * @param $matches array
	 * @return string
	 */
	private function headingTransformCallbackWML( $matches ) {
		wfProfileIn( __METHOD__ );
		static $headings = 0;
		++$headings;

		$base = self::WML_SECTION_SEPARATOR .
				"<h2 class='section_heading' id='section_{$headings}'>{$matches[2]}</h2>";

		$this->headings = $headings;
		wfProfileOut( __METHOD__ );
		return $base;
	}

	/**
	 * @param $matches array
	 * @return string
	 */
	private function headingTransformCallbackXHTML( $matches ) {
		wfProfileIn( __METHOD__ );
		if ( isset( $matches[0] ) ) {
			preg_match( '/id="([^"]*)"/', $matches[0], $headlineMatches );
		}

		$headlineId = ( isset( $headlineMatches[1] ) ) ? $headlineMatches[1] : '';

		static $headings = 0;
		$show = $this->msg( 'mobile-frontend-show-button' );
		$hide = $this->msg( 'mobile-frontend-hide-button' );
		$backToTop = $this->msg( 'mobile-frontend-back-to-top-of-section' );
		++$headings;
		// Back to top link
		$base = Html::openElement( 'div',
						array( 'id' => 'anchor_' . intval( $headings - 1 ),
								'class' => 'section_anchors', )
				) .
				Html::rawElement( 'a',
						array( 'href' => '#section_' . intval( $headings - 1 ),
								'class' => 'back_to_top' ),
								'&#8593;' . $backToTop ) .
				Html::closeElement( 'div' );
		// generate the HTML we are going to inject
		$buttons = Html::element( 'button',
					array( 'class' => 'section_heading show',
							'section_id' => $headings ),
							$show ) .
			Html::element( 'button',
					array( 'class' => 'section_heading hide',
							'section_id' => $headings ),
							$hide );
		if ( $this->expandableSections ) {
			$h2OnClick = 'javascript:wm_toggle_section(' . $headings . ');';
			$base .= Html::openElement( 'h2',
							array( 'class' => 'section_heading',
									'id' => 'section_' . $headings,
									'onclick' => $h2OnClick ) );
		} else {
			$base .= Html::openElement( 'h2',
							array( 'class' => 'section_heading',
									'id' => 'section_' . $headings ) );
		}
		$base .= $buttons .
				Html::rawElement( 'span',
						array( 'id' => $headlineId ),
								$matches[2] ) .
				Html::closeElement( 'h2' ) .
				Html::openElement( 'div',
						array( 'class' => 'content_block',
								'id' => 'content_' . $headings ) );

		if ( $headings > 1 ) {
			// Close it up here
			$base = Html::closeElement( 'div' ) . $base;
		}

		$this->headings = $headings;
		wfProfileOut( __METHOD__ );
		return $base;
	}

	/**
	 * @param $s string
	 * @return string
	 */
	protected function createWMLCard( $s ) {
		wfProfileIn( __METHOD__ );
		$segments = explode( self::WML_SECTION_SEPARATOR, $s );
		$card = '';
		$idx = 0;
		$requestedSegment = htmlspecialchars( $this->wmlContext->getRequestedSegment() );
		$title = htmlspecialchars( $this->title->getText() );
		$segmentText = $this->wmlContext->getOnlyThisSegment()
			? str_replace( self::WML_SECTION_SEPARATOR, '', $s )
			: $segments[$requestedSegment];

		$card .= "<card id='s{$idx}' title='{$title}'><p>{$segmentText}</p>";
		$idx = $requestedSegment + 1;
		$segmentsCount = $this->wmlContext->getOnlyThisSegment()
			? $idx + 1 // @todo: when using from API we don't have the total section count
			: count( $segments );
		$card .= "<p>" . $idx . "/" . $segmentsCount . "</p>";

		$useFormatParam = ( $this->wmlContext->getUseFormat() )
			? '&amp;useformat=' . $this->wmlContext->getUseFormat()
			: '';

		// Title::getLocalUrl doesn't work at this point since PHP 5.1.x, all objects have their destructors called
		// before the output buffer callback function executes.
		// Thus, globalized objects will not be available as expected in the function.
		// This is stated to be intended behavior, as per the following: [http://bugs.php.net/bug.php?id=40104]
		$defaultQuery = wfCgiToArray( preg_replace( '/^.*?(\?|$)/', '', $this->wmlContext->getCurrentUrl() ) );
		unset( $defaultQuery['seg'] );
		unset( $defaultQuery['useformat'] );

		$qs = wfArrayToCGI( $defaultQuery );
		$delimiter = ( !empty( $qs ) ) ? '?' : '';
		$basePageParts = wfParseUrl( $this->wmlContext->getCurrentUrl() );
		$basePage = $basePageParts['scheme'] . $basePageParts['delimiter'] . $basePageParts['host'] . $basePageParts['path'] . $delimiter . $qs;
		$appendDelimiter = ( $delimiter === '?' ) ? '&amp;' : '?';

		if ( $idx < $segmentsCount ) {
			$card .= "<p><a href=\"{$basePage}{$appendDelimiter}seg={$idx}{$useFormatParam}\">"
				. $this->msg( 'mobile-frontend-wml-continue' ) . "</a></p>";
		}

		if ( $idx > 1 ) {
			$back_idx = $requestedSegment - 1;
			$card .= "<p><a href=\"{$basePage}{$appendDelimiter}seg={$back_idx}{$useFormatParam}\">"
				. $this->msg( 'mobile-frontend-wml-back' ) . "</a></p>";
		}

		$card .= '</card>';
		wfProfileOut( __METHOD__ );
		return $card;
	}

	/**
	 * @param $s string
	 * @return string
	 */
	protected function headingTransform( $s ) {
		wfProfileIn( __METHOD__ );
		$callback = "headingTransformCallback{$this->format}";

		// Closures are a PHP 5.3 feature.
		// MediaWiki currently requires PHP 5.2.3 or higher.
		// So, using old style for now.
		$s = preg_replace_callback(
			'/<h2(.*)<span class="mw-headline" [^>]*>(.+)<\/span>\w*<\/h2>/',
			array( $this, $callback ),
			$s
		);

		// if we had any, make sure to close the whole thing!
		if ( $this->headings > 0 ) {
			$s = str_replace(
				'<div class="visualClear">',
				'</div><div class="visualClear">',
				$s
			);
		}
		wfProfileOut( __METHOD__ );
		return $s;
	}

	/**
	 * Returns interface message text
	 * @param string $key: Message key
	 * @return string
	 */
	protected function msg( $key ) {
		if ( !$this->messages ) {
			return wfMsg( $key );
		} elseif ( isset( $this->messages[$key] ) ) {
			return $this->messages[$key];
		}
		throw new MWException( __METHOD__ . ": unrecognised message key '$key' in cached mode" );
	}

	/**
	 * @return array
	 */
	private function parseItemsToRemove() {
		wfProfileIn( __METHOD__ );
		$removals = array();

		foreach ( $this->itemsToRemove as $itemToRemove ) {
			$type = '';
			$rawName = '';
			CssDetection::detectIdCssOrTag( $itemToRemove, $type, $rawName );
			$removals[$type][] = $rawName;
		}

		if ( $this->removeImages ) {
			$removals['TAG'][] = "img";
			$removals['TAG'][] = "audio";
			$removals['TAG'][] = "video";
			$removals['CLASS'][] = "thumb tright";
			$removals['CLASS'][] = "thumb tleft";
			$removals['CLASS'][] = "thumbcaption";
			$removals['CLASS'][] = "gallery";
		}

		wfProfileOut( __METHOD__ );
		return $removals;
	}
}
