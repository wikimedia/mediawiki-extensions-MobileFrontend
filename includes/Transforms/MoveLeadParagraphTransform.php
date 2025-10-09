<?php

namespace MobileFrontend\Transforms;

use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;
use Wikimedia\Parsoid\DOM\Document;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\DOM\Node;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

class MoveLeadParagraphTransform implements IMobileTransform {
	/**
	 * @var Title|string
	 */
	private $title;
	private int $revId;

	/**
	 * @param Title|string $title for logging purposes
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
	 * @param Element $node to be transformed
	 */
	public function apply( Element $node ) {
		$section = DOMCompat::querySelector( $node, 'section' );
		if ( $section ) {
			$this->moveFirstParagraphBeforeInfobox( $section, $section->ownerDocument );
		}
	}

	/**
	 * Iterate up the DOM tree until find a parent node which has the parent $parent
	 * @param Node $node
	 * @param Node $parent
	 * @return Node representing a node which is either $node or an ancestor of $node which
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
		// @var Node $search We assert this will always find a parent.
		'@phan-var Node $search';
		return $search;
	}

	/**
	 * Extract the first infobox in document
	 * @param Element $section Where to search for an infobox
	 * @return Element|null The first infobox
	 */
	private function identifyInfoboxElement( Element $section ): ?Element {
		$infobox = DOMCompat::querySelector(
			$section,
			// Infoboxes are .infobox, and thumbnail images are .thumb, figure
			'.infobox, .thumb, figure'
		);

		if ( $infobox instanceof Element ) {
			// Check if the infobox is inside a container
			$node = $infobox;
			// Traverse up
			while ( $node->parentNode ) {
				$classList = DOMCompat::getClassList( $node );
				if ( $classList->contains( 'mw-stack' ) ||
					 $classList->contains( 'collapsible' ) ) {
					$infobox = $node;
				}
				$node = $node->parentNode;
			}
			// For images, include any containers.
			// We don't need to check if the parent is an infobox, because it
			// would've matched first in the selector query.
			if (
				DOMUtils::nodeName( $infobox ) === 'figure' ||
				DOMCompat::getClassList( $infobox )->contains( 'thumb' )
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
	 * Keep in sync with mobile.editor.overlay/identifyLeadParagraph.js.
	 *
	 * @param Element $section Where to search for paragraphs
	 * @return Element|null The lead paragraph
	 */
	private function identifyLeadParagraph( Element $section ): ?Element {
		$paragraphs = DOMCompat::querySelectorAll( $section, ':scope > p' );
		foreach ( $paragraphs as $node ) {
			if ( !$this->isNonLeadParagraph( $node ) ) {
				return $node;
			}
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
	 * @param Element $leadSection
	 * @param ?Document $doc Document to which the section belongs
	 */
	private function moveFirstParagraphBeforeInfobox( Element $leadSection, ?Document $doc ) {
		if ( $doc === null ) {
			return;
		}
		$infobox = $this->identifyInfoboxElement( $leadSection );

		if ( $infobox ) {
			$leadParagraph = $this->identifyLeadParagraph( $leadSection );
			$isTopLevelInfobox = $infobox->parentNode->isSameNode( $leadSection );

			if ( $leadParagraph && $isTopLevelInfobox &&
				$this->isPreviousSibling( $infobox, $leadParagraph )
			) {
				$listElementAfterParagraph = null;
				$where = $infobox;

				$elementAfterParagraph = DOMCompat::getNextElementSibling(
					$leadParagraph
				);
				if ( $elementAfterParagraph ) {
					$nodeName = DOMUtils::nodeName( $elementAfterParagraph );
					if ( $nodeName === 'ol' || $nodeName === 'ul' ) {
						$listElementAfterParagraph = $elementAfterParagraph;
					}
				}

				$leadSection->insertBefore( $leadParagraph, $where );
				if ( $listElementAfterParagraph !== null ) {
					$leadSection->insertBefore( $listElementAfterParagraph, $where );
				}
			} elseif ( !$isTopLevelInfobox ) {
				$isInWrongPlace = $this->hasNoNonEmptyPrecedingParagraphs(
					/** @phan-suppress-next-line PhanTypeMismatchArgumentSuperType Node vs. Element */
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
	 * @param Node $node
	 * @return bool
	 */
	private function isNotEmptyNode( Node $node ) {
		return (bool)preg_match( '/\S/', $node->textContent );
	}

	/**
	 * Checks if paragraph contains visible content and so
	 * could be considered the lead paragraph of the aricle.
	 *
	 * Keep in sync with mobile.init/identifyLeadParagraph.js.
	 *
	 * @param Node $node DOM Node to verify
	 * @return bool
	 */
	private function isNonLeadParagraph( $node ) {
		if (
			$node->nodeType === XML_ELEMENT_NODE &&
			DOMUtils::nodeName( $node ) === 'p' &&
			$this->isNotEmptyNode( $node )
		) {
			// Clone the node so we can modifiy it
			$node = $node->cloneNode( true );
			// @var Element $node
			'@phan-var Element $node';

			// Remove any TemplateStyle tags, or coordinate wrappers...
			$templateStyles = DOMCompat::querySelectorAll(
				$node, 'style, span#coordinates'
			);
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
	 * @param Node $first
	 * @param Node $second
	 * @return bool
	 */
	private function isPreviousSibling( Node $first, Node $second ) {
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
	 * @param Element $element
	 * @return bool
	 */
	private function hasNoNonEmptyPrecedingParagraphs( Element $element ) {
		$node = $element->previousSibling;
		while ( $node !== null ) {
			if ( !$this->isNonLeadParagraph( $node ) ) {
				return false;
			}
			$node = $node->previousSibling;
		}
		return true;
	}

	/**
	 * Finds all infoboxes which are one or more levels deep in content. When at least one
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
