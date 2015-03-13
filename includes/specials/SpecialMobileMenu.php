<?php
/**
 * SpecialMobileMenu.php
 */

/**
 * Special page designed for rendering a skin's menu without an article
 * Used for skins where the menu is hidden via JavaScript by default.
 * @todo FIXME: Rename from MobileMenu to NavigationMenu
 * @ingroup SpecialPage
 */
class SpecialMobileMenu extends MobileSpecialPage {
	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'MobileMenu' );
		$supported = array( 'vector', 'minerva' );
		$name = $this->getSkin()->getSkinName();
		if ( array_search( $name, $supported ) !== false ) {
			$this->hasDesktopVersion = true;
		}
	}

	/**
	 * Render the navigation menu
	 * @param string $par never used
	 */
	public function executeWhenAvailable( $par = '' ) {
		$this->setHeaders();
		$out = $this->getOutput();
		$out->setPageTitle( wfMessage( 'mobile-frontend-main-menu-page-title' )->text() );

		if ( !MobileContext::singleton()->isAlphaGroupMember() ) {
			$out->setProperty( 'bodyClassName', 'navigation-enabled navigation-full-screen' );
		}
	}
}
