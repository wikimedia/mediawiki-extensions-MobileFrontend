<?php

namespace MobileFrontend\Transforms;

use DOMElement;

class NoTransform implements IMobileTransform {

	/** @var self */
	private static $instance;

	/**
	 * Returns a static instance of NoTransform class.
	 *
	 * Note: There's no need in many instances of this class as it does nothing.
	 * So it's a common pre-optimization to make such classes as singleton, what's
	 * rather a matter of convenience than real optimization.
	 *
	 * @return self
	 */
	public static function getInstance(): self {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Does nothing.
	 * @param DOMElement $node to be transformed
	 */
	public function apply( DOMElement $node ) {
		// nothing happens
	}
}
