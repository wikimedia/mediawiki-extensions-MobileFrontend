<?php
/**
 * MobileUserModule.php
 */

/**
 * Extends ResourceLoaderUserModule (Module for user-specific site customizations).
 */
class MobileUserModule extends ResourceLoaderUserModule {
	/** @var array Sets the target for the module (e.g. desktop and mobile). */
	protected $targets = array( 'mobile' );

	/**
	 * Gets list of pages used by this module.
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	protected function getPages( ResourceLoaderContext $context ) {
		$pages = parent::getPages( $context );
		// Remove $userpage/common.js and $userpage/common.css since those are typically
		// intended for non-mobile interfaces.
		foreach ( $pages as $key => $value ) {
			if ( preg_match( '/common\.(js|css)/', $key ) ) {
				unset( $pages[$key] );
			}
		}
		return $pages;
	}
}
