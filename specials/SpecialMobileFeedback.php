<?php

class SpecialMobileFeedback extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileFeedback' );
	}

	public function execute( $par = '' ) {
		global $wgExtMobileFrontend;

		$this->setHeaders();
		$this->getOutput()->setPageTitle( $this->msg( 'mobile-frontend-leave-feedback-page-title' ) );
		$wgExtMobileFrontend->setForceMobileView( true );
		$wgExtMobileFrontend->setContentTransformations( false );

		if ( $par == 'thanks' ) {
			$this->showThanks();
		} else {
			$form = new HTMLForm( $this->getForm(), $this );
			$form->setTitle( $this->getTitle() );
			$form->setId( 'feedback' );
			$form->setSubmitText( $this->msg( 'mobile-frontend-leave-feedback-submit' )->text() );
			$form->setSubmitCallback( array( $this, 'postFeedback' ) );
			$form->setAction( $this->getFullTitle()->getLocalURL() );
			$form->show();
		}
	}

	private function getForm() {
		$linkText = $this->msg( 'mobile-frontend-leave-feedback-link-text' )->text();
		$linkTarget = wfMessage( 'mobile-frontend-feedback-page' )->inContentLanguage()->plain();
		$leaveFeedbackText = wfMsgExt( 'mobile-frontend-leave-feedback-notice',
			array( 'replaceafter' ),
			Html::element( 'a', array( 'href' => Title::newFromText( $linkTarget )->getFullURL(), 'target' => '_blank' ),
			$linkText )
		);
		return array(
			'form-desc' => array(
				'type' => 'info',
				'raw' => true,
				'default' => '<div unselectable="on">'
					. '<p><span unselectable="on">'
						. $this->msg( 'mobile-frontend-leave-feedback-title' )->parse()
					. '</span><br/>'
					. "<small>{$leaveFeedbackText}</small>"
				. '</p></div>'
			),
			'subject-desc' => array(
				'type' => 'info',
				'raw' => true,
				'default' => $this->msg( 'mobile-frontend-leave-feedback-subject' ) ->parse()
					. '<br/>',
			),
			'returnto' => array(
				'type' => 'hidden',
				'default' => $this->getRequest()->getText( 'returnto', '' ),
			),
			'subject' => array(
				'type' => 'text',
			),
			'message-desc' => array(
				'type' => 'info',
				'raw' => true,
				'default' => $this->msg( 'mobile-frontend-leave-feedback-message' )->parse()
					. '<br/>',
			),
			'message' => array(
				'type' => 'textarea',
				'rows' => 5,
				'cols' => 60,
				'validation-callback' => array( $this, 'validateMessage' ),
			),
		);
	}

	public function postFeedback( $form ) {
		wfProfileIn( __METHOD__ );

		$subject = $form['subject']
			? $form['subject']
			: $this->msg( 'mobile-frontend-feedback-no-subject' )->inContentLanguage()->text();
		$message = trim( $form['message'] );
		$returnTo = Title::newFromText( $form['returnto'] );
		if ( !$returnTo ) {
			$returnTo = Title::newMainPage();
		}

		$title = Title::newFromText( wfMessage( 'mobile-frontend-feedback-page' )->inContentLanguage()->plain() );

		if ( $title->userCan( 'edit' ) &&
			!$this->getUser()->isBlockedFrom( $title ) ) {
			$article = new Article( $title, 0 );
			$rawtext = $article->getRawText();
			$rawtext .= "\n== {$subject} ==\n{$message} ~~~~\n<br><small>User agent: <code>{$_SERVER['HTTP_USER_AGENT']}</code></small> ";
			$article->doEdit( $rawtext,
				$this->msg( 'mobile-frontend-feedback-edit-summary', $subject )->inContentLanguage()->text()
			);
		}

		$location = $this->getTitle( 'thanks' )->getFullURL( array( 'returnto' => $returnTo ) );
		$this->getRequest()->response()->header( 'Location: ' . $location );
		wfProfileOut( __METHOD__ );
		exit;
	}

	public function validateMessage( $textarea ) {
		if ( mb_strlen( trim( $textarea ) ) < 20 ) {
			return $this->msg( 'mobile-frontend-feedback-no-message' );
		}
		return true;
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