<?php
/**
 * Provides a custom account creation form for mobile devices
 */
class UserAccountCreateMobileTemplate extends OverloadTemplate {

	public function execute() {
		$action = $this->data['action'];
		$token = $this->data['token'];
		$username = ( strlen( $this->data['name'] ) ) ? $this->data['name'] : null;
		$message = $this->data['message'];
		$messageType = $this->data['messagetype'];
		$msgBox = ''; // placeholder for displaying any login-related system messages (eg errors)
		// handle captcha
		$captcha = $this->handleCaptcha( $this->data['header'] );

		$accountCreation = Html::openElement( 'div', array( 'id' => 'mw-mf-accountcreate' ) );

		// @TODO refactor this into base class
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
		} else {
			$msgBox = Html::rawElement( 'div', array(
				'class' => 'watermark' ) );
		}

		$form =
			Html::openElement( 'form',
				array( 'name' => 'userlogin2',
					'method' => 'post',
					'action' => $action,
					'id' => 'userlogin2' ) ) .
			Html::openElement( 'div',
				array(
					'class' => 'wpInputs'
				)
			) .
			Html::input( 'wpName', $username, 'text',
				array( 'class' => 'loginText',
					'placeholder' => wfMessage( 'mobile-frontend-username-placeholder' )->text(),
					'id' => 'wpName1',
					'tabindex' => '1',
					'size' => '20',
					'required' ) ) .
			Html::input( 'wpPassword', null, 'password',
				array( 'class' => 'loginPassword',
					'placeholder' => wfMessage( 'mobile-frontend-password-placeholder' )->text(),
					'id' => 'wpPassword2',
					'tabindex' => '2',
					'size' => '20' ) ) .
			Html::input( 'wpRetype', null, 'password',
				array( 'class' => 'loginPassword',
					'placeholder' => wfMessage( 'mobile-frontend-password-confirm-placeholder' )->text(),
					'id' => 'wpRetype',
					'tabindex' => '3',
					'size' => '20' ) ) .
			Html::input( 'wpEmail', null, 'email',
				array( 'class' => 'loginText',
					'placeholder' => wfMessage( 'mobile-frontend-account-create-email-placeholder' )->text(),
					'id' => 'wpEmail',
					'tabindex' => '4',
					'size' => '20' ) ) .
			Html::closeElement( 'div' ) .
			$captcha .
			Html::input( 'wpCreateaccount', wfMessage( 'mobile-frontend-account-create-submit' )->text(), 'submit',
				array( 'id' => 'wpCreateaccount',
					'tabindex' => '6' ) ) .
			Html::input( 'wpRemember', '1', 'hidden' ) .
			Html::input( 'wpCreateaccountToken', $token, 'hidden' ) .
			Html::closeElement( 'form' );
		$accountCreation .= $msgBox . $form;
		$accountCreation .= Html::closeElement( 'div' );
		echo $accountCreation;
	}

	/**
	 * Hijack captcha output
	 *
	 * Captcha output appears in $tpl->data['header'] but there's a lot
	 * of cruft that comes with it. We just want to get the captcha image
	 * a display an input field for the user to enter captcha info, without
	 * the additinal cruft.
	 *
	 * @TODO move this into ConfirmEdit extension when MW is context aware
	 * @param string
	 * @return string
	 */
	protected function handleCaptcha( $header ) {
		// first look for <div class="captcha">, otherwise early return
		if ( !$header || !stristr( $header, 'captcha' ) ) {
			return '';
		}

		// find the captcha ID
		$lines = explode( "\n", $header );
		$pattern = '/wpCaptchaId=([^"]+)"/';
		$matches = array();
		foreach ( $lines as $line ) {
			preg_match( $pattern, $line, $matches );
			// if we have a match, stop processing
			if ( $matches ) break;
		}
		// make sure we've gotten the captchaId
		if ( !isset( $matches[1] ) ) {
			return '';
		}
		$captchaId = $matches[1];

		// generate src for captcha img
		$captchaSrc = SpecialPage::getTitleFor( 'Captcha', 'image' )->getLocalUrl( array( 'wpCaptchaId' => $captchaId ) );

		// captcha output html
		$captchaHtml =
			Html::openElement( 'div',
				array( 'class' => 'wpCaptcha' ) ) .
			Html::element( 'img',
				array(
					'src' => $captchaSrc,
					'class' => 'wpCaptcha',
				)
			) .
			Html::input( 'wpCaptchaWord', null, 'text',
				array(
					'placeholder' => wfMessage( 'mobile-frontend-account-create-captcha-placeholder' )->text(),
					'id' => 'wpCaptchaWord',
					'tabindex' => '5',
					'size' => '20',
					'autocorrect' => 'off',
					'autocapitalize' => 'off',
				)
			) .
			Html::input( 'wpCaptchaId', $captchaId, 'hidden', array( 'id' => 'wpCaptchaId' ) ) .
			Html::closeElement( 'div' );
		return $captchaHtml;
	}
}
