<?php

namespace MobileFrontend\Features;

use ArrayIterator;
use IteratorAggregate;
use Traversable;

/**
 * User Modes collection
 *
 * This class exists to provide a safe collection of IUserModes
 * @package MobileFrontend\Features
 * @implements IteratorAggregate<string,IUserMode>
 */
class UserModes implements IteratorAggregate {

	/**
	 * @var array<string,IUserMode>
	 */
	private array $modes = [];

	/**
	 * Register new User Mode
	 */
	public function registerMode( IUserMode $mode ) {
		$this->modes[$mode->getModeIdentifier()] = $mode;
	}

	/**
	 * Retrieve registered mode
	 *
	 * @param string $modeIdentifier
	 * @return IUserMode
	 */
	public function getMode( $modeIdentifier ) {
		if ( !array_key_exists( $modeIdentifier, $this->modes ) ) {
			throw new \RuntimeException( "$modeIdentifier User mode is undefined" );
		}
		return $this->modes[$modeIdentifier];
	}

	/**
	 * @return ArrayIterator<string,IUserMode>
	 */
	public function getIterator(): Traversable {
		return new ArrayIterator( $this->modes );
	}

}
