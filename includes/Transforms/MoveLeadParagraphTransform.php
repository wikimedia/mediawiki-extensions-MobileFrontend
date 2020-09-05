<?php

namespace MobileFrontend\Transforms;

use DOMDocument;
use DOMDocumentFragment;
use DOMElement;
use DOMNode;
use DOMXPath;

class MoveLeadParagraphTransform implements IMobileTransform {
	/**
	 * Rearranges content so that text in the lead paragraph is prioritised to appear
	 * before the infobox.
	 *
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$section = $node->getElementsByTagName( 'section' )->item( 0 );
		if ( $section instanceof DOMElement ) {
			$this->moveFirstParagraphUp( $section, $section->ownerDocument );
		}
	}

	/**
	 * Find first paragraph that has text content, i.e. paragraphs that are not empty
	 * This function will also filter out the paragraphs that have nodes containing whitespaces
	 * only.
	 * example: `<p> <span> </span> </p>` is not a lead paragraph
	 *
	 * Keep in sync with mobile.init/identifyLeadParagraph.js.
	 *
	 * @param DOMXPath $xPath XPath object to execute the query
	 * @param DOMElement $section Where to search for paragraphs
	 * @return DOMElement|null The lead paragraph
	 */
	private function identifyLeadParagraph( DOMXPath $xPath, DOMElement $section ) : ?DOMElement {
		$paragraphs = $xPath->query( './p', $section );

		$index = 0;
		while ( $index < $paragraphs->length ) {
			$node = $paragraphs->item( $index );
			if ( $node && !$this->isNonLeadParagraph( $xPath, $node ) ) {
				return $node;
			}

			++$index;
		}
		return null;
	}

	/**
	 * Extra the lead introduction, starting at the lead paragraph
	 *
	 * This will move all nodes up to the next paragraph into a fragment,
	 * e.g. including a list following the lead paragraph.
	 *
	 * Based on extractLeadIntroductionNodes in mobileapps' LeadIntroductionTransform.js
	 *
	 * @param DOMElement $leadParagraph Lead paragraph
	 * @return DOMDocumentFragment Lead introdction
	 */
	private function extractLeadIntroduction( DOMElement $leadParagraph ) : DOMDocumentFragment {
		$fragment = $leadParagraph->ownerDocument->createDocumentFragment();
		$node = $leadParagraph;
		do {
			// Store nextSibling before moving this node to the fragment
			$nextSibling = $node->nextSibling;
			$fragment->appendChild( $node );
			$node = $nextSibling;
		} while (
			$node && !(
				$node instanceof DOMElement &&
				strtolower( $node->tagName ) === 'p'
			)
		);
		return $fragment;
	}

	/**
	 * Get the last hatnote at the top of the page
	 *
	 * Anything that should stay above the lead paragraph is
	 * consider a hatnote.
	 *
	 * Based on moveLeadParagraphUp in mobileapps' MobileHTML.js
	 *
	 * @param DOMElement $leadSection Lead section
	 * @return DOMNode|null Last hatnote, null if there are none
	 */
	private function getLastHatNote( DOMElement $leadSection ) : ?DOMNode {
		$child = $leadSection->firstChild;
		$lastHatNote = null;
		$hatnotePattern = '/(^|\s)(hatnote|ambox)(\s|$)/';
		while (
			$child && (
				// Skip hatnotes and amboxes
				// Also skip text nodes and empty nodes that might appear
				// between hatnotes.
				!( $child instanceof DOMElement ) ||
				preg_match( $hatnotePattern, $child->getAttribute( 'class' ) ) ||
				!$this->isNotEmptyNode( $child )
			)
		) {
			$lastHatNote = $child;
			$child = $child->nextSibling;
		}
		return $lastHatNote;
	}

	/**
	 * Move the first paragraph in the lead section above the infobox
	 *
	 * In order for a paragraph to be moved the following conditions must be met:
	 *   - the lead section contains at least one infobox;
	 *   - the paragraph doesn't already appear before the first infobox
	 *     if any in the DOM;
	 *   - the paragraph contains visible text content
	 *   - article belongs to the MAIN namespace
	 *
	 * Additionally if paragraph immediate sibling is a list (ol or ul element), the list
	 * is also moved along with paragraph above infobox.
	 *
	 * Note that the first paragraph is not moved before hatnotes, or mbox or other
	 * elements that are not infoboxes.
	 *
	 * @param DOMElement $leadSection
	 * @param DOMDocument $doc Document to which the section belongs
	 */
	private function moveFirstParagraphUp( DOMElement $leadSection, DOMDocument $doc ) {
		$xPath = new DOMXPath( $doc );
		$leadParagraph = $this->identifyLeadParagraph( $xPath, $leadSection );
		if ( !$leadParagraph ) {
			return;
		}

		$afterElement = $this->getLastHatNote( $leadSection );
		$fragment = $this->extractLeadIntroduction( $leadParagraph );

		$beforeElement = $afterElement ? $afterElement->nextSibling : $leadSection->firstChild;
		$leadSection->insertBefore( $fragment, $beforeElement );
	}

	/**
	 * Check if the node contains any non-whitespace characters
	 *
	 * Keep in sync with mobile.init/identifyLeadParagraph.js.
	 *
	 * @param DOMNode $node
	 * @return bool
	 */
	private function isNotEmptyNode( DOMNode $node ) : bool {
		return (bool)preg_match( '/\S/', $node->textContent );
	}

	/**
	 * Checks if paragraph contains visible content and so
	 * could be considered the lead paragraph of the aricle.
	 *
	 * Keep in sync with mobile.init/identifyLeadParagraph.js.
	 *
	 * @param DOMXPath $xPath An XPath query
	 * @param DOMNode $node DOM Node to verify
	 * @return bool
	 */
	private function isNonLeadParagraph( DOMXPath $xPath, DOMNode $node ) : bool {
		if (
			$node->nodeType === XML_ELEMENT_NODE &&
			/** @phan-suppress-next-line PhanUndeclaredProperty DOMNode vs. DOMElement */
			$node->tagName === 'p' &&
			$this->isNotEmptyNode( $node )
		) {
			// Clone the node so we can modifiy it
			$node = $node->cloneNode( true );

			// Remove any TemplateStyle tags, or coordinate wrappers...
			$templateStyles = $xPath->query( '(.//style|.//span[@id="coordinates"])', $node );
			foreach ( $templateStyles as $style ) {
				$style->parentNode->removeChild( $style );
			}
			// ...and check again for emptiness
			if ( !$this->isNotEmptyNode( $node ) ) {
				return true;
			}

			return false;
		}
		return true;
	}
}
