<?php
/**
 * MobileSiteModule.php
 */

/**
 * Alternate of ResourceLoaderSiteModule for mobile web.
 * Mobile.[css|js] is a temporary drop-in replacement for Common.css/js which contains JS that
 * is usually incompatible
 */
class MobileSiteModule extends ResourceLoaderWikiModule {
	// Should not be enabled on desktop which has ResourceLoaderSiteModule instead
	protected $targets = [ 'mobile' ];

	// Always load from bottom, which differs from other skins.
	protected $position = 'bottom';

	/**
	 * Get a list of pages used by this module.
	 *
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	protected function getPages( ResourceLoaderContext $context ) {
		return [
			'MediaWiki:Mobile.css' => [ 'type' => 'style' ],
			'MediaWiki:Mobile.js' => [ 'type' => 'script' ],
		];
	}
}
