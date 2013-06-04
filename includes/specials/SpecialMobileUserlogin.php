<?php

class SpecialMobileUserlogin extends LoginForm {

	function execute( $par ) {
		if ( $this->getRequest()->getVal( 'type' ) == 'signup' ) {
			$key = 'mobile-frontend-sign-up-heading';
		} else {
			$key = 'mobile-frontend-sign-in-heading';
		}
		$this->getOutput()->setProperty(
			'mobile.htmlHeader',
			Html::element( 'h1', array(), wfMessage( $key )->plain() )
		);
		parent::execute( $par );
	}
}
