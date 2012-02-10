<?php

/**
 * Converts HTML into a mobile-friendly version
 */
class DomManipulator {
	/**
	 * @var DOMDocument
	 */
	protected $doc;
	protected $format;
	protected $removeImages = false;
	protected $idWhitelist = array();

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

	public function __construct( $html, $format ) {
		wfProfileIn( __METHOD__ );

		$this->format = $format;

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
