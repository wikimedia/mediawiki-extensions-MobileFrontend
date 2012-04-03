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
	/**
	 * Form field definitions
	 *
	 * Each field in the form should be defined below following the format
	 *		'<field name>' => array(
	 *			'required' => <bool>, // whether or not the field is required
	 *			'validate' => <string>, // the method name to used to \
	 *				validate this data
	 *			'error' => <string>, // the corresponding error message to \
	 *				display for this field (set during validation)
	 *			'value' => <mixed>, // the value of the form field
	 *		)
	 * @param array
	 */
	protected $form_fields = array(
		'category' => array( 
			'required' => true,
			'validate' => null,
			'error' => null,
			'value' => null,
		),
		'message' => array( 
			'required' => true,
			'validate' => null, 
			'error' => null,
			'value' => null,
		),
		'subject' => array( 
			'required' => true,
			'validate' => null,
			'error' => null,
			'value' => null,
		),
	);

	/**
	 * @param WebRequest
	 */
	protected $request;

	/**
	 * @param User
	 */
	protected $user;

	/**
	 * @param bool
	 */
	protected $isValid;
	
	public function __construct( WebRequest $request, User $user ) {
		$this->request = $request;
		$this->user = $user;
	}
	
	/**
	 * Set $this->form_fields with values from an array of field data
	 *
	 * Given an array of <field name> => <value> pairs, set form field data
	 * locally (so long as the field has been defined).
	 * @param array
	 */
	public function setFormFieldValuesByArray( array $form_field_values ) {
		foreach( $form_field_values as $field_name => $value ) {
			if ( isset( $this->form_fields[ $field_name ]) ) {
				$this->form_fields[ $field_name ]['value'] = $value;
			}
		}
	}
	
	/**
	 * Fetch the form to be displayed.
	 * @return string HTML output of feedback form
	 */
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
	}

	/**
	 * @return bool
	 */
	public function isValid() {
		if ( !isset( $this->isValid ) ) {
			$this->validate();
		}
		return $this->isValid;
	}

	/**
	 * Perform validation on form fields
	 *
	 * Loop through form fields defined in $this->form_fields. Check the
	 * required-ness of a field, and perform any additional validation
	 * required by the field, as specified by the callback method defined in 
	 * the 'validate' field in the $this->form_fields array.
	 *
	 * Set $this->isValid to false is there is anything wrong with any of the
	 * fields.
	 */
	public function validate() {
		$valid = true;
		
		foreach ( $this->form_fields as $field_name => $data ) {
			// get rid of any extra whitespace
			$data['value'] = trim( $data['value'] );
			if ( $data['required'] === true ) {
				// make sure there's some kind of value present
				if ( !$data['value'] ) {
					$valid = false;
					$this->form_fields[ $field_name ]['error'] = 'Required field'; // @TODO turn into message
					continue;
				}
			}	
			
			// run any particular validation specified by the field definition
			if( !empty( $data['value'] ) && !is_null( $data['validate'] ) ) {
				$validate_method = $data['validate'];
				$field_valid = $this->{$validate_method}( $data );
				if ( $field_valid === false ) {
					$valid = false;
				}
			}
		}
		$this->isValid = $valid;
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
