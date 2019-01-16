<?php
namespace MobileFrontend\AMC;

/**
 * Hooks for Advanced Mobile Contributions
 *
 * @package MobileFrontend\AMC
 */
final class Hooks {

	/**
	 * Register default preference value for AMC opt-in
	 *
	 * @param array &$defaultUserOptions Reference to default options array
	 */
	public static function onUserGetDefaultOptions( &$defaultUserOptions ) {
		$defaultUserOptions[UserMode::USER_OPTION_MODE_AMC] = UserMode::OPTION_DISABLED;
	}

}
