<?php

namespace MobileFrontend\Transforms;

use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Document;
use Wikimedia\Parsoid\DOM\Element;

/**
 * Collapse the lead infoboxes into a "Quick facts" section.
 *
 * Detaches every infobox from the lead of an article and re-presents them
 * under a shared "Quick facts" heading, immediately after the lead text and
 * before the first real section, at all screen widths. Infoboxes outside the
 * lead are left untouched. Because this happens server-side, the section is
 * in the initial HTML and never reflows (no layout shift), and it reuses the
 * existing mobile section-collapsing logic so it collapses/expands like any
 * other section.
 *
 * The transform runs from ExtMobileFrontend::domParseMobile() and
 * requires Parsoid output: the lead section is already split into a
 * `<section data-mw-section-id="0">`. The script that makes sections open
 * and close (see `src/mobile.init/sectionCollapsing.js`) finds the new
 * section on its own, by looking for elements matching
 * `.mw-parser-output > section > .mw-heading`:
 *
 *       <section class="mf-quick-facts">
 *         <div class="mw-heading mw-heading2"><h2 id="…">Quick facts</h2></div>
 *         <div class="mf-quick-facts__content"><!-- infobox --></div>
 *       </section>
 *
 * When there are no infoboxes in the lead, or the input isn't Parsoid output,
 * the transform is a no-op.
 *
 * @see IMobileTransform
 */
class QuickFactsTransform implements IMobileTransform {

	/**
	 * ID given to the generated heading. The script that makes sections open
	 * and close builds the content element's id from it (`<id>-collapsible-content`).
	 */
	private const HEADING_ID = 'mf-quick-facts';

	private const LEAD_SECTION_SELECTOR = 'section[data-mw-section-id="0"]';

	/**
	 * @param string $headingText Localized label for the section heading.
	 */
	public function __construct(
		private readonly string $headingText,
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function apply( Element $node ): void {
		$leadSection = DOMCompat::querySelector( $node, self::LEAD_SECTION_SELECTOR );
		if ( !$leadSection instanceof Element ) {
			return;
		}

		$infoboxes = $this->identifyInfoboxes( $leadSection );
		if ( !$infoboxes ) {
			return;
		}

		$parent = $leadSection->parentNode;
		$doc = $node->ownerDocument;
		if ( $parent === null || $doc === null ) {
			return;
		}

		$section = $doc->createElement( 'section' );
		$section->setAttribute( 'class', 'mf-quick-facts' );
		$section->appendChild( $this->buildHeadingWrapper( $doc ) );
		$section->appendChild( $this->buildContent( $doc, $infoboxes ) );

		// Insert immediately after the lead section, before the first real section.
		$parent->insertBefore( $section, $leadSection->nextSibling );
	}

	/**
	 * Find every infobox to move, walking each up to the highest ancestor that
	 * is still a direct child of the lead section so any wrapping element
	 * moves with it. Infoboxes sharing the same wrapper are only returned once.
	 *
	 * @param Element $leadSection
	 * @return Element[]
	 */
	private function identifyInfoboxes( Element $leadSection ): array {
		$wrappers = [];
		foreach ( DOMCompat::querySelectorAll( $leadSection, '.infobox' ) as $infobox ) {
			// Walk up to the direct child of the lead section that contains the
			// infobox, so infoboxes wrapped in another element like .mw-stack or
			// .collapsible move cleanly.
			$node = $infobox;
			while (
				$node->parentNode instanceof Element &&
				!$node->parentNode->isSameNode( $leadSection )
			) {
				$node = $node->parentNode;
			}

			$alreadyFound = false;
			foreach ( $wrappers as $wrapper ) {
				if ( $wrapper->isSameNode( $node ) ) {
					$alreadyFound = true;
					break;
				}
			}
			if ( !$alreadyFound ) {
				$wrappers[] = $node;
			}
		}

		return $wrappers;
	}

	/**
	 * Build the Parsoid style heading wrapper for the Quick facts section.
	 *
	 * @param Document $doc
	 * @return Element
	 */
	private function buildHeadingWrapper( Document $doc ): Element {
		$heading = $doc->createElement( 'h2' );
		$heading->setAttribute( 'id', self::HEADING_ID );
		$heading->textContent = $this->headingText;

		// Parsoid wraps headings in `<div class="mw-heading mw-heading2">`;
		// the collapsing script looks for elements with this class to find headings.
		$wrapper = $doc->createElement( 'div' );
		$wrapper->setAttribute( 'class', 'mw-heading mw-heading2' );
		$wrapper->appendChild( $heading );

		return $wrapper;
	}

	/**
	 * Wrap the infoboxes in the collapsible content element.
	 *
	 * @param Document $doc
	 * @param Element[] $infoboxes
	 * @return Element
	 */
	private function buildContent( Document $doc, array $infoboxes ): Element {
		// The heading's next sibling becomes the collapsible content, so the
		// infoboxes must be wrapped in a `<div>`.
		$content = $doc->createElement( 'div' );
		$content->setAttribute( 'class', 'mf-quick-facts__content' );
		foreach ( $infoboxes as $infobox ) {
			$content->appendChild( $infobox );
		}

		return $content;
	}
}
