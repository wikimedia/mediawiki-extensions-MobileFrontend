<?php

namespace MobileFrontend\Hooks;

use MediaWiki\Output\OutputPage;
use MediaWiki\Revision\RevisionRecord;
use MobileContext;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "BeforeSpecialMobileDiffDisplay" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface BeforeSpecialMobileDiffDisplayHook {
	/**
	 * @deprecated 1.42 now a NOOP.
	 * @param OutputPage &$output
	 * @param MobileContext $mobileContext
	 * @param (RevisionRecord|null)[] $revisions
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onBeforeSpecialMobileDiffDisplay(
		OutputPage &$output,
		MobileContext $mobileContext,
		array $revisions
	);
}
