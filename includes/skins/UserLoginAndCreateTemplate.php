<?php
/**
 * UserLoginAndCreateTemplate.php
 */

/**
 * Template overloader for user login and account cration templates
 *
 * Facilitates hijacking existing account creation/login template objects
 * by copying their properties to this new template, and exposing some
 * special mobile-specific magic.
 */
abstract class UserLoginAndCreateTemplate extends BaseTemplate {

	/**
	 * Overload the parent constructor
	 *
	 * Does not call the parent's constructor to prevent overwriting
	 * $this->data and $this->translatorobject since we're essentially
	 * just hijacking the existing template and its data here.
	 * @param BaseTemplate $template The original template object to overwrite
	 */
	public function __construct( $template ) {
		$this->copyObjectProperties( $template );
	}

	/**
	 * Render message box with system messages, e.g. errors or already logged-in notices
	 *
	 * @param string $action The type of action the page is used for ('login' or 'signup')
	 * @param bool $register Whether the user can register an account
	 */
	protected function renderMessageHtml( $action, $register = false ) {
		$msgBox = ''; // placeholder for displaying any login-related system messages (eg errors)
		$message = $this->data['message'];
		$messageType = $this->data['messagetype'];

		// FIXME: Migrate this to a server-side Mustache template
		// If there is a system message (error, warning, or success) display that
		if ( $message && $messageType ) {
			$msgBox .= Html::openElement( 'div', array( 'class' => $messageType . 'box' ) );
			$msgBox .= $message;
			$msgBox .= Html::closeElement( 'div' );
		// Render already logged-in notice
		} elseif ( $this->data['loggedin'] ) {
			$msg = ( $register ) ? 'mobile-frontend-userlogin-loggedin-register' : 'userlogin-loggedin';
			$msgBox .= Html::openElement( 'div', array( 'class' => 'warningbox' ) );
			$msgBox .= wfMessage( $msg )->params( $this->data['loggedinuser'] )->parse();
			$msgBox .= Html::closeElement( 'div' );
		// Show default welcome message
		} else {
			// The warningbox class is used more for informational purposes than actual warnings.
			$msgBox .= Html::openElement( 'div', array( 'class' => 'warningbox' ) );
			$headerMsg = wfMessage( 'mobile-frontend-generic-login' )->parse();
			$msgBox .= Html::element( 'strong', array(), $headerMsg );
			$msgBox .= Html::element( 'br' );
			$msgBox .= wfMessage( "mobile-frontend-generic-{$action}-action" )->plain();
			$msgBox .= Html::closeElement( 'div' );
			$msgBox .= $this->getLogoHtml();
		}
		echo $msgBox;
	}

	/**
	 * Copy public properties of one object to this one
	 * @param BaseTemplate $tpl The object whose properties should be copied
	 */
	protected function copyObjectProperties( $tpl ) {
		foreach ( get_object_vars( $tpl ) as $prop => $value ) {
			$this->$prop = $value;
		}
	}

	/**
	 * Get the current RequestContext
	 * @return RequestContext
	 */
	public function getRequestContext() {
		return RequestContext::getMain();
	}

	/**
	 * Prepare template data if an anon is attempting to log in after watching an article
	 * @return string
	 */
	protected function getArticleTitleToWatch() {
		$ret = '';
		$request = $this->getRequestContext()->getRequest();
		if ( $request->getVal( 'returntoquery' ) == 'article_action=watch' &&
			!is_null( $request->getVal( 'returnto' ) ) ) {
			$ret = $request->getVal( 'returnto' );
		}
		return $ret;
	}

	/**
	 * Determine whether or not we should attempt to 'stick https'
	 *
	 * If wpStickHTTPS is set as a value in login requests, when a user
	 * is logged in to HTTPS and if they attempt to view a page on http,
	 * they will be automatically redirected to HTTPS.
	 * @see https://gerrit.wikimedia.org/r/#/c/24026/
	 * @return bool
	 */
	protected function doStickHTTPS() {
		global $wgSecureLogin;
		$request = $this->getRequestContext()->getRequest();
		if ( $wgSecureLogin && $request->detectProtocol() === 'https' ) {
			return true;
		}
		return false;
	}

	/**
	 * Display Mobile Frontend specific logo over login form.
	 */
	protected function getLogoHtml() {
		global $wgMobileFrontendLogo;

		if ( !$wgMobileFrontendLogo ) {
			return '';
		}
		return '<div class="watermark">'
			. Html::element( 'img',
				array(
					'src' => $wgMobileFrontendLogo,
					'alt' => '',
				)
			)
			. '</div>';
	}
}
