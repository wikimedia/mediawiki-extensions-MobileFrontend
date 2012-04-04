<?php

class SpecialMobileFrontend extends SpecialPage {

	public function __construct() {
		parent::__construct( 'MobileFrontend' );
	}

	public function execute( $par ) {
		if ( $par != '' ) {
			$par = strtolower( $par );
			if ( method_exists( $this, $par ) ) {
				$this->{$par}();
			}
		}
	}
	
	protected function feedback() {
		$out = $this->getOutput();
		$request = $this->getRequest();
		$user = $this->getUser();
		$form = new MobileFeedbackForm( $request, $user );

		// if the form was posted, validate and handle success/failure
		if ( $request->wasPosted() ) {
		} else { // else show form
			$out->addHtml( $form->getForm() );
		}
	}
}

class MobileFeedbackForm {
	protected $formFieldEmail;
	protected $formFieldCategory;
	protected $formFieldMessage;
	protected $request;
	
	public function __construct( WebRequest $request, User $user ) {
		$this->request = $request;
		$this->user = $user;
	}
	
	public function setFormFieldValuesByArray( array $formFieldValues ) {
		foreach( $formFieldValues as $formField => $value ) {
			$propertyName = "formField" . ucfirst( $formField );
			if ( property_exists( $this, $propertyName ) ) {
				$this->${$propertyName} = $value;
			}
		}
	}
	
	public function getForm() {
		global $wgLanguageCode;
		$extMobileFrontend = new ExtMobileFrontend();

		$extMobileFrontend->getMsg();
		$leaveFeedbackTemplate = new LeaveFeedbackTemplate();
		$options = array(
						'languageCode' => $wgLanguageCode ? $wgLanguageCode : 'en',
						'feedbackLinks' => $this->getFeedbackLinks(),
						'feedbackPostURL' => str_replace( '&mobileaction=leave_feedback', '', $this->request->getFullRequestURL() ) . '&mobileaction=leave_feedback_post',
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
	}

	public function validate() {
		
	}
}