<?php
/**
 * Provides a custom login form for mobile devices
 */
class UserLoginMobileTemplate extends UserLoginAndCreateTemplate {

	/**
	 * @TODO refactor this into parent template
	 */
	public function execute() {
		$action = $this->data['action'];
		$token = $this->data['token'];
		$watchArticle = $this->getArticleTitleToWatch();
		$stickHTTPS = ( $this->doStickHTTPS() ) ? Html::input( 'wpStickHTTPS', 'true', 'hidden' ) : '';
		$username = ( strlen( $this->data['name'] ) ) ? $this->data['name'] : null;
		$message = $this->data['message'];
		$messageType = $this->data['messagetype'];
		$msgBox = ''; // placeholder for displaying any login-related system messages (eg errors)
		$headMsg = $this->getHeadMsg();

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
		}
		// For Extension:Campaigns
		$campaign = $this->getSkin()->getRequest()->getText( 'campaign' );
		if ( $campaign ) {
			$query['campaign'] = $campaign;
		}

		$signupLink = Linker::link( SpecialPage::getTitleFor( 'Userlogin' ),
			wfMessage( 'mobile-frontend-main-menu-account-create' )->text(),
			array( 'class'=> 'mw-mf-create-account' ), $query );

		$login = Html::openElement( 'div', array( 'id' => 'mw-mf-login', 'class' => 'content' ) );

		if ( $headMsg ) {
			$msgBox .= Html::Element( 'div', array( 'class' => 'headmsg' ), $headMsg );
		}

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
			$msgBox .= $this->getLogoHtml();
		}

		$form = Html::openElement( 'div', array() ) .
			Html::openElement( 'form',
				array( 'name' => 'userlogin',
					'class' => 'user-login',
					'method' => 'post',
					'action' => $action ) ) .
			Html::openElement( 'div', array(
				'class' => 'wpInputs',
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
					'tabindex' => '3' ) ) .
			$signupLink .
			Html::input( 'wpLoginToken', $token, 'hidden' ) .
			Html::input( 'watch', $watchArticle, 'hidden' ) .
			$stickHTTPS .
			Html::closeElement( 'form' ) .
			Html::closeElement( 'div' );
		$login .= $msgBox . $form;
		$login .= Html::closeElement( 'div' );
		echo $login;
	}

}
