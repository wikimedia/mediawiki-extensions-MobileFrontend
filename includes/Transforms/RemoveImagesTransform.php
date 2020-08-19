<?php

namespace MobileFrontend\Transforms;

use DOMElement;

/**
 * Class that replaces images with its annotations from alt.
 */
class RemoveImagesTransform implements IMobileTransform {
	/**
	 * Performs html transformation.
	 * @param DOMElement $node html element
	 */
	public function apply( DOMElement $node ) {
		$doc = $node->ownerDocument;
		$domElemsToReplace = [];
		foreach ( $node->getElementsByTagName( 'img' ) as $element ) {
			$domElemsToReplace[] = $element;
		}
		$missingImage = null;
		/** @var DOMElement $element */
		foreach ( $domElemsToReplace as $element ) {
			$alt = $element->getAttribute( 'alt' );
			if ( $alt === '' ) {
				if ( $missingImage === null ) {
					$missingImage = wfMessage( 'mobile-frontend-missing-image' )->inContentLanguage()->text();
				}
				$alt = '[' . $missingImage . ']';
			} else {
				$alt = '[' . $alt . ']';
			}
			$replacement = $doc->createElement( 'span', htmlspecialchars( $alt ) );
			$replacement->setAttribute( 'class', 'mw-mf-image-replacement' );
			$element->parentNode->replaceChild( $replacement, $element );
		}
	}
}
