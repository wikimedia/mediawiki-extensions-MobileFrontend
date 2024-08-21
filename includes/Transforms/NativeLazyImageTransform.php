<?php

namespace MobileFrontend\Transforms;

use DOMDocument;
use DOMElement;
use Wikimedia\Parsoid\Utils\DOMCompat;

/**
 * Transforms Parsoid content so that it works with lazy loaded images.
 */
class NativeLazyImageTransform implements IMobileTransform {

	/**
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		// Parsoid can have nested sections, so we use a child combinator
		// here to avoid multiple applications of the lazy image transform to the
		// nested sections.
		$sections = DOMCompat::querySelectorAll( $node, '.mw-parser-output > section' );
		foreach ( $sections as $sectionNumber => $section ) {
			if ( $sectionNumber > 0 ) {
				$this->doRewriteImagesForLazyLoading( $section, $section->ownerDocument );
			}
		}
	}

	/**
	 * Enables images to be loaded asynchronously
	 *
	 * @param DOMElement|DOMDocument $el Element or document to rewrite images in.
	 * @param ?DOMDocument $doc Document to create elements in
	 */
	private function doRewriteImagesForLazyLoading( $el, ?DOMDocument $doc ) {
		if ( $doc === null ) {
			return;
		}

		foreach ( DOMCompat::querySelectorAll( $el, 'img' ) as $img ) {
			$img->setAttribute( 'loading', 'lazy' );
		}
	}
}
