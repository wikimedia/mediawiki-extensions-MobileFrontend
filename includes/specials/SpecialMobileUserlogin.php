<?php
/**
 * SpecialMobileUserlogin.php
 */

/**
 * Customizes the Loginform when user login/register
 */
class SpecialMobileUserlogin extends LoginForm {
	/**
	 * Adds a mobile header with register or login in title
	 * @param string|null $par Subpage (e.g. signup)
	 */
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
