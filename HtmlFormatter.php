<?php

/**
 * Performs transformations of HTML
 */
class HtmlFormatter {
	/**
	 * @var DOMDocument
	 */
	protected $doc;

	private $itemsToRemove = array();
	private $elementsToFlatten = array();
	private $removeImages = false;
	private $idWhitelist = array();
	private $flattenRedLinks = false;

	/**
	 * Constructor
	 *
	 * @param string $html: Text to process
	 */
	public function __construct( $html ) {
		wfProfileIn( __METHOD__ );

		$html = mb_convert_encoding( $html, 'HTML-ENTITIES', "UTF-8" );
		libxml_use_internal_errors( true );
		$this->doc = new DOMDocument();
		$this->doc->loadHTML( '<?xml encoding="UTF-8">' . $html );
		libxml_use_internal_errors( false );
		$this->doc->preserveWhiteSpace = false;
		$this->doc->strictErrorChecking = false;
		$this->doc->encoding = 'UTF-8';

		wfProfileOut( __METHOD__ );
	}

	/**
	 * Turns a chunk of HTML into a proper document
	 * @param string $html
	 * @return string
	 */
	public static function wrapHTML( $html ) {
		return '<!doctype html><html><head></head><body>' . $html . '</body></html>';
	}

	/**
	 * Override this in descendant class to modify HTML after it has been converted from DOM tree
	 * @param string $html: HTML to process
	 * @return string: Processed HTML
	 */
	protected function onHtmlReady( $html ) {
		return $html;
	}

	/**
	 * @return DOMDocument: DOM to manipulate
	 */
	public function getDoc() {
		return $this->doc;
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
	 * Adds one or more element name to the list to flatten (remove tag, but not its content)
	 * @param Array|string $elements: Name(s) of tag(s) to flatten
	 */
	public function flatten( $elements ) {
		$this->elementsToFlatten = array_merge( $this->elementsToFlatten, (array)$elements );
	}

	/**
	 * Sets whether red links should be flattened
	 * @param bool $flag
	 */
	public function flattenRedLinks( $flag = true ) {
		$this->flattenRedLinks = $flag;
	}

	/**
	 * @param Array|string $ids: Id(s) of content to keep
	 */
	public function whitelistIds( $ids ) {
		$this->idWhitelist = array_merge( $this->idWhitelist, array_flip( (array)$ids ) );
	}

	/**
	 * Removes content inappropriate for mobile devices
	 */
	public function filterContent() {
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
		if ( $this->flattenRedLinks ) {
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
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * Performs final transformations and returns resulting HTML
	 *
	 * @param DOMElement|string|null $element: ID of element to get HTML from or false to get it from the whole tree
	 * @return string: Processed HTML
	 */
	public function getText( $element = null ) {
		wfProfileIn( __METHOD__ );

		if ( $element !== null && !( $element instanceof DOMElement ) ) {
			$element = $this->doc->getElementById( $element );
		}
		$html = $this->doc->saveXML( $element, LIBXML_NOEMPTYTAG );
		if ( !$element ) {
			$html = preg_replace( '/<!--.*?-->|^.*?<body>|<\/body>.*$/s', '', $html );
		}
		$html = $this->onHtmlReady( $html );

		if ( $this->elementsToFlatten ) {
			$elements = implode( '|', $this->elementsToFlatten );
			$html = preg_replace( "#</?($elements)\\b[^>]*>#is", '', $html );
		}

		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * Transforms CSS selectors into an internal representation suitable for processing
	 * @return array
	 */
	protected function parseItemsToRemove() {
		wfProfileIn( __METHOD__ );
		$removals = array(
			'ID' => array(),
			'TAG' => array(),
			'CLASS' => array(),
			'TAG_CLASS' => array(),
		);

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
