<?php
/**
 * SpecialNearby.php
 */

/**
 * Provide the Special page "Nearby" with location based articles
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
	 * @param {String} $key valid key as specified in validTabs
	 * @return {HtmlForm}
	 */
	public function getPreferencesForm( $key ) {
		$prefs = array();
		$user = $this->getUser();
		$ctx = $this->getContext();
		switch ( $key ) {
			case 'personal':
				Preferences::profilePreferences( $user, $ctx, $prefs );
				break;
			case 'skin':
				Preferences::skinPreferences( $user, $ctx, $prefs );
				break;
			case 'dateformat':
				Preferences::datetimePreferences( $user, $ctx, $prefs );
				break;
			case 'files':
				Preferences::filesPreferences( $user, $ctx, $prefs );
				break;
			case 'rc':
				Preferences::rcPreferences( $user, $ctx, $prefs );
				break;
		}

		Preferences::loadPreferenceValues( $user, $ctx, $prefs );
		$htmlForm = new PreferencesForm( $prefs, $ctx, 'prefs' );
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
			$out->wrapWikiMsg(
				"<div class=\"alert successbox\">$1</div>",
				'savedprefs'
			);
		}

		if ( $par && in_array( $par, $this->validTabs ) ) {
			$htmlForm = $this->getPreferencesForm( $par );
			$htmlForm->setSubmitCallback( array( 'Preferences', 'tryUISubmit' ) );
			$htmlForm->show();
		} else {
			foreach ( $this->validTabs as $tabName ) {
				$attrs = array(
					'class' => $baseClass = MobileUI::buttonClass( 'block' ),
					'href' => SpecialPage::getTitleFor( $this->getName(), $tabName )->getLocalUrl(),
				);
				$button = Html::element( 'a', $attrs, $this->msg( "prefs-$tabName" ) );
				$out->addHtml( $button );
			}
		}
	}
}
