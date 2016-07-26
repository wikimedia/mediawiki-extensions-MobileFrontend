<?php
/**
 * MobileUserStylesModule.php
 */

/**
 * Alternative of ResourceLoaderUserStylesModule for mobile web.
 * Differs from the user module by not loading common.css,
 * which predate Minerva and may be incompatible.
 */
class MobileUserStylesModule extends ResourceLoaderUserStylesModule {
	// Should not be enabled on desktop which loads 'user.styles' instead
	protected $targets = [ 'mobile' ];

	/**
	 * Gets list of pages used by this module.
	 * @param ResourceLoaderContext $context
	 * @return array
	 */
	protected function getPages( ResourceLoaderContext $context ) {
		$pages = parent::getPages( $context );
		// Remove $userpage/common.css
		foreach ( array_keys( $pages ) as $key ) {
			if ( preg_match( '/common\.css/', $key ) ) {
				unset( $pages[$key] );
			}
		}
		return $pages;
	}
}
