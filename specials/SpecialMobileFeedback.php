<?php

class SpecialMobileFeedback extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileFeedback' );
	}

	public function execute( $par = '' ) {
		global $wgExtMobileFrontend;

		$wgExtMobileFrontend->setForceMobileView( true );
		$wgExtMobileFrontend->setContentTransformations( false );

		if ( $par == 'thanks' ) {
			$this->showThanks();
		} elseif ( $this->getRequest()->wasPosted() ) {
			$this->postFeedback();
		} else {
			$this->showForm();
		}
	}

	private function showForm() {
		$linkText = $this->msg( 'mobile-frontend-leave-feedback-link-text' )->text();
		$linkTarget = wfMessage( 'mobile-frontend-feedback-page' )->inContentLanguage()->plain();
		$leaveFeedbackText = wfMsgExt( 'mobile-frontend-leave-feedback-notice',
			array( 'replaceafter' ),
			Html::element( 'a', array( 'href' => Title::newFromText( $linkTarget )->getFullURL(), 'target' => '_blank' ),
			$linkText )
		);
		//@todo: remove hardcoded colons
		$this->getOutput()->addHTML(
			Html::openElement( 'form', array(
							'class' => 'feedback',
							'action' => $this->getTitle()->getLocalURL(),
							'method' => 'POST',
						)
					)
				. Html::element( 'input', array(
							'type' => 'hidden',
							'name' => 'edittoken',
							'value' => $this->getUser()->getEditToken(),
						)
					)
				. Html::element( 'input',
						array(
							'type' => 'hidden',
							'name' => 'returnto',
							'value' => $this->getRequest()->getText( 'returnto' ),
						)
					)
				. '<div tabindex="-1">'
					. '<div unselectable="on">'
						. '<span unselectable="on"><p>'
							. $this->msg( 'mobile-frontend-leave-feedback-title' )->parse()
						. '</p></span>'
					. '</div>'
					. '<div>'
						. '<div>'
							. "<div><p><small>{$leaveFeedbackText}</small>"
							. '</p></div>'
							. '<div><p>' . $this->msg( 'mobile-frontend-leave-feedback-subject' ) ->parse()
								. ':<br><input type="text" name="subject" maxlength="60"></p>'
							. '</div>'
							. '<div><p>'
								. $this->msg( 'mobile-frontend-leave-feedback-message' )->parse()
							. ':<br><textarea name="message" rows="5" cols="60"></textarea></p>'
							. '</div>'
						. '</div>'
					. '</div>'
					. Html::element( 'input',
						array(
								'type' => 'submit',
								'value' => $this->msg( 'mobile-frontend-leave-feedback-submit' )->text(),
							)
						)
					. '</div>'
				. '</div>'
			. '</form>'
		);
	}

	private function postFeedback() {
		wfProfileIn( __METHOD__ );
		$request = $this->getRequest();
		$user = $this->getUser();

		$subject = $request->getText( 'subject', '' );
		$message = $request->getText( 'message', '' );
		$token = $request->getText( 'edittoken', '' );
		$returnTo = Title::newFromText( $request->getText( 'returnto' ) );
		if ( !$returnTo ) {
			$returnTo = Title::newMainPage();
		}

		$title = Title::newFromText( wfMessage( 'mobile-frontend-feedback-page' )->inContentLanguage()->plain() );

		if ( $title->userCan( 'edit' ) &&
			!$user->isBlockedFrom( $title ) &&
			$user->matchEditToken( $token ) ) {
			$article = new Article( $title, 0 );
			$rawtext = $article->getRawText();
			$rawtext .= "\n== {$subject} == \n {$message} ~~~~ \n <small>User agent: {$_SERVER['HTTP_USER_AGENT']}</small> ";
			$article->doEdit( $rawtext, '' );
		}

		$location = $this->getTitle( 'thanks' )->getFullURL( array( 'returnto' => $returnTo ) );
		$request->response()->header( 'Location: ' . $location );
		wfProfileOut( __METHOD__ );
		exit;
	}

	private function showThanks() {
		$out = $this->getOutput();
		$out->addHtml( "<div class=mwm-message mwm-notice'>{$this->msg( 'mobile-frontend-leave-feedback-thanks' )->parse()}</div>" );
		$t = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( $t ) {
			$out->addReturnTo( $t );
		} else {
			$out->returnToMain();
		}
	}
}