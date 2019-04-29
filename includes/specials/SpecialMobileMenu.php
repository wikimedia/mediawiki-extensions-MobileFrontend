<?php

/**
 * Special page designed for rendering a skin's menu without an article
 * Used for skins where the menu is hidden via JavaScript by default.
 * @todo FIXME: Rename from MobileMenu to NavigationMenu
 * @ingroup SpecialPage
 */
class SpecialMobileMenu extends MobileSpecialPage {

	public function __construct() {
		parent::__construct( 'MobileMenu' );
		$supported = [ 'vector', 'minerva' ];
		$name = $this->getSkin()->getSkinName();
		if ( array_search( $name, $supported ) !== false ) {
			$this->hasDesktopVersion = true;
		}
	}

	/**
	 * Render the navigation menu
	 * @param string|null $par never used
	 */
	public function executeWhenAvailable( $par = '' ) {
		$this->setHeaders();
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'mobile-frontend-main-menu-page-title' ) );
		$out->setProperty( 'bodyClassName', 'navigation-enabled navigation-full-screen' );
	}
}
