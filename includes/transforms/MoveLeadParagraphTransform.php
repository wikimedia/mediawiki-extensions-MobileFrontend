<?php

namespace MobileFrontend\Transforms;

use DOMXPath;
use MobileContext;
use DOMElement;

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
		$infoboxAndParagraphs = $xPath->query(
			'./table[contains(@class,"infobox")] | ./p[string-length(text()) > 0]',
			$leadSectionBody
		);
		// We need both an infobox and a paragraph and the first element of our query result
		// ought to be an infobox.
		if ( $infoboxAndParagraphs->length >= 2 &&
			$infoboxAndParagraphs->item( 0 )->nodeName == 'table'
		) {
			$firstP = null;
			for ( $i = 1; $i < $infoboxAndParagraphs->length; $i++ ) {
				if ( $infoboxAndParagraphs->item( $i )->nodeName == 'p' ) {
					$firstP = $infoboxAndParagraphs->item( $i );
					break;
				}
			}
			if ( $firstP ) {
				$listElementAfterParagraph = null;
				$where = $infoboxAndParagraphs->item( 0 );

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
			}
		}
		/**
		 * @see https://phabricator.wikimedia.org/T149884
		 * @todo remove after research is done
		 */
		if ( MobileContext::singleton()->getMFConfig()->get( 'MFLogWrappedInfoboxes' ) ) {
			$this->logInfoboxesWrappedInContainers( $leadSectionBody, $xPath );
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
	private function logInfoboxesWrappedInContainers( $leadSectionBody, DOMXPath $xPath ) {
		$infoboxes = $xPath->query( './*//table[contains(@class,"infobox")]' .
			'[not(ancestor::table[contains(@class,"infobox")])]', $leadSectionBody );
		if ( $infoboxes->length > 0 ) {
			\MediaWiki\Logger\LoggerFactory::getInstance( 'mobile' )->info(
				"Found infobox wrapped with container on {$this->title} (rev:{$this->revId})"
			);
		}
	}
}
