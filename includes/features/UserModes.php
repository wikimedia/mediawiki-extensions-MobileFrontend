<?php

namespace MobileFrontend\Features;

use IteratorAggregate;
use ArrayIterator;
use Traversable;

/**
 * User Modes collection
 *
 * This class exists to provide a safe collection of IUserModes
 * @package MobileFrontend\Features
 */
class UserModes implements IteratorAggregate {

	/**
	 * @var array<IUserMode>
	 */
	private $modes;

	/**
	 * Register new User Mode
	 * @param IUserMode $mode
	 */
	public function registerMode( IUserMode $mode ) {
		$this->modes[] = $mode;
	}

	/**
	 * @return ArrayIterator|Traversable
	 */
	public function getIterator() {
		return new ArrayIterator( $this->modes );
	}

}
