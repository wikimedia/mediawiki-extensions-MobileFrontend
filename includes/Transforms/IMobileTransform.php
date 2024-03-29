<?php

namespace MobileFrontend\Transforms;

use DOMElement;

/**
 * @codeCoverageIgnore
 */
interface IMobileTransform {
	/**
	 * Transforms the DOMElement in some way
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node );
}
