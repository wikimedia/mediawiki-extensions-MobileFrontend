<?php

namespace MobileFrontend\Hooks;

use MediaWiki\Output\OutputPage;
use Skin;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "BeforePageDisplayMobile" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface BeforePageDisplayMobileHook {
	/**
	 * @param OutputPage &$out
	 * @param Skin &$skin
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onBeforePageDisplayMobile( OutputPage &$out, Skin &$skin );
}
