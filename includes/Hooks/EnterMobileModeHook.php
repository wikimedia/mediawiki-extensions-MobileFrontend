<?php

namespace MobileFrontend\Hooks;

use MobileContext;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "EnterMobileMode" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface EnterMobileModeHook {
	/**
	 * @param MobileContext $mobileContext
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onEnterMobileMode( MobileContext $mobileContext );
}
