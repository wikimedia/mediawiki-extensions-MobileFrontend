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
abstract class UserLoginAndCreateTemplate extends QuickTemplate {
	/** @var array $actionMessagesHeaders Message keys for site links */
	protected $pageMessageHeaders = array(
		'Uploads' => 'mobile-frontend-donate-image-login',
		'Watchlist' => 'mobile-frontend-watchlist-purpose',
	);
	/** @var array $actionMessages Message keys for site links */
	protected $pageMessages = array();

	/** @var array $actionMessagesHeaders Message keys for page actions */
	protected $actionMessageHeaders = array(
		'watch' => 'mobile-frontend-watchlist-purpose',
		'edit' => 'mobile-frontend-edit-login',
		'signup-edit' => 'mobile-frontend-edit-login',
		'' => 'mobile-frontend-generic-login',
	);

	/**
	 * Message keys for page actions
	 * @var array $actionMessages
	 */
	protected $actionMessages = array();

	/**
	 * Overload the parent constructor
	 *
	 * Does not call the parent's constructor to prevent overwriting
	 * $this->data and $this->translatorobject since we're essentially
	 * just hijacking the existing template and its data here.
	 * @param QuickTemplate $template The original template object to overwrite
	 */
	public function __construct( $template ) {
		$this->copyObjectProperties( $template );
	}

	/**
	 * Render message box with system messages, e.g. errors or already logged-in notices
	 *
	 * @param bool $register Whether the user can register an account
	 */
	protected function renderMessageHtml( $register = false ) {
		$msgBox = ''; // placeholder for displaying any login-related system messages (eg errors)

		// Render logged-in notice (beta/alpha)
		if ( $this->data['loggedin'] ) {
			$msg = ( $register ) ? 'mobile-frontend-userlogin-loggedin-register' : 'userlogin-loggedin';
			$msgBox .= Html::element( 'div', array( 'class' => 'alert warning' ),
				wfMessage( $msg )->params(
					$this->data['loggedinuser'] )->parse() );
		}

		// Render login errors
		$message = $this->data['message'];
		$messageType = $this->data['messagetype'];
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
		echo $msgBox;
	}

	/**
	 * Copy public properties of one object to this one
	 * @param QuickTemplate $tpl The object whose properties should be copied
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
	 * Gets the message that should guide a user who is creating an account or
	 * logging in to an account.
	 * @return array First element is header of message and second is the content.
	 */
	protected function getGuiderMessage() {
		$req = $this->getRequestContext()->getRequest();
		// omit UserLogin's own messages in this template to avoid duplicate messages - bug T73771, T86031
		if ( $this->data['messagetype'] !== 'error' ) {
			$this->data['message'] = '';
		}

		if ( $req->getVal( 'returnto' )
			&& ( $title = Title::newFromText( $req->getVal( 'returnto' ) ) )
		) {
			list( $returnto, /* $subpage */ ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
			$title = $title->getText();
		} else {
			$returnto = '';
			$title = '';
		}
		$returnToQuery = wfCgiToArray( $req->getVal( 'returntoquery' ) );
		if ( isset( $returnToQuery['article_action'] ) ) {
			$action = $returnToQuery['article_action'];
		} else {
			$action = '';
		}

		$heading = '';
		$content = '';

		if ( isset( $this->pageMessageHeaders[$returnto] ) ) {
			$heading = wfMessage( $this->pageMessageHeaders[$returnto] )->parse();
			if ( isset( $this->pageMessages[$returnto] ) ) {
				$content = wfMessage( $this->pageMessages[$returnto] )->parse();
			}
		} elseif ( isset( $this->actionMessageHeaders[$action] ) ) {
			$heading = wfMessage( $this->actionMessageHeaders[$action], $title )->parse();
			if ( isset( $this->actionMessages[$action] ) ) {
				$content = wfMessage( $this->actionMessages[$action], $title )->parse();
			}
		}
		return array( $heading, $content );
	}

	/**
	 * Renders a prompt above the login or upload screen
	 *
	 */
	protected function renderGuiderMessage() {
		if ( !$this->data['loggedin'] ) {
			$msgs = $this->getGuiderMessage();
			if ( $msgs[0] ) {
				echo Html::openElement( 'div', array( 'class' => 'headmsg' ) );
				echo Html::element( 'strong', array(), $msgs[0] );
				if ( $msgs[1] ) {
					echo Html::element( 'div', array(), $msgs[1] );
				}
				echo Html::closeElement( 'div' );
			}
		}
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
