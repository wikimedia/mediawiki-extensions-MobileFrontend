<?php

class SpecialLoginHandshake extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'LoginHandshake' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();

		$output = $this->getOutput();
		$output->addModules( 'mobile.loginhandshake.scripts' );
		$output->setPageTitle( wfMessage( 'mobile-frontend-handshake-title' )->escaped() );

		$html = Html::element(
			'p',
			array( 'class' => 'loading content' ),
			wfMessage( 'mobile-frontend-handshake-wait' )->escaped()
		);

		$output->addHTML( $html );
	}
}
