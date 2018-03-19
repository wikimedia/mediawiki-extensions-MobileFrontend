<?php

namespace MobileFrontend\ResourceLoaderModules;

use ResourceLoaderWikiModule;
use ResourceLoaderContext;

/**
 * Alternate of ResourceLoaderSiteStylesModule for mobile web.
 * Mobile.css is a temporary drop-in replacement for Common.css which contains CSS that
 * is usually incompatible.
 */
class MobileSiteStylesModule extends ResourceLoaderWikiModule {
	// Should not be enabled on desktop which has ResourceLoaderSiteStylesModule instead
	protected $targets = [ 'mobile' ];

	/**
	 * Get a list of pages used by this module.
	 *
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	protected function getPages( ResourceLoaderContext $context ) {
		$pages = [];
		if ( $this->getConfig()->get( 'UseSiteCss' ) ) {
			$pages += [
				'MediaWiki:Mobile.css' => [ 'type' => 'style' ],
			];
		}
		return $pages;
	}

	/**
	 * @return string
	 */
	public function getType() {
		return self::LOAD_STYLES;
	}
}
