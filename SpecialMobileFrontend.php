<?php

if ( !defined( 'MEDIAWIKI' ) ) {
	die( -1 );
}

class SpecialMobileFrontend extends SpecialPage {

	public function __construct() {
		parent::__construct( 'MobileFrontend' );
	}

	public function execute( $par ) {
		if ( $par != '' ) {
			$par = strtolower( $par );
			if ( method_exists( $this, $par ) ) { // @TODO make this safer
				$this->{$par}();
			}
		}
	}

	protected function feedback() {
		$out = $this->getOutput();
		$out->setPageTitle( wfMsg( 'mobile-frontend-leave-feedback-special-title' ) );
		$request = $this->getRequest();
		$user = $this->getUser();
		$form = new MobileFeedbackForm( $request, $user );

		// if the form was posted, validate and handle success/failure
		if ( $request->wasPosted() ) {
			$form->setFormFieldValuesByArray( $request->getValues() );
			if ( $form->isValid() === true ) {
				$out->addHtml( $form->onSuccess() );
				return;
			}
		}
		
		$out->addHtml( $form->getForm() );
		return;
	}
}

class MobileFeedbackForm {
	protected $form_fields = array(
		'category' => array( 
			'required' => true,
			'validate' => null, // will be a callback?
			'error' => '', // wfMsg( specific error message )
			'value' => null,;
		),
		'message' => array( 
			'required' => true,
			'validate' => 'validateExistence', // will be a callback?
			'error' => '', // wfMsg( specific error message )
			'value' => null,
		),
		'subject' => array( 
			'required' => true,
			'validate' => 'validateExistence', // will be a callback?
			'error' => '', // wfMsg( specific error message )
			'value' => null,		
		),
	);

	protected $request;
	protected $isValid;
	
	public function __construct( WebRequest $request, User $user ) {
		$this->request = $request;
		$this->user = $user;
	}
	
	public function setFormFieldValuesByArray( array $form_field_values ) {
		foreach( $form_field_values as $field_name => $value ) {
			if ( isset( $this->form_fields[ $field_name ]) ) {
				$this->form_fields[ $field_name ]['value'] = $value;
			}
		}
	}
	
	public function getForm() {
		global $wgLanguageCode;
		$extMobileFrontend = $this->getExtMobileFrontend();
		$extMobileFrontend->getMsg();
		$leaveFeedbackTemplate = new LeaveFeedbackTemplate();
		$options = array(
						'languageCode' => $wgLanguageCode ? $wgLanguageCode : 'en',
						'feedbackLinks' => $this->getFeedbackLinks(),
						'feedbackPostURL' => $this->request->getFullRequestURL(),
						'editToken' => $this->user->getEditToken(),
						'title' => $extMobileFrontend::$messages['mobile-frontend-leave-feedback-title'],
						'notice' => $extMobileFrontend::$messages['mobile-frontend-leave-feedback-notice'],
						'subject' => $extMobileFrontend::$messages['mobile-frontend-leave-feedback-subject'],
						'message' => $extMobileFrontend::$messages['mobile-frontend-leave-feedback-message'],
						'cancel' => $extMobileFrontend::$messages['mobile-frontend-leave-feedback-cancel'],
						'submit' => $extMobileFrontend::$messages['mobile-frontend-leave-feedback-submit'],
						);
		$leaveFeedbackTemplate->setByArray( $options );
		$leaveFeedbackHtml = $leaveFeedbackTemplate->getHTML();
		
		return $leaveFeedbackHtml;
	}

	public function getFeedbackLinks() {
		return array(
			'articlePersonal' => '#',
			'articleFactual' => '#',
			'articleOther' => '#',
		);
	public function isValid() {
		if ( !isset( $this->isValid ) ) {
			$this->validate();
		}
		return $this->isValid;
	}

	public function validate() {
		$this->isValid = true;
	}
	
	public function onSuccess() {
		$extMobileFrontend = $this->getExtMobileFrontend();
		$extMobileFrontend->getMsg();
		$leaveFeedbackSuccessTemplate = new LeaveFeedbackSuccessTemplate();
		$successOut = $leaveFeedbackSuccessTemplate->getHTML();
		return $successOut;
	}

	protected function getExtMobileFrontend() {
		static $extMobileFrontend;
		
		if ( !isset( $extMobileFrontend )) {
			$extMobileFrontend = new ExtMobileFrontend();
		}
		
		return $extMobileFrontend;
	}
}
