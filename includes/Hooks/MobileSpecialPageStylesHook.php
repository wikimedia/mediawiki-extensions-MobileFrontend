<?php

namespace MobileFrontend\Hooks;

use MediaWiki\Output\OutputPage;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "MobileSpecialPageStyles" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface MobileSpecialPageStylesHook {
	/**
	 * @param string $id
	 * @param OutputPage $out
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onMobileSpecialPageStyles( string $id, OutputPage $out );
}
