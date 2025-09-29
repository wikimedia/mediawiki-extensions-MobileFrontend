<?php

namespace MobileFrontend\Transforms;

use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Utils\DOMCompat;

class RemovableClassesTransform implements IMobileTransform {

	/**
	 * @param string[] $removableClasses List of slectors denoting elements to be removed
	 */
	public function __construct(
		private readonly array $removableClasses,
	) {
	}

	/**
	 * @param Element $node to be transformed
	 */
	public function apply( Element $node ) {
		foreach ( $this->removableClasses as $selector ) {
			foreach ( DOMCompat::querySelectorAll( $node, $selector ) as $element ) {
				$element->parentNode->removeChild( $element );
			}
		}
	}
}
