<?php

namespace MobileFrontend\Transforms;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use MediaWiki\MediaWikiServices;

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
	 * before the infobox. Lead
	 *
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$section = $node->getElementsByTagName( 'section' )->item( 0 );
		if ( $section ) {
			/** @phan-suppress-next-line PhanTypeMismatchArgument DOMNode vs. DOMElement */
			$this->moveFirstParagraphBeforeInfobox( $section, $section->ownerDocument );
		}
	}

	/**
	 * Helper function to verify that passed $node matched tagName and has set required classname
	 * @param DOMElement $node Node to verify
	 * @param string|bool $requiredTagName Required tag name, has to be lowercase
	 *   if false it is ignored and requiredClass is used.
	 * @param string $requiredClass Regular expression with required class name
	 * @return bool
	 */
	private static function matchElement( DOMElement $node, $requiredTagName, $requiredClass ) {
		$classes = explode( ' ', $node->getAttribute( 'class' ) );
		return ( $requiredTagName === false || strtolower( $node->tagName ) === $requiredTagName )
			&& !empty( preg_grep( $requiredClass, $classes ) );
	}

	/**
	 * Iterate up the DOM tree until find a parent node which has the parent $parent
	 * @param DOMNode $node
	 * @param DOMNode $parent
	 * @return DOMNode representing a node which is either $node or an ancestor of $node which
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
	 * Extract the first infobox in document
	 * @param DOMXPath $xPath XPath object to execute the query
	 * @param DOMElement $section Where to search for an infobox
	 * @return DOMElement|null The first infobox
	 */
	private function identifyInfoboxElement( DOMXPath $xPath, DOMElement $section ) : ?DOMElement {
		$paths = [
			// Infoboxes: *.infobox
			'.//*[contains(concat(" ",normalize-space(@class)," ")," infobox ")]',
			// Thumbnail images: .thumb, figure (Parsoid)
			'.//*[contains(concat(" ",normalize-space(@class)," ")," thumb ")]',
			'.//figure',
		];
		$query = '(' . implode( '|', $paths ) . ')';
		$infobox = $xPath->query( $query, $section )->item( 0 );

		if ( $infobox instanceof DOMElement ) {
			// Check if the infobox is inside a container
			$node = $infobox;
			$wrapperClass = '/^(mw-stack|collapsible)$/';
			// Traverse up
			while ( $node->parentNode ) {
				if ( self::matchElement( $node, false, $wrapperClass ) ) {
					$infobox = $node;
				}
				$node = $node->parentNode;
			}
			// For images, include any containers.
			// We don't need to check if the parent is an infobox, because it
			// would've matched first in the XPath query.
			if (
				strtolower( $infobox->tagName ) === 'figure' ||
				strpos( $infobox->getAttribute( 'class' ), 'thumb' ) !== false
			) {
				while ( $infobox->parentNode !== $section ) {
					$infobox = $infobox->parentNode;
				}
			}
			return $infobox;
		}
		return null;
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
	private function moveFirstParagraphBeforeInfobox( DOMElement $leadSection, DOMDocument $doc ) {
		$xPath = new DOMXPath( $doc );
		$infobox = $this->identifyInfoboxElement( $xPath, $leadSection );

		if ( $infobox ) {
			$leadParagraph = $this->identifyLeadParagraph( $xPath, $leadSection );
			$isTopLevelInfobox = $infobox->parentNode->isSameNode( $leadSection );

			if ( $leadParagraph && $isTopLevelInfobox &&
				$this->isPreviousSibling( $infobox, $leadParagraph )
			) {
				$listElementAfterParagraph = null;
				$where = $infobox;

				$elementAfterParagraphQuery = $xPath->query( 'following-sibling::*[1]', $leadParagraph );
				if ( $elementAfterParagraphQuery->length > 0 ) {
					$elem = $elementAfterParagraphQuery->item( 0 );
					/** @phan-suppress-next-line PhanUndeclaredProperty DOMNode vs. DOMElement */
					if ( $elem->tagName === 'ol' || $elem->tagName === 'ul' ) {
						$listElementAfterParagraph = $elem;
					}
				}

				$leadSection->insertBefore( $leadParagraph, $where );
				if ( $listElementAfterParagraph !== null ) {
					$leadSection->insertBefore( $listElementAfterParagraph, $where );
				}
			} elseif ( !$isTopLevelInfobox ) {
				$isInWrongPlace = $this->hasNoNonEmptyPrecedingParagraphs( $xPath,
					/** @phan-suppress-next-line PhanTypeMismatchArgument DOMNode vs. DOMElement */
					self::findParentWithParent( $infobox, $leadSection )
				);
				$loggingEnabled = MediaWikiServices::getInstance()
					->getService( 'MobileFrontend.Config' )->get( 'MFLogWrappedInfoboxes' );
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
	 * Check if the node contains any non-whitespace characters
	 *
	 * Keep in sync with mobile.init/identifyLeadParagraph.js.
	 *
	 * @param DOMNode $node
	 * @return bool
	 */
	private function isNotEmptyNode( DOMNode $node ) {
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
	private function isNonLeadParagraph( $xPath, $node ) {
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

	/**
	 * Check if the $first is previous sibling of $second
	 *
	 * Both nodes ($first and $second) most probably will be located in the beginning of
	 * article, because of that it's better to loop backward from $second to $first.
	 * Usually those two elements should be in order, it means that we will do only one
	 * `isSameNode()` check. If those elements are not in the order, we will quickly get to
	 * $node->previousSibling==null and return false instead of the whole traversing document.
	 *
	 * @param DOMNode $first
	 * @param DOMNode $second
	 * @return bool
	 */
	private function isPreviousSibling( DOMNode $first, DOMNode $second ) {
		$node = $second->previousSibling;
		while ( $node !== null ) {
			if ( $node->isSameNode( $first ) ) {
				return true;
			}
			$node = $node->previousSibling;
		}
		return false;
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
			if ( !$this->isNonLeadParagraph( $xPath, $node ) ) {
				return false;
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
	 */
	private function logInfoboxesWrappedInContainers() {
		\MediaWiki\Logger\LoggerFactory::getInstance( 'mobile' )->info(
			"Found infobox wrapped with container on {$this->title} (rev:{$this->revId})"
		);
	}
}
