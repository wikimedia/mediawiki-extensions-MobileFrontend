<?php

namespace MobileFrontend\Features;

/**
 * Interface represents user mobile mode.
 * As example: AMC Mode
 *
 * @package MobileFrontend\Features
 * @codeCoverageIgnore
 */
interface IUserSelectableMode {

	/**
	 * Enables/Disabled current user mode
	 * @param bool $isEnabled a new feature state
	 */
	public function setEnabled( bool $isEnabled );

}
