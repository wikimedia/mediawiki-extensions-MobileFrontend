<?php

class SpecialMobileOptions extends UnlistedSpecialPage {
	/**
	 * @var Title
	 */
	private $returnToTitle;
	private $subpage;
	private $options = array(
		'BetaOptIn' => array( 'get' => 'betaOptInGet', 'post' => 'betaOptInPost' ),
		'BetaOptOut' => array( 'get' => 'betaOptOutGet', 'post' => 'betaOptOutPost' ),
		'EnableImages' => array( 'get' => 'enableImages' ),
		'DisableImages' => array( 'get' => 'disableImages' )
	);

	public function __construct() {
		parent::__construct( 'MobileOptions' );
	}

	public function execute( $par = '' ) {
		global $wgExtMobileFrontend;

		$this->setHeaders();
		$wgExtMobileFrontend->setForceMobileView( true );
		$wgExtMobileFrontend->setContentTransformations( false );
		if ( !isset( $this->options[$par] ) ) {
			$this->getOutput()->showErrorPage( 'error', 'mobile-frontend-unknown-option', array( $par ) );
			return;
		}
		$this->subpage = $par;
		$option = $this->options[$par];

		$this->returnToTitle = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( !$this->returnToTitle ) {
			$this->returnToTitle = Title::newMainPage();
		}

		if ( $this->getRequest()->wasPosted() && isset( $option['post'] ) ) {
			$func = $option['post'];
		} else {
			$func = $option['get'];
		}
		$this->$func();
	}

	public static function getMobileToken() {
		global $wgUser, $wgRequest;
		$token = $wgRequest->getSessionData( 'wsMobileToken' );
		if ( $token === null ) {
			if ( $wgUser->isAnon() ) {
				wfSetupSession();
			}
			$token = MWCryptRand::generateHex( 32 );
			$wgRequest->setSessionData( 'wsMobileToken', $token );
		}
		return $token;
	}

	public static function getURL( $option, Title $returnTo = null, $fullUrl = false ) {
		global $wgExtMobileFrontend;
		$t = SpecialPage::getTitleFor( 'MobileOptions', $option );
		$params = array();
		if ( $returnTo ) {
			$params['returnto'] = $returnTo->getPrefixedText();
		}
		if ( $fullUrl ) {
			return $wgExtMobileFrontend->getMobileUrl( $t->getFullURL( $params ) );
		} else {
			return $t->getLocalURL( $params );
		}
	}

	private function showEnquiryForm( $headingMsg, $textMsg, $yesButtonMsg, $noButtonMsg ) {
		$out = $this->getOutput();

		$out->addHTML( '
			<h1>' . wfMessage( $headingMsg )->parse() . '</h1>
			<p>' . wfMessage( $textMsg )->parse() . '</p>
			<div id="disableButtons">'
				. Html::openElement( 'form',
					array(
							'method' => 'POST',
							'action' => $this->getTitle( $this->subpage )->getLocalURL(),
						)
					)
				. Html::element( 'input',
					array(
						'name' => 'returnto',
						'type' => 'hidden',
						'value' => $this->returnToTitle->getFullText(),
					)
				)
				. Html::element( 'button',
					array(
							'id' => 'disableButton',
							'type' => 'submit',
						),
						wfMessage( $yesButtonMsg )->text()
					)
				. Html::closeElement( 'form' )
				. Html::openElement( 'form',
					array(
							'method' => 'GET',
							'action' => $this->returnToTitle->getLocalURL(),
						)
					)
				. Html::element( 'button',
					array(
							'id' => 'backButton',
							'type' => 'submit',
						),
						wfMessage( $noButtonMsg )->text()
					)
				. Html::closeElement( 'form' )
			. '</div>'
		);
	}

	private function doReturnTo() {
		global $wgExtMobileFrontend;
		$params = array();
		$params['t'] = md5( time() ); // this is a hack to get around the 304 response and local browser cache
		$this->getOutput()->sendCacheControl(); // cache should already be private
		$this->getRequest()->response()->header( 'Location: '
			. $wgExtMobileFrontend->getMobileUrl( wfExpandUrl( $this->returnToTitle->getFullURL( $params ) ) ) );
		exit;
	}

	private function betaOptInGet() {
		$this->getOutput()->setPageTitle( $this->msg( 'mobile-frontend-opt-in-title' ) );
		$this->showEnquiryForm(
			'mobile-frontend-opt-in-message',
			'mobile-frontend-opt-in-explain',
			'mobile-frontend-opt-in-yes-button',
			'mobile-frontend-opt-in-no-button'
		);
	}

	private function betaOptInPost() {
		global $wgExtMobileFrontend;
		$wgExtMobileFrontend->setOptInOutCookie( '1' );
		$this->doReturnTo();
	}

	private function betaOptOutGet() {
		$this->getOutput()->setPageTitle( $this->msg( 'mobile-frontend-opt-out-title' ) );
		$this->showEnquiryForm(
			'mobile-frontend-opt-out-message',
			'mobile-frontend-opt-out-explain',
			'mobile-frontend-opt-out-yes-button',
			'mobile-frontend-opt-out-no-button'
		);
	}

	private function betaOptOutPost() {
		global $wgExtMobileFrontend;
		$wgExtMobileFrontend->setOptInOutCookie( '' );
		$this->doReturnTo();
	}

	private function checkMobileToken() {
		global $wgExtMobileFrontend;
		$qsMobileToken = $this->getRequest()->getVal( 'mobiletoken' );
		if ( !$qsMobileToken ) {
			$device = $wgExtMobileFrontend->getDevice();
			if ( isset( $device['supports_javascript'] ) && $device['supports_javascript'] ) {
				return false;
			} else {
				return true;
			}
		}

		$mobileToken = self::getMobileToken();
		if ( $mobileToken === $qsMobileToken ) {
			return true;
		} else {
			return false;
		}
	}

	private function enableImages( $enable = true ) {
		//if ( $this->checkMobileToken() ) {
		$this->getRequest()->response()->setcookie( 'disableImages', $enable ? '' : '1' );
		//}
		$this->doReturnTo();
	}

	private function disableImages() {
		$this->enableImages( false );
	}
}
