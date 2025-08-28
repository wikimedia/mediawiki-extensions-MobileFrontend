<?php

namespace MobileFrontend\Transforms;

use Wikimedia\Parsoid\DOM\Element;

/**
 * @codeCoverageIgnore
 */
interface IMobileTransform {
	/**
	 * Transforms the DOM Element in some way
	 * @param Element $node to be transformed
	 */
	public function apply( Element $node );
}
