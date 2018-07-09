<?php

namespace MobileFrontend\Transforms;

use DOMXPath;
use MobileContext;
use DOMElement;
use DOMDocument;

class MoveLeadParagraphTransform implements IMobileTransform {
	/**
	 * @var string
	 */
	private $title;

	/**
	 * @var int
	 */
	private $revId;

	/**
	 * @param string $title for logging purposes
	 * @param int $revId for logging purposes
	 */
	public function __construct( $title, $revId ) {
		$this->title = $title;
		$this->revId = $revId;
	}

	/**
	 * Rearranges content so that text in the lead paragraph is prioritised to appear
	 * before the infobox
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$this->moveFirstParagraphBeforeInfobox( $node, $node->ownerDocument );
	}

	/**
	 * Helper function to verify that passed $node matched nodename and has set required classname
	 * @param DOMElement $node Node to verify
	 * @param string|boolean $requiredNodeName Required tag name, has to be lowercase
	 *   if false it is ignored and requiredClass is used.
	 * @param string $requiredClass Regular expression with required class name
	 * @return bool
	 */
	private static function matchElement( DOMElement $node, $requiredNodeName, $requiredClass ) {
		$classes = explode( ' ', $node->getAttribute( 'class' ) );
		return ( $requiredNodeName === false || strtolower( $node->nodeName ) === $requiredNodeName )
			&& !empty( preg_grep( $requiredClass, $classes ) );
	}

	/**
	 * Works out if the infobox is wrapped
	 * @param DomElement $node of infobox
	 * @param string $wrapperClass (optional) regex for matching required classname for wrapper
	 * @return DomElement representing an unwrapped infobox or an element that wraps the infobox
	 */
	public static function getInfoboxContainer( $node, $wrapperClass = '/^(mw-stack|collapsible)$/' ) {
		$infobox = false;

		// iterate to the top.
		while ( $node->parentNode ) {
			if ( self::matchElement( $node, 'table', '/^infobox$/' ) ||
				self::matchElement( $node, false, $wrapperClass ) ) {
				$infobox = $node;
			}
			$node = $node->parentNode;
		}
		return $infobox;
	}

	/**
	 * Iterate up the DOM tree until find a parent node which has the parent $parent
	 * @param DomElement $node
	 * @param DomElement $parent
	 * @return DomElement representing a node which is either $node or an ancestor of $node which
	 *  has a parent $parent. Note, it is assumed that $node will always be a descendent of $parent so
	 *  if this is not true, you probably shouldn't be using this function and I, as the writer of this
	 *  code cannot be held responsible for portals that open to another dimension or your laptop
	 *  setting on fire.
	 */
	private static function findParentWithParent( $node, $parent ) {
		$search = $node;
		while ( $search->parentNode && !$search->parentNode->isSameNode( $parent ) ) {
			$search = $search->parentNode;
		}
		return $search;
	}

	/**
	 * Move the first paragraph in the lead section above the infobox
	 *
	 * In order for a paragraph to be moved the following conditions must be met:
	 *   - the lead section contains at least one infobox;
	 *   - the paragraph doesn't already appear before the first infobox
	 *     if any in the DOM;
	 *   - the paragraph contains text content, e.g. no <p></p>;
	 *   - the paragraph doesn't contain coordinates, i.e. span#coordinates.
	 *   - article belongs to the MAIN namespace
	 *
	 * Additionally if paragraph immediate sibling is a list (ol or ul element), the list
	 * is also moved along with paragraph above infobox.
	 *
	 * Note that the first paragraph is not moved before hatnotes, or mbox or other
	 * elements that are not infoboxes.
	 *
	 * @param DOMElement $leadSectionBody
	 * @param DOMDocument $doc Document to which the section belongs
	 */
	private function moveFirstParagraphBeforeInfobox( $leadSectionBody, $doc ) {
		$xPath = new DOMXPath( $doc );
		// Find infoboxes and paragraphs that have text content, i.e. paragraphs
		// that are not empty nor are wrapper paragraphs that contain span#coordinates.
		$xPathQuery = './/table[starts-with(@class,"infobox") or contains(@class," infobox")]';
		$infoboxes = $xPath->query( $xPathQuery, $leadSectionBody );
		$paragraphs = $xPath->query( './p[string-length(text()) > 0]', $leadSectionBody );
		// If we have an infobox without a previous sibling then it's time for action!
		if ( $infoboxes->length > 0 ) {
			$infobox = self::getInfoboxContainer( $infoboxes->item( 0 ) );
			$firstP = $paragraphs->item( 0 );
			$wrappedInfobox = $infobox && !$infobox->parentNode->isSameNode( $leadSectionBody );

			if ( $firstP && $infobox && !$wrappedInfobox &&
				$this->hasNoNonEmptyPrecedingParagraphs( $xPath, $infobox )
			) {
				$listElementAfterParagraph = null;
				$where = $infobox;

				$elementAfterParagraphQuery = $xPath->query( 'following-sibling::*[1]', $firstP );
				if ( $elementAfterParagraphQuery->length > 0 ) {
					$elem = $elementAfterParagraphQuery->item( 0 );
					if ( $elem->tagName === 'ol' || $elem->tagName === 'ul' ) {
						$listElementAfterParagraph = $elem;
					}
				}

				$leadSectionBody->insertBefore( $firstP, $where );
				if ( $listElementAfterParagraph !== null ) {
					$leadSectionBody->insertBefore( $listElementAfterParagraph, $where );
				}
			} elseif ( $infobox && $wrappedInfobox ) {
				$isInWrongPlace = $this->hasNoNonEmptyPrecedingParagraphs( $xPath,
					self::findParentWithParent( $infobox, $leadSectionBody )
				);
				$loggingEnabled = MobileContext::singleton()->getMFConfig()->get( 'MFLogWrappedInfoboxes' );
				/**
				 * @see https://phabricator.wikimedia.org/T149884
				 * @todo remove after research is done
				 */
				if ( $isInWrongPlace && $loggingEnabled ) {
					$this->logInfoboxesWrappedInContainers();
				}
			}
		}
	}

	/**
	 * Check if there are any non-empty siblings before $element
	 *
	 * @param DOMXPath $xPath
	 * @param DOMElement $element
	 * @return bool
	 */
	private function hasNoNonEmptyPrecedingParagraphs( DOMXPath $xPath, DOMElement $element ) {
		$node = $element->previousSibling;
		while ( $node !== null ) {
			if ( $node->nodeType === XML_ELEMENT_NODE
				 && $node->tagName === 'p'
				 && ( $node->hasChildNodes() || $node->nodeValue != '' ) ) {

				// we found a non-empty p element but it might be a coordinates wrapper
				$coords = $xPath->query( './/span[@id="coordinates"]', $node );
				if ( $coords->length === 0 ) {
					return false;
				}
			}
			$node = $node->previousSibling;
		}
		return true;
	}

	/**
	 * Finds all infoboxes which are one or more levels deep in $xPath content. When at least one
	 * element is found - log the page title and revision
	 *
	 * @see https://phabricator.wikimedia.org/T149884
	 * @param $leadSectionBody
	 * @param DOMXPath $xPath
	 */
	private function logInfoboxesWrappedInContainers() {
		\MediaWiki\Logger\LoggerFactory::getInstance( 'mobile' )->info(
			"Found infobox wrapped with container on {$this->title} (rev:{$this->revId})"
		);
	}
}
