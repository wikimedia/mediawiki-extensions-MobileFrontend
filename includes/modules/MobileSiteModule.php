<?php

namespace MobileFrontend\ResourceLoaderModules;

use ResourceLoaderWikiModule;
use ResourceLoaderContext;

/**
 * Alternate of ResourceLoaderSiteModule for mobile web.
 * Mobile.[css|js] is a temporary drop-in replacement for Common.css/js which contains JS that
 * is usually incompatible
 */
class MobileSiteModule extends ResourceLoaderWikiModule {
	// Should not be enabled on desktop which has ResourceLoaderSiteModule instead
	protected $targets = [ 'mobile' ];

	/**
	 * @inheritDoc
	 */
	public function getDependencies( ResourceLoaderContext $context = null ) {
		// They should always be loaded together, regardless of whether mobile.site.styles
		// had been made render blocking.
		return [ 'mobile.site.styles' ];
	}

	/**
	 * Get a list of pages used by this module.
	 *
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	protected function getPages( ResourceLoaderContext $context ) {
		return [
			'MediaWiki:Mobile.js' => [ 'type' => 'script' ],
		];
	}
}
