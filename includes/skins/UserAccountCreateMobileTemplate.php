<?php
/**
 * UserAccountCreateMobileTemplate.php
 */

/**
 * Provides a custom account creation form for mobile devices
 */
class UserAccountCreateMobileTemplate extends UserLoginAndCreateTemplate {
	/** @var array $actionMessages Message keys for page actions */
	protected $actionMessages = array(
		'watch' => 'mobile-frontend-watchlist-signup-action',
		'edit' => 'mobile-frontend-edit-signup-action',
		'signup-edit' => 'mobile-frontend-edit-signup-action',
		'' => 'mobile-frontend-generic-signup-action',
	);
	/** @var array $actionMessages Message keys for site links */
	protected $pageMessages = array(
		'Uploads' => 'mobile-frontend-donate-image-signup-action',
		'Watchlist' => 'mobile-frontend-watchlist-signup-action',
	);

	/**
	 * Render Login/Create specific template
	 * @todo refactor this into parent template
	 */
	public function execute() {
		$action = $this->data['action'];
		$token = $this->data['token'];
		$watchArticle = $this->getArticleTitleToWatch();
		$stickHTTPS = ( $this->doStickHTTPS() ) ? Html::input( 'wpStickHTTPS', 'true', 'hidden' ) : '';
		$username = ( strlen( $this->data['name'] ) ) ? $this->data['name'] : null;
		// handle captcha
		$captchaHtml = '';
		if ( isset( $this->data['header'] ) ) {
			$captchaHtml .= $this->data['header'];
		}
		if ( isset( $this->data['extrafields'] ) ) {
			$captchaHtml .= $this->data['extrafields'];
		}
		$captcha = $this->handleCaptcha( $captchaHtml );

		$form =
			Html::openElement( 'form',
				array( 'name' => 'userlogin2',
					'method' => 'post',
					'class' => 'user-login',
					'action' => $action,
					'id' => 'userlogin2' ) ) .
			Html::openElement( 'div',
				array(
					'class' => 'inputs-box'
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
			Html::input( 'wpCreateaccount',
				wfMessage( 'mobile-frontend-account-create-submit' )->text(),
				'submit',
				array( 'id' => 'wpCreateaccount',
					'class' => MobileUI::buttonClass( 'constructive' ),
					'tabindex' => '6'
				)
			) .
			Html::input( 'wpRemember', '1', 'hidden' ) .
			Html::input( 'wpCreateaccountToken', $token, 'hidden' ) .
			Html::input( 'watch', $watchArticle, 'hidden' ) .
			$stickHTTPS .
			Html::closeElement( 'form' );
		echo Html::openElement( 'div', array( 'id' => 'mw-mf-accountcreate', 'class' => 'content' ) );
		$this->renderGuiderMessage();
		$this->renderMessageHtml( true );
		echo $form;
		echo Html::closeElement( 'div' );
	}

	/**
	 * Hijack captcha output
	 *
	 * Captcha output appears in $tpl->data['header'] but there's a lot
	 * of cruft that comes with it. We just want to get the captcha image
	 * a display an input field for the user to enter captcha info, without
	 * the additinal cruft.
	 *
	 * @todo move this into ConfirmEdit extension when MW is context aware
	 * @param string $header
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
			return $header;
		}
		$captchaId = $matches[1];

		// generate src for captcha img
		$captchaSrc = SpecialPage::getTitleFor( 'Captcha', 'image' )
			->getLocalUrl( array( 'wpCaptchaId' => $captchaId ) );

		// add reload if fancyCaptcha and has reload
		if ( stristr( $header, 'fancycaptcha-reload' ) ) {
			$output = $this->getSkin()->getOutput();
			$output->addModuleStyles( 'ext.confirmEdit.fancyCaptcha.styles' );
			$output->addModules( 'ext.confirmEdit.fancyCaptchaMobile' );
			$captchaReload = Html::element( 'br' ) .
				Html::openElement( 'div', array( 'id' => 'mf-captcha-reload-container' ) ) .
				Html::element(
					'span',
					array(
						'class' => 'confirmedit-captcha-reload fancycaptcha-reload'
					),
					wfMessage( 'fancycaptcha-reload-text' )->text()
				) .
				Html::closeElement( 'div' ); #mf-captcha-reload-container
		} else {
			$captchaReload = '';
		}

		// captcha output html
		$captchaHtml =
			Html::openElement( 'div',
				array( 'class' => 'inputs-box' ) ) .
			Html::element( 'img',
				array(
					'class' => 'fancycaptcha-image',
					'src' => $captchaSrc,
				)
			) .
			$captchaReload .
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
