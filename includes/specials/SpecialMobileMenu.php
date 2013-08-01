<?php

class SpecialMobileMenu extends MobileSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileMenu' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();
		$out = $this->getOutput();
		$out->setPageTitle( wfMessage( 'mobile-frontend-main-menu-page-title' )->text() );
		$out->setProperty( 'bodyClassName', 'navigation-enabled navigation-full-screen' );
	}
}
