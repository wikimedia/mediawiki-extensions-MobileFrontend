<?php

namespace MobileFrontend\Features;

/**
 * Interface represents user mobile mode.
 * As example: Beta Mode
 *
 * @package MobileFrontend\Features
 */
interface IUserMode {

	/**
	 * Return user mode identifier
	 * @return string
	 */
	public function getModeIdentifier();

	/**
	 * Checks if user opted-in into mode
	 * @return bool
	 */
	public function isEnabled();

}
