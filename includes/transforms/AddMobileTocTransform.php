<?php

namespace MobileFrontend\Transforms;

use DOMElement;

class AddMobileTocTransform implements IMobileTransform {
	/**
	 * Insert a table of content placeholder into the element
	 * which will be progressively enhanced via JS
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		$doc = $node->ownerDocument;
		$existingToc = $doc->getElementById( 'toc' );
		if ( $existingToc ) {
			$existingToc->removeAttribute( 'id' );
			// Insert table of content placeholder which will be progressively enhanced via JS
			$toc = $doc->createElement( 'div' );
			$toc->setAttribute( 'id', 'toc' );
			$toc->setAttribute( 'class', 'toc-mobile' );
			$tocHeading = $doc->createElement( 'h2', wfMessage( 'toc' )->text() );
			$toc->appendChild( $tocHeading );
			$node->appendChild( $toc );
			// TOC should always have a parent but you never know..
			if ( $existingToc->parentNode ) {
				$existingToc->parentNode->replaceChild( $toc, $existingToc );
			}
		}
	}
}
