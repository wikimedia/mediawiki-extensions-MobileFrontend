<?php

namespace MobileFrontend\Hooks;

use MobileContext;
use MobileFormatter;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "MobileFrontendBeforeDOM" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface MobileFrontendBeforeDOMHook {
	/**
	 * @param MobileContext $mobileContext
	 * @param MobileFormatter $formatter
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onMobileFrontendBeforeDOM( MobileContext $mobileContext, MobileFormatter $formatter );
}
