<?php
/**
 * Overrides Special:Preferences in mobile mode.
 */
class SpecialMobilePreferences extends SpecialPreferences {

	protected $validTabs = array(
		'personal',
		'dateformat',
		'skin',
		'files',
		'rc',
	);

	/**
	 * Builds the preferences form for the given section.
	 *
	 * @param string $key A valid section key, which can be rendered
	 * @return PreferencesForm
	 */
	public function getPreferencesForm( $key ) {
		$prefs = array();
		$user = $this->getUser();
		$ctx = $this->getContext();

		// load any preferences element
		$removePrefs = Preferences::getPreferences( $user, $ctx );
		// check, if the element shouldn't be rendered
		foreach ( $removePrefs as $formElement => $formDescriptor ) {
			if (
				// we render only preferences, which are in a specific section, ...
				isset( $formDescriptor['section'] ) &&
				(
					// ...which is specified by the given $key
					$formDescriptor['section'] === $key ||
					strpos( $formDescriptor['section'], $key ) !== false
				)
			) {
				// remove the preferences element from the array of elements, which are removed
				unset( $removePrefs[$formElement] );
			}
		}
		// we need the keys only
		$removePrefs = array_keys( $removePrefs );

		// get the form element (the $removePrefs param specifies, which elements shouldn't be rendered)
		$htmlForm = Preferences::getFormObject( $user, $ctx, 'PreferencesForm', $removePrefs );
		$htmlForm->suppressReset();
		$htmlForm->setModifiedUser( $user );
		$htmlForm->setId( 'mw-prefs-form' );
		$htmlForm->setSubmitText( $ctx->msg( 'saveprefs' )->text() );
		$htmlForm->setSubmitCallback( array( 'Preferences', 'tryUISubmit' ) );
		$htmlForm->setAction( SpecialPage::getTitleFor( $this->getName(), $key )->getLocalUrl() );
		return $htmlForm;
	}

	public function execute( $par = '' ) {
		$this->setHeaders();
		$this->outputHeader();
		$out = $this->getOutput();
		$out->disallowUserJs(); # Prevent hijacked user scripts from sniffing passwords etc.
		$this->requireLogin( 'prefsnologintext2' );
		$this->checkReadOnly();

		if ( $this->getRequest()->getCheck( 'success' ) ) {
			$out->addHtml( MobileUI::successBox( $this->msg( 'savedprefs' )->escaped() ) );
		}

		// combine our valid tabs array with all available tabs on the preferences form
		$form = Preferences::getFormObject( $this->getUser(), $this->getContext() );
		$validForRendering = $this->validTabs + $form->getPreferenceSections();

		// if the requested tab can be rendered, render it, no matter, if it's visible on
		// the main entry point (Special:MobilePreferences)
		if ( $par && in_array( $par, $validForRendering ) ) {
			$htmlForm = $this->getPreferencesForm( $par );
			$htmlForm->setSubmitCallback( array( 'Preferences', 'tryUISubmit' ) );
			$htmlForm->show();
		} else {
			foreach ( $this->validTabs as $tabName ) {
				// hidden tabs allow a user to navigate to the section of the preferences page,
				// but shouldn't be visible on the main entry point (Special:Preferences)
				$attrs = array(
					'class' => $baseClass = MobileUI::buttonClass( 'block' ),
					'href' => SpecialPage::getTitleFor( $this->getName(), $tabName )->getLocalUrl(),
				);
				$button = Html::element( 'a', $attrs, $this->msg( "prefs-$tabName" ) );
				$out->addHtml( $button );
			}
		}
	}

	public function getSubpagesForPrefixSearch() {
		return $this->validTabs;
	}
}
