<?php
/**
 * MobileUserModule.php
 */

/**
 * Extends ResourceLoaderUserModule (Module for user-specific site customizations).
 * This differs from the user module as we currently do not load User's
 * common.js or user common.css as these predate Minerva and may be broken.
 */
class MobileUserModule extends ResourceLoaderUserModule {
	/** @var array Sets the target for the module (e.g. desktop and mobile).
	 * Note this is mobile only as core already has an instance of ResourceLoaderUserModule
	 */
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
		foreach ( array_keys( $pages ) as $key ) {
			if ( preg_match( '/common\.(js|css)/', $key ) ) {
				unset( $pages[$key] );
			}
		}
		return $pages;
	}
}
