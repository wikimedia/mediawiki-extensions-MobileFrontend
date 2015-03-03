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
		$imagesDescriptionMsg = $this->msg( 'mobile-frontend-settings-images-explain' )->parse();
		$disableMsg = $this->msg( 'mobile-frontend-images-status' )->parse();
		$betaEnableMsg = $this->msg( 'mobile-frontend-settings-beta' )->parse();
		$betaDescriptionMsg = $this->msg( 'mobile-frontend-opt-in-explain' )->parse();

		$saveSettings = $this->msg( 'mobile-frontend-save-settings' )->escaped();
		$action = $this->getPageTitle()->getLocalURL();
		$html = Html::openElement( 'form',
			array( 'class' => 'mw-mf-settings', 'method' => 'POST', 'action' => $action )
		);
		$token = $user->isLoggedIn() ? Html::hidden( 'token', $user->getEditToken() ) : '';
		$returnto = Html::hidden( 'returnto', $this->returnToTitle->getFullText() );

		$alphaEnableMsg = $this->msg( 'mobile-frontend-settings-alpha' )->parse();
		$alphaChecked = $alphaEnabled ? 'checked' : '';
		$alphaDescriptionMsg = $this->msg( 'mobile-frontend-settings-alpha-description' )->text();

		// array to save the data of options, which should be displayed here
		$options = array();

		// image settings
		$options['images'] = array(
			'checked' => $imagesChecked,
			'label' => $disableMsg,
			'description' => $imagesDescriptionMsg,
			'name' => 'enableImages',
			'id' => 'enable-images-toggle',
		);

		// beta settings
		if ( $this->getMFConfig()->get( 'MFEnableBeta' ) ) {
			$options['beta'] = array(
				'checked' => $imagesBeta,
				'label' => $betaEnableMsg,
				'description' => $betaDescriptionMsg,
				'name' => 'enableBeta',
				'id' => 'enable-beta-toggle',
			);
			// alpha settings
			if ( $betaEnabled ) {
				if ( $alphaEnabled ) {
					$options['beta']['value'] = '1';
					$options['beta']['type'] = 'hidden';
				}
				$options['alpha'] = array(
					'checked' => $alphaChecked,
					'label' => $alphaEnableMsg,
					'description' => $alphaDescriptionMsg,
					'name' => 'enableAlpha',
					'id' => 'enable-alpha-toggle'
				);
			}
		}

		$templateParser = new TemplateParser( __DIR__ . '/../../templates/specials' );
		// @codingStandardsIgnoreStart Long line
		foreach( $options as $key => $data ) {
			if ( isset( $data['type'] ) && $data['type'] === 'hidden' ) {
				$html .= Html::element( 'input',
					array(
						'type' => 'hidden',
						'name' => $data['name'],
						'value' => $data['checked'],
					)
				);
			} else {
				$html .= $templateParser->processTemplate( 'checkbox', $data );
			}
		}
		$className = MobileUI::buttonClass( 'constructive' );
		$html .= <<<HTML
		<input type="submit" class="{$className}" id="mw-mf-settings-save" value="{$saveSettings}">
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
			if ( $code == $this->getConfig()->get( 'LanguageCode' ) ) {
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
