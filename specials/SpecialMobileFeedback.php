<?php

class SpecialMobileFeedback extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileFeedback' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();
		$this->getOutput()->setPageTitle( $this->msg( 'mobile-frontend-leave-feedback-special-title' )->text() );
		$context = MobileContext::singleton();
		$context->setForceMobileView( true );
		$context->setContentTransformations( false );

		if ( $par == 'thanks' ) {
			$this->showThanks();
		} elseif ( $par == 'error' ) {
			$this->showError();
		} else {
			$this->renderFeedbackHtml();
		}
	}

	protected function renderFeedbackHtml() {
		global $wgMFFeedbackLinks;
		/** Section header text **/
		$technicalProblemSectionHeader = $this->msg( 'mobile-frontend-leave-feedback-technical-problem-section-header' )->escaped();
		$generalSectionHeader = $this->msg( 'mobile-frontend-leave-feedback-general-section-header' )->escaped();
		$articleFeedbackSectionHeader = $this->msg( 'mobile-frontend-leave-feedback-article-feedback-section-header' )->escaped();

		wfRunHooks( 'MobileFrontendOverrideFeedbackLinks', array(
			$this->getRequest()->getText( 'feedbacksource', '' ),
			$this->getRequest()->getText( 'returnto', '' ),
			) );
		/** Links **/
		$allowedLinks = array(
			'Technical',
			'General',
			'ArticlePersonal',
			'ArticleFactual',
			'ArticleOther',
		);

		// get configured link values
		foreach ( $allowedLinks as $v ) {
			if ( !isset( $wgMFFeedbackLinks[ $v ] ) || !strlen( trim( $wgMFFeedbackLinks[ $v ] ) ) ) {
				$linkVal = '#';
			} else {
				$linkVal = htmlspecialchars( $wgMFFeedbackLinks[ $v ], ENT_QUOTES, 'UTF-8', false );
			}
			$varName = 'feedback' . $v . 'Link';
			$ { $varName } = $linkVal;
		}

		// Do we display the feedback form or use the link?
		if ( isset( $feedbackTechnicalLink ) && $feedbackTechnicalLink != '#' ) {
			$useFeedbackForm = false;
		} else {
			$useFeedbackForm = true;
		}

		/** Link text **/
		$feedbackTechnicalLinkText = ( $useFeedbackForm ) ? '' : $this->msg( 'mobile-frontend-leave-feedback-technical-link-text' )->escaped();
		$feedbackGeneralLinkText = $this->msg( 'mobile-frontend-leave-feedback-general-link-text' )->escaped();
		$feedbackArticlePersonalLinkText = $this->msg( 'mobile-frontend-leave-feedback-article-personal-link-text' )->escaped();
		$feedbackArticleFactualLinkText = $this->msg( 'mobile-frontend-leave-feedback-article-factual-link-text' )->escaped();
		$feedbackArticleOtherLinkText = $this->msg( 'mobile-frontend-leave-feedback-article-other-link-text' )->escaped();
		$warning = $this->msg( 'mobile-frontend-leave-feedback-warning' );

		$html = <<<HTML
		{$warning}
		<div class='feedback'>
		<h2 class="section_heading" id="section_1">{$technicalProblemSectionHeader}</h2>
		<div class="content_block" id="content_1">
HTML;
		$this->getOutput()->addHtml( $html );

		if ( $useFeedbackForm ) {
			/** Fetch form HTML **/
			if ( MFCompatCheck::checkHTMLFormCoreUpdates() ) {
				$form = new HTMLForm( $this->getForm(), $this );
			} else {
				$form = new HTMLFormMobile( $this->getForm( 'div' ), $this );
			}
			$form->setDisplayFormat( 'raw' );
			$form->setTitle( $this->getTitle() );
			$form->setId( 'mf-feedback-form' );
			$form->setSubmitText( $this->msg( 'mobile-frontend-leave-feedback-submit' )->escaped() );
			$form->setSubmitCallback( array( $this, 'postFeedback' ) );
			$form->setAction( $this->getRequest()->getRequestURL() . "#mf-feedback-form" );
			$form->show();
		} else {
			$html = <<<HTML
			<ul>
				<li><a href="{$feedbackTechnicalLink}">{$feedbackTechnicalLinkText}</a></li>
			</ul>
HTML;
			$this->getOutput()->addHtml( $html );
		}

		$html = <<<HTML
		</div>
		<h2 class="section_heading" id="section_2">{$generalSectionHeader}</h2>
		<div class="content_block" id="content_2">
			<ul>
				<li><a href="{$feedbackGeneralLink}">{$feedbackGeneralLinkText}</a></li>
			</ul>
		</div>
		<h2 class="section_heading" id="section_3">{$articleFeedbackSectionHeader}</h2>
		<div class="content_block" id="content_3">
			<ul>
				<li>
					<a href="{$feedbackArticlePersonalLink}">{$feedbackArticlePersonalLinkText}</a>
				</li>
				<li>
					<a href="{$feedbackArticleFactualLink}">{$feedbackArticleFactualLinkText}</a>
				</li>
				<li>
					<a href="{$feedbackArticleOtherLink}">{$feedbackArticleOtherLinkText}</a>
				</li>
			</ul>
		</div>
		</div>
HTML;

		$this->getOutput()->addHtml( $html );
	}

	protected function getForm( $displaySuffix = '' ) {
		$subjectPlaceholder = $this->msg( 'mobile-frontend-leave-feedback-form-subject-placeholder' )->escaped();
		$messagePlaceholder = $this->msg( 'mobile-frontend-leave-feedback-form-message-placeholder' )->escaped();
		return array(
			'returnto' => array(
				'type' => 'hidden' . $displaySuffix,
				'default' => $this->getRequest()->getText( 'returnto', '' ),
			),
			'source' => array(
				'type' => 'hidden' . $displaySuffix,
				'default' => $this->getRequest()->getText( 'feedbacksource', '' )
			),
			'subject' => array(
				'type' => 'text' . $displaySuffix,
				'maxlength' => 60,
				'validation-callback' => array( $this, 'validateSubject' ),
				'placeholder' => $subjectPlaceholder,
			),
			'message' => array(
				'type' => 'textarea' . $displaySuffix,
				'rows' => 5,
				'cols' => 60,
				'validation-callback' => array( $this, 'validateMessage' ),
				'placeholder' => $messagePlaceholder,
			),
		);
	}

	public function postFeedback( $form ) {
		global $wgMFRemotePostFeedback;

		$subject = $this->getFormattedSubject( $form );
		$message = $this->getFormattedMessage( $form );
		$returnTo = $form['returnto'];
		$context = MobileContext::singleton();
		if ( $wgMFRemotePostFeedback === true ) {
			$success = $this->postRemoteFeedback( $subject, $message );
		} else {
			$success = $this->postLocalFeedback( $subject, $message );
		}

		if ( $success === true ) {
			$location = $context->getMobileUrl(
				$this->getTitle( 'thanks' )->getFullURL( array( 'returnto' => $returnTo ) ) );
			$this->getRequest()->response()->header( 'Location: ' . $location );
			exit;
		} else {
			$location = $context->getMobileUrl(
				$this->getTitle( 'error' )->getFullURL( array( 'returnto' => $returnTo ) ) );
			$this->getRequest()->response()->header( 'Location: ' . $location );
			exit;
		}
	}

	protected function postLocalFeedback( $subject, $message ) {
		wfProfileIn( __METHOD__ );

		// Is this really right? Are people really checking all of the different
		// language variants of this page?
		// Perhaps this makes more sense as something non-language specific...
		$title = Title::newFromText( wfMessage( 'mobile-frontend-feedback-page' )->inContentLanguage()->plain() );

		if ( $title->userCan( 'edit' ) &&
			!$this->getUser()->isBlockedFrom( $title ) ) {
			$article = new Article( $title, 0 );
			$rawtext = $article->getRawText();
			$rawtext .= "\n== {$subject} ==\n";
			$rawtext .= $message;
			$article->doEdit( $rawtext,
				$this->msg( 'mobile-frontend-feedback-edit-summary', $subject )->inContentLanguage()->text()
			);
			$ret = true;
		} else {
			$ret = false;
		}

		wfProfileOut( __METHOD__ );
		return $ret;
	}

	protected function getFormattedSubject( $form ) {
		$subject = $form['subject']
			? $form['subject']
			: $this->msg( 'mobile-frontend-feedback-no-subject' )->inContentLanguage()->text();
		return $subject;
	}

	protected function getFormattedMessage( $form ) {
		$rawMsg = trim( $form['message'] );
		$feedbackSource = trim( $form['source'] );
		$returnTo = trim( $form['returnto'] );
		$msg = "{$rawMsg} ~~~~\n<br><small>User agent: <code>{$_SERVER['HTTP_USER_AGENT']}</code> Source: <code>{$feedbackSource}</code> Referring page: {$returnTo}</small> ";
		return $msg;
	}

	protected function postRemoteFeedback( $subject, $message ) {
		global $wgMFRemotePostFeedbackUrl, $wgMFRemotePostFeedbackUsername,
			$wgMFRemotePostFeedbackPassword, $wgMFRemotePostFeedbackArticle;

		try {
			$apiClient = new MobileFrontendMWApiClient( $wgMFRemotePostFeedbackUrl,
				$wgMFRemotePostFeedbackUsername, $wgMFRemotePostFeedbackPassword );
			return $apiClient->editArticle( $wgMFRemotePostFeedbackArticle, $subject, $message );
		} catch ( Exception $e ) {
			return false;
		}
	}

	public function validateSubject( $textfield ) {
		if ( mb_strlen( trim( $textfield ) ) < 1 ) {
			return $this->msg( 'mobile-frontend-feedback-no-subject-field' )->text();
		}
		return true;
	}

	public function validateMessage( $textarea ) {
		if ( mb_strlen( trim( $textarea ) ) < 1 ) {
			return $this->msg( 'mobile-frontend-feedback-no-message' )->text();
		}
		return true;
	}

	protected function showThanks() {
		$this->showPostFeedbackOutput( 'mobile-frontend-leave-feedback-thanks' );
	}

	protected function showError() {
		$this->showPostFeedbackOutput( 'mobile-frontend-leave-feedback-post-error' );
	}

	protected function showPostFeedbackOutput( $msg ) {
		$out = $this->getOutput();
		$out->addHtml( "<div class=mwm-message mwm-notice'>{$this->msg( $msg )->parse()}</div>" );
		$t = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( $t ) {
			$out->addReturnTo( $t );
		} else {
			$out->returnToMain();
		}
	}
}

class MobileFrontendMWApiClient {
	protected $username;
	protected $password;
	protected $cookieJar;
	protected $url;
	protected $loggedIn = false;

	public function __construct( $url = null, $username = null, $password = null ) {
		$opts = array( 'url', 'username', 'password' );
		foreach ( $opts as $opt ) {
			if ( !is_null( $ { $opt } ) ) {
				$setMethodName = "set" . ucfirst( $opt );
				$this->$setMethodName( $ { $opt } );
			}
		}
	}

	public function setUsername( $username ) {
		if ( !strlen( $username ) ) {
			throw new Exception ( 'Invalid username' );
		}
		$this->username = $username;
	}

	public function getUsername() {
		return $this->username;
	}

	public function setCookieJar( $cookieJar ) {
		$this->cookieJar = $cookieJar;
	}

	public function getCookieJar() {
		return $this->cookieJar;
	}

	public function setPassword( $password ) {
		if ( !strlen( $password ) ) {
			throw new Exception ( 'Invalid password' );
		}
		$this->password = $password;
	}

	public function getPassword() {
		return $this->password;
	}

	public function setUrl( $url ) {
		if ( !strlen( $url ) ) {
			throw new Exception ( 'Invalid URL' );
		}
		$this->url = $url;
	}

	public function getUrl() {
		return $this->url;
	}

	public function login() {
		// login
		$options = array(
			'postData' => array(
				'action' => 'login',
				'lgname' => $this->getUsername(),
				'lgpassword' => $this->getPassword(),
				'format' => 'json',
			),
			'method' => 'POST',
		);
		$req = MwHttpRequest::factory( $this->getUrl(), $options );
		$status = $req->execute();
		if ( !$status->isGood() ) {
			throw new Exception( 'Remote posting login request failed.' );
		}
		$loginResponse = $req->getContent();
		$loginResponse = json_decode( $loginResponse, true );
		$loginResult = $loginResponse['login']['result'];
		if ( $loginResult == 'NeedToken' ) {
			// fetch cookie jar (session info needed for auth)
			$this->setCookieJar( $req->getCookieJar() );
			$token = $loginResponse['login']['token'];
			$options['postData']['lgtoken'] = $token;
			$req = MwHttpRequest::factory( $this->getUrl(), $options );
			// set cookie jar
			$req->setCookieJar( $this->getCookieJar() );
			$status = $req->execute();
			if ( !$status->isGood() ) {
				throw new Exception( 'Remote posting login failed after token.' );
			}
			$loginResponse = $req->getContent();
			$loginResponse = json_decode( $loginResponse, true );
			$loginResult = $loginResponse['login']['result'];
		}

		if ( $loginResult != 'Success' ) {
			// there's some kind of problem
			throw new Exception( 'Remote posting login failed.' );
		}
		$this->loggedIn = true;
		return true;
	}

	public function getEditToken( $articleName ) {
		// get edit token
		$options = array(
			'postData' => array(
				'action' => 'query',
				'prop' => 'info|revisions',
				'intoken' => 'edit',
				'titles' => $articleName,
				'format' => 'json',
			),
			'method' => 'POST',
		);
		$req = MwHttpRequest::factory( $this->getUrl(), $options );
		$req->setCookieJar( $this->getCookieJar() );
		$status = $req->execute();

		if ( !$status->isGood() ) {
			// make some kind of error?
			throw new Exception( 'Failed fetching edit token.' );
		}
		$response = $req->getContent();
		$response = json_decode( $response, true );
		$pages = $response['query']['pages'];
		$editToken = null;
		foreach ( $pages as $page ) {
			if ( isset( $page['edittoken'] ) ) $editToken = $page['edittoken'];
			if ( !is_null( $editToken ) ) break;
		}
		// what happens if no edit token present?!
		return $editToken;
	}

	public function editArticle( $articleName, $sectionTitle, $text, $section = 'new' ) {
		if ( $this->shouldLogIn() ) {
			if ( !$this->login() ) {
				throw new Exception( 'Login failed.' );
			}
		}

		// edit page
		$options = array(
			'postData' => array(
				'action' => 'edit',
				'title' => $articleName,
				'section' => $section,
				'sectiontitle' => $sectionTitle, // change to be subject of form submit
				'text' => $text, // change to be message of form submit + incl UA (See old post method)
				'token' => $this->getEditToken( $articleName ),
				'bot' => true,
				'md5' => md5( $text ),
				'format' => 'json',
				// use timestamp options?
			),
			'method' => 'POST',
		);
		$req = MwHttpRequest::factory( $this->getUrl(), $options );
		$req->setCookieJar( $this->getCookieJar() );
		$status = $req->execute();
		if ( !$status->isGood() ) {
			return false;
		}
		$req->getContent();
		return true;
	}

	public function shouldLogIn() {
		if ( !$this->loggedIn && isset( $this->username ) && isset( $this->password ) ) {
			return true;
		}
		return false;
	}
}

/**
 * Overloads HTMLForm so we can render the form in divs rather than as a table
 * as well as extend support for our custom textarea field.
 *
 * Note that __construct() and loadInputFromParameters() are reimplemented here
 * verbatim. This is because PHP is dumb and handles static methods/properties
 * very poorly and we cannot rely on late static bindings because of our
 * PHP 5.2 compatibility requirement.
 * @see HTMLTextAreaMobileField
 */
class HTMLFormMobile extends HTMLForm {
	// A mapping of 'type' inputs onto standard HTMLFormField subclasses
	static $typeMappings = array(
		'text' => 'HTMLTextField',
		'textarea' => 'HTMLTextAreaField',
		'select' => 'HTMLSelectField',
		'radio' => 'HTMLRadioField',
		'multiselect' => 'HTMLMultiSelectField',
		'check' => 'HTMLCheckField',
		'toggle' => 'HTMLCheckField',
		'int' => 'HTMLIntField',
		'float' => 'HTMLFloatField',
		'info' => 'HTMLInfoField',
		'selectorother' => 'HTMLSelectOrOtherField',
		'selectandother' => 'HTMLSelectAndOtherField',
		'submit' => 'HTMLSubmitField',
		'hidden' => 'HTMLHiddenField',
		'edittools' => 'HTMLEditTools',

		// HTMLTextField will output the correct type="" attribute automagically.
		// There are about four zillion other HTML5 input types, like url, but
		// we don't use those at the moment, so no point in adding all of them.
		'email' => 'HTMLTextField',
		'password' => 'HTMLTextField',

		// Custom fields which will support divs rather than table rows
		'textareadiv' => 'HTMLTextAreaFieldDiv',
		'textdiv' => 'HTMLTextFieldDiv',
		'hiddendiv' => 'HTMLHiddenFieldDiv',
	);

	protected $displayFormat = 'table';
	protected $availableDisplayFormats = array(
		'table',
		'div',
		'raw',
	);

	/**
	 * Build a new HTMLForm from an array of field attributes
	 * @param $descriptor Array of Field constructs, as described above
	 * @param $context IContextSource available since 1.18, will become compulsory in 1.18.
	 *     Obviates the need to call $form->setTitle()
	 * @param $messagePrefix String a prefix to go in front of default messages
	 */
	public function __construct( $descriptor, /*IContextSource*/ $context = null, $messagePrefix = '' ) {
		if ( $context instanceof IContextSource ) {
			$this->setContext( $context );
			$this->mTitle = false; // We don't need them to set a title
			$this->mMessagePrefix = $messagePrefix;
		} else {
			// B/C since 1.18
			if ( is_string( $context ) && $messagePrefix === '' ) {
				// it's actually $messagePrefix
				$this->mMessagePrefix = $context;
			}
		}

		// Expand out into a tree.
		$loadedDescriptor = array();
		$this->mFlatFields = array();

		foreach ( $descriptor as $fieldname => $info ) {
			$section = isset( $info['section'] )
				? $info['section']
				: '';

			if ( isset( $info['type'] ) && $info['type'] == 'file' ) {
				$this->mUseMultipart = true;
			}

			$field = self::loadInputFromParameters( $fieldname, $info );
			$field->mParent = $this;

			$setSection =& $loadedDescriptor;
			if ( $section ) {
				$sectionParts = explode( '/', $section );

				while ( count( $sectionParts ) ) {
					$newName = array_shift( $sectionParts );

					if ( !isset( $setSection[$newName] ) ) {
						$setSection[$newName] = array();
					}

					$setSection =& $setSection[$newName];
				}
			}

			$setSection[$fieldname] = $field;
			$this->mFlatFields[$fieldname] = $field;
		}

		$this->mFieldTree = $loadedDescriptor;
	}

	public function setDisplayFormat( $format ) {
		if ( !in_array( $format, $this->availableDisplayFormats ) ) {
			throw new Exception ( 'Display format must be one of ' . print_r( $this->availableDisplayFormats, true ) );
		}
		$this->displayFormat = $format;
	}

	public function getDisplayFormat() {
		return $this->displayFormat;
	}

	/**
	 * TODO: Document
	 * @param $fields array[]|HTMLFormField[] array of fields (either arrays or objects)
	 * @param $sectionName string ID attribute of the <table> tag for this section, ignored if empty
	 * @param $fieldsetIDPrefix string ID prefix for the <fieldset> tag of each subsection, ignored if empty
	 * @return String
	 */
	public function displaySection( $fields, $sectionName = '', $fieldsetIDPrefix = '' ) {
		$displayFormat = $this->getDisplayFormat();
		switch ( $displayFormat ) {
			case 'table':
				return $this->displaySectionTable( $fields, $sectionName, $fieldsetIDPrefix );
			case 'div':
				return $this->displaySectionDiv( $fields, $sectionName, $fieldsetIDPrefix );
			case 'raw':
				return $this->displaySectionRaw( $fields, $sectionName, $fieldsetIDPrefix );
		}

		return '';
	}

	protected function displaySectionRaw( $fields, $sectionName, $fieldsetIDPrefix ) {
		$rawHtml = '';
		$subsectionHtml = '';
		$hasLeftColumn = false;

		foreach ( $fields as $key => $value ) {
			if ( is_object( $value ) ) {

				$v = empty( $value->mParams['nodata'] )
					? $this->mFieldData[$key]
					: $value->getDefault();
				$rawHtml .= $value->getRaw( $v );

				if ( $value->getLabel() != '&#160;' ) {
					$hasLeftColumn = true;
				}
			} elseif ( is_array( $value ) ) {
				$section = $this->displaySection( $value, $key );
				$legend = $this->getLegend( $key );
				if ( isset( $this->mSectionHeaders[$key] ) ) {
					$section = $this->mSectionHeaders[$key] . $section;
				}
				if ( isset( $this->mSectionFooters[$key] ) ) {
					$section .= $this->mSectionFooters[$key];
				}
				$attributes = array();
				if ( $fieldsetIDPrefix ) {
					$attributes['id'] = Sanitizer::escapeId( "$fieldsetIDPrefix$key" );
				}
				$subsectionHtml .= Xml::fieldset( $legend, $section, $attributes ) . "\n";
			}
		}

		$classes = array();

		if ( !$hasLeftColumn ) { // Avoid strange spacing when no labels exist
			$classes[] = 'mw-htmlform-nolabel';
		}

		$attribs = array(
			'class' => implode( ' ', $classes ),
		);

		if ( $sectionName ) {
			$attribs['id'] = Sanitizer::escapeId( "mw-htmlform-$sectionName" );
		}

		if ( $this->mSubSectionBeforeFields ) {
			return $subsectionHtml . "\n" . $rawHtml;
		} else {
			return $rawHtml . "\n" . $subsectionHtml;
		}
	}

	protected function displaySectionTable( $fields, $sectionName, $fieldsetIDPrefix ) {
		return parent::displaySection( $fields, $sectionName, $fieldsetIDPrefix );
	}

	protected function displaySectionDiv( $fields, $sectionName = '', $fieldsetIDPrefix = '' ) {
		$divHtml = '';
		$subsectionHtml = '';
		$hasLeftColumn = false;

		foreach ( $fields as $key => $value ) {
			if ( is_object( $value ) ) {

				$v = empty( $value->mParams['nodata'] )
					? $this->mFieldData[$key]
					: $value->getDefault();
				$divHtml .= $value->getDiv( $v );

				if ( $value->getLabel() != '&#160;' ) {
					$hasLeftColumn = true;
				}
			} elseif ( is_array( $value ) ) {
				$section = $this->displaySection( $value, $key );
				$legend = $this->getLegend( $key );
				if ( isset( $this->mSectionHeaders[$key] ) ) {
					$section = $this->mSectionHeaders[$key] . $section;
				}
				if ( isset( $this->mSectionFooters[$key] ) ) {
					$section .= $this->mSectionFooters[$key];
				}
				$attributes = array();
				if ( $fieldsetIDPrefix ) {
					$attributes['id'] = Sanitizer::escapeId( "$fieldsetIDPrefix$key" );
				}
				$subsectionHtml .= Xml::fieldset( $legend, $section, $attributes ) . "\n";
			}
		}

		$classes = array();

		if ( !$hasLeftColumn ) { // Avoid strange spacing when no labels exist
			$classes[] = 'mw-htmlform-nolabel';
		}

		$attribs = array(
			'class' => implode( ' ', $classes ),
		);

		if ( $sectionName ) {
			$attribs['id'] = Sanitizer::escapeId( "mw-htmlform-$sectionName" );
		}

		$divHtml = HTML::rawElement( 'div', $attribs, "\n$divHtml\n" );

		if ( $this->mSubSectionBeforeFields ) {
			return $subsectionHtml . "\n" . $divHtml;
		} else {
			return $divHtml . "\n" . $subsectionHtml;
		}
	}

	/**
	 * Initialise a new Object for the field
	 * @param $fieldname string
	 * @param $descriptor string input Descriptor, as described above
	 * @throws MWException
	 * @return HTMLFormField subclass
	 */
	static function loadInputFromParameters( $fieldname, $descriptor ) {
		if ( isset( $descriptor['class'] ) ) {
			$class = $descriptor['class'];
		} elseif ( isset( $descriptor['type'] ) ) {
			$class = self::$typeMappings[$descriptor['type']];
			$descriptor['class'] = $class;
		} else {
			$class = null;
		}

		if ( !$class ) {
			throw new MWException( "Descriptor with no class: " . print_r( $descriptor, true ) );
		}

		$descriptor['fieldname'] = $fieldname;

		# TODO
		# This will throw a fatal error whenever someone try to use
		# 'class' to feed a CSS class instead of 'cssclass'. Would be
		# great to avoid the fatal error and show a nice error.
		$obj = new $class( $descriptor );

		return $obj;
	}

	/**
	 * Return nothing for the error message stack.
	 *
	 * Overloads parent::getErrors() because we don't want to display the
	 * error stack - just validation errors above the message fields.
	 *
	 * @see parent::getErrors()
	 * @param $errors String|Array|Status
	 * @return String
	 */
	function getErrors( $errors ) {
		return '';
	}

}

/**
 * Overloads HTMLTextAreaField::getInputHTML() so we can use the 'placeholder'
 * property until 'placeholder' support is merged into core.
 *
 * Also supports returning field in a div rather than table elements.
 */
class HTMLTextAreaFieldDiv extends HTMLTextAreaField {
	function getInputHTML( $value ) {
		$attribs = array(
			'id' => $this->mID,
			'name' => $this->mName,
			'cols' => $this->getCols(),
			'rows' => $this->getRows(),
		) + $this->getTooltipAndAccessKey();

		if ( $this->mClass !== '' ) {
			$attribs['class'] = $this->mClass;
		}

		if ( !empty( $this->mParams['disabled'] ) ) {
			$attribs['disabled'] = 'disabled';
		}

		if ( !empty( $this->mParams['readonly'] ) ) {
			$attribs['readonly'] = 'readonly';
		}

		if ( !empty( $this->mParams['placeholder'] ) ) {
			$attribs['placeholder'] = $this->mParams['placeholder'];
		}

		foreach ( array( 'required', 'autofocus' ) as $param ) {
			if ( isset( $this->mParams[$param] ) ) {
				$attribs[$param] = '';
			}
		}

		return Html::element( 'textarea', $attribs, $value );
	}

	public function getDiv( $value ) {
		return HTMLFormFieldDiv::getDiv( $value, $this );
	}

	public function getRaw( $value ) {
		return HTMLFormFieldDiv::getRaw( $value, $this );
	}

	public function getMClass() {
		return $this->mClass;
	}
}

/**
 * Overloads HTMLTextField to support returning field in a div rather than
 * table elements.
 */
class HTMLTextFieldDiv extends HTMLTextField {
	public function getDiv( $value ) {
		return HTMLFormFieldDiv::getDiv( $value, $this );
	}

	public function getRaw( $value ) {
		return HTMLFormFieldDiv::getRaw( $value, $this );
	}

	public function getMClass() {
		return $this->mClass;
	}
}

/**
 * Overloads HTMLHiddenField to support returning field in a div rather than
 * table elements.
 */
class HTMLHiddenFieldDiv extends HTMLHiddenField {
	public function getDiv( $value ) {
		parent::getTableRow( $value, $this );
	}

	public function getRaw( $value ) {
		parent::getTableRow( $value, $this );
	}

	public function getMClass() {
		return $this->mClass;
	}
}

/**
 * Helper class to do some voodoo to support HTMLForm returning divs rather
 * than table elements
 */
class HTMLFormFieldDiv {
	public static function getRaw( $value, $valueObj ) {
		# Check for invalid data.
		$html = '';
		$errors = $valueObj->validate( $value, $valueObj->mParent->mFieldData );

		$cellAttributes = array();

		if ( $errors === true || ( !$valueObj->mParent->getRequest()->wasPosted() && ( $valueObj->mParent->getMethod() == 'post' ) ) ) {
			$errors = '';
		} else {
			$errors = self::formatErrors( $errors );
		}

		$label = $valueObj->getLabelHtml( $cellAttributes );
		$field = $valueObj->getInputHTML( $value );

		$html .= "\n$errors";
		$html .= $label;
		$html .= $field;

		$helptext = null;

		if ( isset( $valueObj->mParams['help-message'] ) ) {
			$valueObj->mParams['help-messages'] = array( $valueObj->mParams['help-message'] );
		}

		if ( isset( $valueObj->mParams['help-messages'] ) ) {
			foreach ( $valueObj->mParams['help-messages'] as $name ) {
				$helpMessage = (array)$name;
				$msg = wfMessage( array_shift( $helpMessage ), $helpMessage );

				if ( $msg->exists() ) {
					$helptext .= $msg->parse(); // Append message
				}
			}
		}
		elseif ( isset( $valueObj->mParams['help'] ) ) {
			$helptext = $valueObj->mParams['help'];
		}

		if ( !is_null( $helptext ) ) {
			$row = Html::rawElement(
				'div',
				array( 'colspan' => 2, 'class' => 'htmlform-tip' ),
				$helptext
			);
			$row = Html::rawElement( 'div', array(), $row );
			$html .= "$row\n";
		}

		return $html;
	}

	public static function getDiv( $value, $valueObj ) {
		# Check for invalid data.
		$errors = $valueObj->validate( $value, $valueObj->mParent->mFieldData );

		$cellAttributes = array();
		$verticalLabel = false;

		if ( $errors === true || ( !$valueObj->mParent->getRequest()->wasPosted() && ( $valueObj->mParent->getMethod() == 'post' ) ) ) {
			$errors = '';
			$errorClass = '';
		} else {
			$errors = self::formatErrors( $errors );
			$errorClass = 'mw-htmlform-invalid-input';
		}

		$label = $valueObj->getLabelHtml( $cellAttributes );
		$field = Html::rawElement(
			'div',
			array( 'class' => 'mw-input' ) + $cellAttributes,
			$valueObj->getInputHTML( $value ) . "\n$errors"
		);

		$fieldType = get_class( $valueObj );

		if ( $verticalLabel ) {
			$html = Html::rawElement( 'div',
				array( 'class' => 'mw-htmlform-vertical-label' ), $label );
			$html .= Html::rawElement( 'div',
				array( 'class' => "mw-htmlform-field-$fieldType {$valueObj->getMClass()} $errorClass" ),
				$field );
		} else {
			$html = Html::rawElement( 'div',
				array( 'class' => "mw-htmlform-field-$fieldType {$valueObj->getMClass()} $errorClass" ),
				$label . $field );
		}

		$helptext = null;

		if ( isset( $valueObj->mParams['help-message'] ) ) {
			$valueObj->mParams['help-messages'] = array( $valueObj->mParams['help-message'] );
		}

		if ( isset( $valueObj->mParams['help-messages'] ) ) {
			foreach ( $valueObj->mParams['help-messages'] as $name ) {
				$helpMessage = (array)$name;
				$msg = wfMessage( array_shift( $helpMessage ), $helpMessage );

				if ( $msg->exists() ) {
					$helptext .= $msg->parse(); // Append message
				}
			}
		}
		elseif ( isset( $valueObj->mParams['help'] ) ) {
			$helptext = $valueObj->mParams['help'];
		}

		if ( !is_null( $helptext ) ) {
			$row = Html::rawElement(
				'div',
				array( 'colspan' => 2, 'class' => 'htmlform-tip' ),
				$helptext
			);
			$row = Html::rawElement( 'div', array(), $row );
			$html .= "$row\n";
		}

		return $html;
	}

	/**
	 * Formats one or more errors as accepted by field validation-callback.
	 * @param $errors String|Message|Array of strings or Message instances
	 * @return String html
	 * @see HTMLFormField::formatErrors()
	 */
	public static function formatErrors( $errors ) {
		if ( is_array( $errors ) && count( $errors ) === 1 ) {
			$errors = array_shift( $errors );
		}

		if ( is_array( $errors ) ) {
			$lines = array();
			foreach ( $errors as $error ) {
				if ( $error instanceof Message ) {
					$lines[] = Html::rawElement( 'li', array(), $error->parse() );
				} else {
					$lines[] = Html::rawElement( 'li', array(), $error );
				}
			}
			return Html::rawElement( 'ul', array( 'class' => 'error' ), implode( "\n", $lines ) );
		} else {
			if ( $errors instanceof Message ) {
				$errors = $errors->parse();
			}
			return Html::rawElement( 'span', array( 'class' => 'error' ), $errors );
		}
	}
}
