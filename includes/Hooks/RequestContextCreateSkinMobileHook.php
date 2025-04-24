<?php

namespace MobileFrontend\Hooks;

use MediaWiki\Skin\Skin;
use MobileContext;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "RequestContextCreateSkinMobile" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface RequestContextCreateSkinMobileHook {
	/**
	 * @param MobileContext $mobileContext
	 * @param Skin $skin
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onRequestContextCreateSkinMobile( MobileContext $mobileContext, Skin $skin );
}
