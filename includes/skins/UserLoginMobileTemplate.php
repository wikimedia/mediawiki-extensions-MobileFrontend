<?php
/**
 * UserLoginMobileTemplate.php
 */

/**
 * Provides a custom login form for mobile devices
 */
class UserLoginMobileTemplate extends UserLoginAndCreateTemplate {
	/** @var array $actionMessages Message keys for page actions */
	protected $actionMessages = array(
		'watch' => 'mobile-frontend-watchlist-login-action',
		'edit' => 'mobile-frontend-edit-login-action',
		'' => 'mobile-frontend-generic-login-action',
	);
	/** @var array $actionMessages Message keys for site links */
	protected $pageMessages = array(
		'Uploads' => 'mobile-frontend-donate-image-login-action',
		'Watchlist' => 'mobile-frontend-watchlist-login-action',
	);

	/**
	 * Build the login page
	 * @todo Refactor this into parent template
	 */
	public function execute() {
		$action = $this->data['action'];
		$token = $this->data['token'];
		$watchArticle = $this->getArticleTitleToWatch();
		$stickHTTPS = ( $this->doStickHTTPS() ) ? Html::input( 'wpStickHTTPS', 'true', 'hidden' ) : '';
		$username = ( strlen( $this->data['name'] ) ) ? $this->data['name'] : null;

		// @TODO make sure this also includes returnto and returntoquery from the request
		$query = array(
			'type' => 'signup',
		);
		// Security: $action is already filtered by SpecialUserLogin
		$actionQuery = wfCgiToArray( $action );
		if ( isset( $actionQuery['returnto'] ) ) {
			$query['returnto'] = $actionQuery['returnto'];
		}
		if ( isset( $actionQuery['returntoquery'] ) ) {
			$query['returntoquery'] = $actionQuery['returntoquery'];
			// Allow us to distinguish sign ups from the left nav to logins.
			// This allows us to show them an edit tutorial when they return to the page.
			if ( $query['returntoquery'] === 'welcome=yes' ) {
				$query['returntoquery'] = 'campaign=leftNavSignup';
			}
		}
		// For Extension:Campaigns
		$campaign = $this->getSkin()->getRequest()->getText( 'campaign' );
		if ( $campaign ) {
			$query['campaign'] = $campaign;
		}

		// Check for permission to create new account first
		$user = $this->getRequestContext()->getUser();
		if ( $user->isAllowed( 'createaccount' ) ) {
			$signupLink = Linker::link( SpecialPage::getTitleFor( 'Userlogin' ),
				wfMessage( 'mobile-frontend-main-menu-account-create' )->text(),
				array( 'class'=> 'mw-mf-create-account mw-ui-block' ), $query );
		} else {
			$signupLink = '';
		}

		// Check for permission to reset password first
		if ( $this->data['canreset'] && $this->data['useemail'] && $this->data['resetlink'] === true ) {
			$passwordReset = Html::element( 'a', array(
				'class' => 'mw-userlogin-help mw-ui-block',
				'href' => SpecialPage::getTitleFor( 'PasswordReset' )->getLocalUrl(),
			),
			wfMessage( 'passwordreset' )->text() );
		} else {
			$passwordReset = '';
		}

		$login = Html::openElement( 'div', array( 'id' => 'mw-mf-login', 'class' => 'content' ) );

		$form = Html::openElement( 'div', array() ) .
			Html::openElement( 'form',
				array( 'name' => 'userlogin',
					'class' => 'user-login',
					'method' => 'post',
					'action' => $action ) ) .
			Html::openElement( 'div', array(
				'class' => 'inputs-box',
			) ) .
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
					'id' => 'wpPassword1',
					'tabindex' => '2',
					'size' => '20' ) ) .
			Html::closeElement( 'div' ) .
			Html::input( 'wpRemember', '1', 'hidden' ) .
			Html::input( 'wpLoginAttempt', wfMessage( 'mobile-frontend-login' )->text(), 'submit',
				array( 'id' => 'wpLoginAttempt',
					'class' => $baseClass = MobileUI::buttonClass( 'constructive' ),
					'tabindex' => '3' ) ) .
			Html::input( 'wpLoginToken', $token, 'hidden' ) .
			Html::input( 'watch', $watchArticle, 'hidden' ) .
			$stickHTTPS .
			Html::closeElement( 'form' ) .
			$passwordReset .
			$signupLink .
			Html::closeElement( 'div' );
		echo $login;
		$this->renderGuiderMessage();
		$this->renderMessageHtml();
		echo $form;
		echo Html::closeElement( 'div' );
	}

}
