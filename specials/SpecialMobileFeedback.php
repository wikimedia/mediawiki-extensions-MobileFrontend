<?php

class SpecialMobileFeedback extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileFeedback' );
	}

	public function execute( $par = '' ) {
		global $wgExtMobileFrontend;

		$this->setHeaders();
		$this->getOutput()->setPageTitle( $this->msg( 'mobile-frontend-leave-feedback-special-title' ) );
		$wgExtMobileFrontend->setForceMobileView( true );
		$wgExtMobileFrontend->setContentTransformations( false );

		if ( $par == 'thanks' ) {
			$this->showThanks();
		} else {
			$this->getFeedbackHtml();
		}
	}

	protected function getFeedbackHtml() {
		$feedbackArticlePersonalLink = $this->msg( 'mobile-frontend-leave-feedback-article-personal-link' );
		$feedbackArticleFactualLink = $this->msg( 'mobile-frontend-leave-feedback-article-factual-link' );
		$feedbackArticleOtherLink = $this->msg( 'mobile-frontend-leave-feedback-article-other-link' );

		$form = new HTMLFormMobile( $this->getForm(), $this );
		$form->setDisplayFormat( 'raw' );
		$form->setTitle( $this->getTitle() );
		$form->setId( 'mf-feedback-form' );
		$form->setSubmitText( $this->msg( 'mobile-frontend-leave-feedback-submit' )->text() );
		$form->setSubmitCallback( array( $this, 'postFeedback' ) );
		$form->setAction( $this->getRequest()->getRequestURL() . "#mf-feedback-form" );
		$html = <<<HTML
		<div class='feedback'>
		<h2 class="section_heading" id="section_1">Technical Problem</h2>
		<div class="content_block" id="content_1">
HTML;
		$this->getOutput()->addHtml( $html );
		$form->show();
		$html = <<<HTML
		</div>
		<h2 class="section_heading" id="section_3">Article Feedback</h2>
		<div class="content_block" id="content_3">
			<ul>
				<li>
					<a href="{$feedbackArticlePersonalLink}">Regarding me, a person or a company I represent</a>
				</li>
				<li>
					<a href="{$feedbackArticleFactualLink}">Regarding a factual error</a>
				</li>
				<li>
					<a href="{$feedbackArticleOtherLink}">Regarding another problem</a>
				</li>
			</ul>
		</div>
		</div>
HTML;
		$this->getOutput()->addHtml( $html );
	}

	private function getForm() {
		return array(
			'returnto' => array(
				'type' => 'hiddendiv',
				'default' => $this->getRequest()->getText( 'returnto', '' ),
			),
			'subject' => array(
				'type' => 'textdiv',
				'maxlength' => 60,
				'validation-callback' => array( $this, 'validateSubject' ),
				'placeholder' => 'Message subject',
			),
			'message' => array(
				'type' => 'textareadiv',
				'rows' => 5,
				'cols' => 60,
				'validation-callback' => array( $this, 'validateMessage' ),
				'placeholder' => 'Type your comment here',
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

	public function validateSubject( $textfield ) {
		if ( mb_strlen( trim( $textfield ) ) < 4 ) {
			return $this->msg( 'mobile-frontend-feedback-no-subject-field' );
		}
		return true;
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
				break;
			case 'div':
				return $this->displaySectionDiv( $fields, $sectionName, $fieldsetIDPrefix );
				break;
			case 'raw':
				return $this->displaySectionRaw( $fields, $sectionName, $fieldsetIDPrefix );
				break;
		}
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
				$rawHtml .= $value->getRaw( $v, $value );

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
				$divHtml .= $value->getDiv( $v, $value );

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

	public function getDiv( $value, $valueObj ) {
		return HTMLFormFieldDiv::getDiv( $value, $valueObj );
	}

	public function getRaw( $value, $valueObj ) {
		return HTMLFormFieldDiv::getRaw( $value, $valueObj );
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
	public function getDiv( $value, $valueObj ) {
		return HTMLFormFieldDiv::getDiv( $value, $valueObj );
	}

	public function getRaw( $value, $valueObj ) {
		return HTMLFormFieldDiv::getRaw( $value, $valueObj );
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
	public function getDiv( $value, $valueObj ) {
		parent::getTableRow( $value, $valueObj );
	}

	public function getRaw( $value, $valueObj ) {
		parent::getTableRow( $value, $valueObj );
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
		$verticalLabel = false;

		if ( $errors === true || ( !$valueObj->mParent->getRequest()->wasPosted() && ( $valueObj->mParent->getMethod() == 'post' ) ) ) {
			$errors = '';
			$errorClass = '';
		} else {
			$errors = self::formatErrors( $errors );
			$errorClass = 'mw-htmlform-invalid-input';
		}

		$label = $valueObj->getLabelHtml( $cellAttributes );
		$field = $valueObj->getInputHTML( $value );

		$fieldType = get_class( $valueObj );

		$html .= "\n$errors";
		$html .= $label;
		$html .= $field;
		/*if ( $verticalLabel ) {
			$html = Html::rawElement( 'div',
				array( 'class' => 'mw-htmlform-vertical-label' ), $label );
			$html .= Html::rawElement( 'div',
				array( 'class' => "mw-htmlform-field-$fieldType {$valueObj->getMClass()} $errorClass" ),
				$field );
			$html = $label;
		} else {
			$html = Html::rawElement( 'div',
				array( 'class' => "mw-htmlform-field-$fieldType {$valueObj->getMClass()} $errorClass" ),
				$label . $field );
		}*/

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
