<?php

class SpecialMobileMenu extends MobileSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileMenu' );
		// Make mobile menu available to non-JavaScript users of Minerva skin
		if( $this->getSkin()->getSkinName() === 'minerva' ) {
			$this->hasDesktopVersion = true;
		}
	}

	public function executeWhenAvailable( $par = '' ) {
		$this->setHeaders();
		$out = $this->getOutput();
		$out->setPageTitle( wfMessage( 'mobile-frontend-main-menu-page-title' )->text() );
		$out->setProperty( 'bodyClassName', 'navigation-enabled navigation-full-screen' );
	}
}
