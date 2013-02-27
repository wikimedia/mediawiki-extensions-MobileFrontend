<?php

class SpecialMobileMenu extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileMenu' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();
		$this->getOutput()->setPageTitle( wfMessage( 'mobile-frontend-main-menu-page-title' )->text() );
		$context = MobileContext::singleton();
		// add navigationEnabled class
		$context->setForceLeftMenu( true );

		$context->setForceMobileView( true );
		$context->setContentTransformations( false );
	}
}
