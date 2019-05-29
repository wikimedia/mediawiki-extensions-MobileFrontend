<?php

namespace MobileFrontend\Features;

use IteratorAggregate;
use ArrayIterator;

/**
 * User Modes collection
 *
 * This class exists to provide a safe collection of IUserModes
 * @package MobileFrontend\Features
 */
class UserModes implements IteratorAggregate {

	/**
	 * @var array<string,IUserMode>
	 */
	private $modes = [];

	/**
	 * Register new User Mode
	 * @param IUserMode $mode
	 */
	public function registerMode( IUserMode $mode ) {
		$this->modes[ $mode->getModeIdentifier() ] = $mode;
	}

	/**
	 * Retrieve registered mode
	 *
	 * @param string $modeIdentifier Mode identifier
	 * @return IUserMode
	 */
	public function getMode( $modeIdentifier ) {
		if ( !array_key_exists( $modeIdentifier, $this->modes ) ) {
			throw new \RuntimeException( "$modeIdentifier User mode is undefined" );
		}
		return $this->modes[ $modeIdentifier ];
	}

	/**
	 * @return ArrayIterator
	 */
	public function getIterator() {
		return new ArrayIterator( $this->modes );
	}

}
