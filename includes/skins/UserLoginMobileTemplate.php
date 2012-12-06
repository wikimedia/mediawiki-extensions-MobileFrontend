<?php
/**
 * Provides a custom login form for mobile devices
 */
class UserLoginMobileTemplate extends OverloadTemplate {

	public function execute() {
		$action = $this->data['action'];
		$token = $this->data['token'];
		$username = ( strlen( $this->data['name'] ) ) ? $this->data['name'] : null;
		$message = $this->data['message'];
		$messageType = $this->data['messagetype'];
		$msgBox = ''; // placeholder for displaying any login-related system messages (eg errors)

		$query = array(
			'type' => 'signup',
		);
		$signupLink = Linker::link( SpecialPage::getTitleFor( 'UserLogin' ),
			wfMessage( 'mobile-frontend-main-menu-account-create' )->text(),
			array( 'class'=> 'mw-mf-create-account' ), $query );

		$login = Html::openElement( 'div', array( 'id' => 'mw-mf-login' ) );

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
					'placeholder' => wfMessage( 'mobile-frontend-username-placeholder' )->text(),
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
					'placeholder' => wfMessage( 'mobile-frontend-password-placeholder' )->text(),
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
			$signupLink .
			Html::closeElement( 'td' ) .
			Html::closeElement( 'tr' ) .
			Html::closeElement( 'tbody' ) .
			Html::closeElement( 'table' ) .
			Html::input( 'wpLoginToken', $token, 'hidden' ) .
			Html::closeElement( 'form' ) .
			Html::closeElement( 'div' );
		$login .= $msgBox . $form;
		$login .= Html::closeElement( 'div' );
		echo $login;
	}
}
