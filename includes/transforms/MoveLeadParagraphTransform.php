<?php

namespace MobileFrontend\Transforms;

use DOMXPath;
use MobileContext;
use DOMElement;
use DOMDocument;

class MoveLeadParagraphTransform implements IMobileTransform {
	/**
	 * @param string $title for logging purposes
	 * @param number $revId for logging purposes
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
	 * @param string $requiredNodeName Required tag name, has to be lowercase
	 * @param string $requiredClass Required class name
	 * @return bool
	 */
	private static function matchElement( DOMElement $node, $requiredNodeName, $requiredClass ) {
		$classes = explode( ' ', $node->getAttribute( 'class' ) );
		return strtolower( $node->nodeName ) === $requiredNodeName
			&& in_array( $requiredClass, $classes );
	}

	/**
	 * Works out if the infobox is wrapped
	 * @param DomElement $node of infobox
	 * @param string $wrapperClass (optional) a required classname for wrapper
	 * @return DomElement representing an unwrapped infobox or an element that wraps the infobox
	 */
	public static function getInfoboxContainer( $node, $wrapperClass = 'mw-stack' ) {
		$infobox = false;

		// iterate to the top.
		while ( $node->parentNode ) {
			if ( self::matchElement( $node, 'table', 'infobox' ) ||
				self::matchElement( $node, 'div', $wrapperClass ) ) {
				$infobox = $node;
			}
			$node = $node->parentNode;
		}
		return $infobox;
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
		$infoboxes = $xPath->query( './/table[contains(@class,"infobox")]', $leadSectionBody );
		$paragraphs = $xPath->query( './p[string-length(text()) > 0]', $leadSectionBody );

		// If we have an infobox without a previous sibling then it's time for action!
		if ( $infoboxes->length > 0 ) {
			$infobox = self::getInfoboxContainer( $infoboxes->item( 0 ) );
			$firstP = $paragraphs->item( 0 );

			if ( $firstP && $infobox && $infobox->parentNode === $leadSectionBody ) {
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
			} elseif ( $infobox->parentNode !== $leadSectionBody ) {
				/**
				 * @see https://phabricator.wikimedia.org/T149884
				 * @todo remove after research is done
				 */
				if ( MobileContext::singleton()->getMFConfig()->get( 'MFLogWrappedInfoboxes' ) ) {
					$this->logInfoboxesWrappedInContainers();
				}
			}
		}
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
