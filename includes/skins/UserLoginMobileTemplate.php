<?php
/**
 * Provides a custom login form for mobile devices
 */
class UserLoginMobileTemplate extends QuickTemplate {

	/**
	 * Overload the parent constructor
	 *
	 * Does not call the parent's constructor to prevent overwriting
	 * $this->data and $this->translatorobject since we're essentially
	 * just hijacking the login form here.
	 * @param QuickTemplate $template: The original template object to overwrite
	 */
	public function __construct( $template ) {
		$this->copyObjectProperties( $template );
	}

	public function execute() {
		$action = $this->data['action'];
		$token = $this->data['token'];
		$username = ( strlen( $this->data['name'] ) ) ? $this->data['name'] : null;
		$message = $this->data['message'];
		$messageType = $this->data['messagetype'];
		$msgBox = ''; // placeholder for displaying any login-related system messages (eg errors)

		$login = Html::openElement( 'div', array( 'id' => 'mw-mf-login' ) );

		$loginHead = Html::rawElement( 'div', array( 'class' => 'alert info' ),
			wfMessage( 'mobile-frontend-sign-in-why' )->text() );

		if ( $message ) {
			$heading = '';
			$class = 'alert';
			if ( $messageType == 'error' ) {
				$heading = wfMessage( 'mobile-frontend-sign-in-error-heading' )->text();
				$class .= ' error';
			}

			$msgBox .= Html::openElement( 'div', array( 'class' => $class ) );
			$msgBox .= ( $heading ) ? Html::rawElement( 'h2', array(), $heading ) : '';
			$msgBox .= $message;
			$msgBox .= Html::closeElement( 'div' );
		}

		$form = Html::openElement( 'div', array( 'id' => 'userloginForm' ) ) .
			Html::openElement( 'form',
				array( 'name' => 'userlogin',
					'method' => 'post',
					'action' => $action ) ) .
			Html::openElement( 'table',
				array( 'class' => 'user-login' ) ) .
			Html::openElement( 'tbody' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-label' ) ) .
			Html::element( 'label',
				array( 'for' => 'wpName1' ), wfMessage( 'mobile-frontend-username' )->text() ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td' ) .
			Html::input( 'wpName', $username, 'text',
				array( 'class' => 'loginText',
					'id' => 'wpName1',
					'tabindex' => '1',
					'size' => '20',
					'required' ) ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-label' ) ) .
			Html::element( 'label',
				array( 'for' => 'wpPassword1' ), wfMessage( 'mobile-frontend-password' )->text() ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-input' ) ) .
			Html::input( 'wpPassword', null, 'password',
				array( 'class' => 'loginPassword',
					'id' => 'wpPassword1',
					'tabindex' => '2',
					'size' => '20' ) ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::element( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::openElement( 'tr' ) .
			Html::openElement( 'td',
				array( 'class' => 'mw-submit' ) ) .
			Html::input( 'wpLoginAttempt', wfMessage( 'mobile-frontend-login' )->text(), 'submit',
				array( 'id' => 'wpLoginAttempt',
					'tabindex' => '3' ) ) .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::closeElement( 'tbody' ) .
			Html::closeElement( 'table' ) .
			Html::input( 'wpLoginToken', $token, 'hidden' ) .
			Html::closeElement( 'form' ) .
			Html::closeElement( 'div' );
		$login .= $loginHead . $msgBox . $form;
		$login .= Html::closeElement( 'div' );
		echo $login;
	}

	/**
	 * Copy public properties of one object to this one
	 * @param object $obj: The object whose properties should be copied
	 */
	protected function copyObjectProperties( $obj ) {
		foreach( get_object_vars( $obj ) as $prop => $value ) {
			$this->$prop = $value;
		}
	}
}
