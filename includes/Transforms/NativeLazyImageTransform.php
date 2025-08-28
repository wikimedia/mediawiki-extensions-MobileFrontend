<?php

namespace MobileFrontend\Transforms;

use Wikimedia\Parsoid\DOM\Document;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Utils\DOMCompat;

/**
 * Transforms Parsoid content so that it works with lazy loaded images.
 */
class NativeLazyImageTransform implements IMobileTransform {

	/**
	 * @param Element $node to be transformed
	 */
	public function apply( Element $node ) {
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
	 * @param Element|Document $el Element or document to rewrite images in.
	 * @param ?Document $doc Document to create elements in
	 */
	private function doRewriteImagesForLazyLoading( $el, ?Document $doc ) {
		if ( $doc === null ) {
			return;
		}

		foreach ( DOMCompat::querySelectorAll( $el, 'img' ) as $img ) {
			$img->setAttribute( 'loading', 'lazy' );
		}
	}
}
