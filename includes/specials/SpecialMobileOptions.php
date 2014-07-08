<?php
/**
 * SpecialMobileOptions.php
 */

/**
 * Adds a special page with mobile specific preferences
 */
class SpecialMobileOptions extends MobileSpecialPage {
	/** @var Title The title of page to return to after save */
	private $returnToTitle;
	/** @var boolean $hasDesktopVersion Whether this special page has a desktop version or not */
	protected $hasDesktopVersion = true;
	/** @var array $options Array of options */
	private $options = array(
		'Language' => array( 'get' => 'chooseLanguage' ),
	);
	/** @var boolean Whether the special page's content should be wrapped in div.content */
	protected $unstyledContent = false;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'MobileOptions' );
	}

	/**
	 * Render the special page
	 * @param string|null $par Parameter submitted as subpage
	 */
	public function execute( $par = '' ) {
		parent::execute( $par );
		$context = MobileContext::singleton();

		wfIncrStats( 'mobile.options.views' );
		$this->returnToTitle = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( !$this->returnToTitle ) {
			$this->returnToTitle = Title::newMainPage();
		}

		$this->setHeaders();
		$context->setForceMobileView( true );
		$context->setContentTransformations( false );
		if ( isset( $this->options[$par] ) ) {
			$option = $this->options[$par];

			if ( $this->getRequest()->wasPosted() && isset( $option['post'] ) ) {
				$func = $option['post'];
			} else {
				$func = $option['get'];
			}
			$this->$func();
		} else {
			if ( $this->getRequest()->wasPosted() ) {
				$this->submitSettingsForm();
			} else {
				$this->getSettingsForm();
			}
		}
	}

	/**
	 * Render the settings form (with actual set settings) to display to user
	 */
	private function getSettingsForm() {
		$out = $this->getOutput();
		$context = MobileContext::singleton();
		$user = $this->getUser();

		$out->setPageTitle( $this->msg( 'mobile-frontend-main-menu-settings-heading' ) );

		if ( $this->getRequest()->getCheck( 'success' ) ) {
			$out->wrapWikiMsg(
				"<div class=\"successbox\"><strong>\n$1\n</strong></div><div id=\"mw-pref-clear\"></div>",
				'savedprefs'
			);
		}

		$betaEnabled = $context->isBetaGroupMember();
		$alphaEnabled = $context->isAlphaGroupMember();

		$imagesChecked = $context->imagesDisabled() ? '' : 'checked'; // images are off when disabled
		$imagesBeta = $betaEnabled ? 'checked' : '';
		$disableMsg = $this->msg( 'mobile-frontend-images-status' )->parse();
		$betaEnableMsg = $this->msg( 'mobile-frontend-settings-beta' )->parse();
		$betaDescriptionMsg = $this->msg( 'mobile-frontend-opt-in-explain' )->parse();

		$saveSettings = $this->msg( 'mobile-frontend-save-settings' )->escaped();
		$onoff = '<span class="mw-mf-settings-on">' .
			$this->msg( 'mobile-frontend-on' )->escaped() .
			'</span><span class="mw-mf-settings-off">' .
			$this->msg( 'mobile-frontend-off' )->escaped() .
			'</span>';
		$action = $this->getPageTitle()->getLocalURL();
		$html = Html::openElement( 'form',
			array( 'class' => 'mw-mf-settings', 'method' => 'POST', 'action' => $action )
		);
		$aboutMessage = $this->msg( 'mobile-frontend-settings-description' )->parse();
		$token = $user->isLoggedIn() ? Html::hidden( 'token', $user->getEditToken() ) : '';
		$returnto = Html::hidden( 'returnto', $this->returnToTitle->getFullText() );

		$alphaEnableMsg = wfMessage( 'mobile-frontend-settings-alpha' )->parse();
		$alphaChecked = $alphaEnabled ? 'checked' : '';
		$alphaDescriptionMsg = wfMessage( 'mobile-frontend-settings-alpha-description' )->text();

		$betaSetting = <<<HTML
	<li>
		<div class="option-name">
			{$betaEnableMsg}
			<div class="mw-mf-checkbox-css3" id="enable-beta-toggle">
				<input type="checkbox" name="enableBeta"
				{$imagesBeta}>{$onoff}
			</div>
		</div>
		<div class="option-description">
				{$betaDescriptionMsg}
		</div>
	</li>
HTML;
		$alphaSetting = '';
		if ( $betaEnabled ) {

			if ( $alphaEnabled ) {
				$betaSetting = '<input type="hidden" name="enableBeta" value="checked">';
			}

			$alphaSetting .= <<<HTML
		<li>
			<div class="option-name">
				{$alphaEnableMsg}
				<div class="mw-mf-checkbox-css3" id="enable-alpha-toggle">
					<input type="checkbox" name="enableAlpha"
					{$alphaChecked}>{$onoff}
				</div>
			</div>
			<div class="option-description">
					{$alphaDescriptionMsg}
			</div>
		</li>
HTML;
		}

		// @codingStandardsIgnoreStart Long line
		$html .= <<<HTML
	<p>
		{$aboutMessage}
	</p>
	<ul>
		<li>
			<div class="option-name">
			{$disableMsg}
			<span class="mw-mf-checkbox-css3" id="enable-images-toggle">
				<input type="checkbox" name="enableImages"
				{$imagesChecked}>{$onoff}
			</span>
			</div>
		</li>
		{$betaSetting}
		{$alphaSetting}
		<li>
			<input type="submit" class="mw-ui-constructive mw-ui-button" id="mw-mf-settings-save" value="{$saveSettings}">
		</li>
	</ul>
	$token
	$returnto
</form>
HTML;
		// @codingStandardsIgnoreEnd
		$out->addHTML( $html );
	}

	/**
	 * Get a list of languages available for this project
	 * @return string parsed Html
	 */
	private function getSiteSelector() {
		global $wgLanguageCode;

		wfProfileIn( __METHOD__ );
		$selector = '';
		$count = 0;
		$language = $this->getLanguage();
		foreach ( Interwiki::getAllPrefixes( true ) as $interwiki ) {
			$code = $interwiki['iw_prefix'];
			$name = $language->fetchLanguageName( $code );
			if ( !$name ) {
				continue;
			}
			$title = Title::newFromText( "$code:" );
			if ( $title ) {
				$url = $title->getFullURL();
			} else {
				$url = '';
			}
			$attrs = array( 'href' => $url );
			$count++;
			if( $code == $wgLanguageCode ) {
				$attrs['class'] = 'selected';
			}
			$selector .= Html::openElement( 'li' );
			$selector .= Html::element( 'a', $attrs, $name );
			$selector .= Html::closeElement( 'li' );
		}

		if ( $selector && $count > 1 ) {
			$selector = <<<HTML
			<p>{$this->msg( 'mobile-frontend-settings-site-description', $count )->parse()}</p>
			<ul id='mw-mf-language-list'>
				{$selector}
			</ul>
HTML;
		}
		wfProfileOut( __METHOD__ );
		return $selector;
	}

	/**
	 * Render the language selector special page
	 */
	private function chooseLanguage() {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'mobile-frontend-settings-site-header' )->escaped() );
		$out->addHTML( $this->getSiteSelector() );
	}

	/**
	 * Saves the settings submitted by the settings form. Redirects the user to the destination
	 * of returnto or, if not set, back to this special page
	 */
	private function submitSettingsForm() {
		$schema = 'MobileOptionsTracking';
		$schemaRevision = 8101982;
		$schemaData = array(
			'action' => 'success',
			'images' => "nochange",
			'beta' => "nochange",
			'alpha' => "nochange",
		);
		$context = MobileContext::singleton();
		$request = $this->getRequest();
		$user = $this->getUser();

		if ( $user->isLoggedIn() && !$user->matchEditToken( $request->getVal( 'token' ) ) ) {
			wfIncrStats( 'mobile.options.errors' );
			wfDebugLog( 'mobile', __METHOD__ . "(): token mismatch, expected {$user->getEditToken()}, "
				. "got {$request->getVal( 'token' )}" );
			$this->getOutput()->addHTML( '<div class="error">'
				. $this->msg( "mobile-frontend-save-error" )->parse()
				. '</div>'
			);
			$schemaData['action'] = 'error';
			$schemaData['errorText'] = $errorText;
			ExtMobileFrontend::eventLog( $schema, $schemaRevision, $schemaData );
			$this->getSettingsForm();
			return;
		}
		wfIncrStats( 'mobile.options.saves' );
		if ( $request->getBool( 'enableAlpha' ) ) {
			$group = 'alpha';
			// This request is to turn on alpha
			if ( !$context->isAlphaGroupMember() ) {
				$schemaData['alpha'] = "on";
			}
		} elseif ( $request->getBool( 'enableBeta' ) ) {
			$group = 'beta';
			if ( $context->isAlphaGroupMember() ) {
				// This request was to turn off alpha
				$schemaData['alpha'] = "off";
			} elseif ( !$context->isBetaGroupMember() ) {
				// The request was to turn on beta
				$schemaData['beta'] = "on";
			}
		} else {
			$group = '';
			if ( $context->isBetaGroupMember() ) {
				// beta was turned off
				$schemaData['beta'] = "off";
			}
		}
		$context->setMobileMode( $group );
		$imagesDisabled = !$request->getBool( 'enableImages' );
		if ( $context->imagesDisabled() !== $imagesDisabled ) {
			// Only record when the state has changed
			$schemaData['images'] = $imagesDisabled ? "off" : "on";
		}
		$context->setDisableImagesCookie( $imagesDisabled );

		$returnToTitle = Title::newFromText( $request->getText( 'returnto' ) );
		if ( $returnToTitle ) {
			$url = $returnToTitle->getFullURL();
		} else {
			$url = $this->getPageTitle()->getFullURL( 'success' );
		}
		ExtMobileFrontend::eventLog( $schema, $schemaRevision, $schemaData );
		$context->getOutput()->redirect( MobileContext::singleton()->getMobileUrl( $url ) );
	}

	/**
	 * Get the URL of this special page
	 * @param string|null $option Subpage string, or false to not use a subpage
	 * @param Title $returnTo Destination to returnto after successfully action on the page returned
	 * @param boolean $fullUrl Whether to get the local url, or the full url
	 *
	 * @return string
	 */
	public static function getURL( $option, Title $returnTo = null, $fullUrl = false ) {
		$t = SpecialPage::getTitleFor( 'MobileOptions', $option );
		$params = array();
		if ( $returnTo ) {
			$params['returnto'] = $returnTo->getPrefixedText();
		}
		if ( $fullUrl ) {
			return MobileContext::singleton()->getMobileUrl( $t->getFullURL( $params ) );
		} else {
			return $t->getLocalURL( $params );
		}
	}
}
