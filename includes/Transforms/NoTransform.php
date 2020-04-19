<?php

namespace MobileFrontend\Transforms;

use DOMElement;

class NoTransform implements IMobileTransform {
	/**
	 * Does nothing.
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		// nothing happens
	}
}
