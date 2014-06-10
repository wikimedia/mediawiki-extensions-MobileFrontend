<?php
/**
 * MobileSiteModule.php
 */

/**
 * Extends ResourceLoaderSiteModule (Module for site customizations).
 */
class MobileSiteModule extends ResourceLoaderSiteModule {
	/** @var array Saves the target for the module (e.g. desktop and mobile). */
	protected $targets = array( 'mobile' );

	/**
	 * Gets list of pages used by this module.
	 * @return array
	 */
	protected function getPages( ResourceLoaderContext $context ) {
		return array(
			'MediaWiki:Mobile.css' => array( 'type' => 'style' ),
			'MediaWiki:Mobile.js' => array( 'type' => 'script' ),
		);
	}

	/**
	 * Get the position where on the HTML page this module's JS be loaded to.
	 * @return string Always top, to load in JS in head.
	 */
	public function getPosition() {
		return 'top';
	}
}
