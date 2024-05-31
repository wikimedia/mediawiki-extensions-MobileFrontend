<?php

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MobileFrontend\Hooks;

use MediaWiki\Context\IContextSource;

/**
 * This is a hook handler interface, see docs/Hooks.md in core.
 * Use the hook name "SpecialMobileEditWatchlist::images" to register handlers implementing this interface.
 *
 * @stable to implement
 * @ingroup Hooks
 */
interface SpecialMobileEditWatchlistImagesHook {
	/**
	 * @param IContextSource $context
	 * @param string[][] &$watchlist Array of ns => Array of dbkeys
	 * @param string[][] &$images Array of ns => Array of dbkeys for files
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onSpecialMobileEditWatchlist__images( IContextSource $context, array &$watchlist, array &$images );
}
