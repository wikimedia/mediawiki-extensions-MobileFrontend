<?php

namespace MobileFrontend\ResourceLoaderModules;

use ResourceLoaderWikiModule;
use ResourceLoaderContext;

/**
 * Main pages tend to be radically different from other pages and we don't want to load
 * styles for the main page via Common or Mobile.css for all page views - it would be very
 * wasteful.
 * This module loads styles specifically for the mobile main page.
 * It is designed to be render blocking.
 */
class MobileMainPageStyleModule extends ResourceLoaderWikiModule {
	// Should not be enabled on desktop which has ResourceLoaderSiteModule instead
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
				'MediaWiki:MobileMainPage.css' => [ 'type' => 'style' ],
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
