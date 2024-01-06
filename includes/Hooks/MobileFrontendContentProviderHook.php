<?php

namespace MobileFrontend\Hooks;

use MediaWiki\Output\OutputPage;
use MobileFrontend\ContentProviders\IContentProvider;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "MobileFrontendContentProvider" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface MobileFrontendContentProviderHook {
	/**
	 * @param IContentProvider &$provider
	 * @param OutputPage $out
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onMobileFrontendContentProvider( IContentProvider &$provider, OutputPage $out );
}
