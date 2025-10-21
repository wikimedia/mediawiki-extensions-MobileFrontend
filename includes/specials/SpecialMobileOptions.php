<?php

use MediaWiki\Config\Config;
use MediaWiki\Deferred\DeferredUpdates;
use MediaWiki\Html\Html;
use MediaWiki\MediaWikiServices;
use MediaWiki\Request\WebRequest;
use MediaWiki\SpecialPage\UnlistedSpecialPage;
use MediaWiki\Title\Title;
use MediaWiki\User\Options\UserOptionsManager;
use MobileFrontend\Amc\Manager;
use MobileFrontend\Amc\UserMode;
use MobileFrontend\Features\FeaturesManager;
use Wikimedia\Rdbms\ReadOnlyMode;

/**
 * Adds a special page with mobile specific preferences
 */
class SpecialMobileOptions extends UnlistedSpecialPage {
	/** @var bool Whether this special page has a desktop version or not */
	protected $hasDesktopVersion = true;

	/**
	 * Advanced Mobile Contributions mode
	 */
	private Manager $amc;
	private FeaturesManager $featuresManager;
	private UserMode $userMode;
	private UserOptionsManager $userOptionsManager;
	private ReadOnlyMode $readOnlyMode;
	private MobileContext $mobileContext;
	/** @var Config MobileFrontend's config object */
	protected Config $config;

	public function __construct(
		UserOptionsManager $userOptionsManager,
		ReadOnlyMode $readOnlyMode,
		Config $config
	) {
		parent::__construct( 'MobileOptions' );
		$services = MediaWikiServices::getInstance();
		$this->amc = $services->getService( 'MobileFrontend.AMC.Manager' );
		$this->featuresManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		$this->userMode = $services->getService( 'MobileFrontend.AMC.UserMode' );
		$this->mobileContext = $services->getService( 'MobileFrontend.Context' );
		$this->userOptionsManager = $userOptionsManager;
		$this->readOnlyMode = $readOnlyMode;
		$this->config = $config;
	}

	/**
	 * @return bool
	 */
	public function doesWrites() {
		return true;
	}

	/**
	 * Set the required config for the page.
	 */
	public function setJsConfigVars() {
		$this->getOutput()->addJsConfigVars( [
			'wgMFEnableFontChanger' => $this->featuresManager->isFeatureAvailableForCurrentUser(
				'MFEnableFontChanger'
			),
		] );
	}

	/**
	 * Render the special page
	 * @param string|null $par Parameter submitted as subpage
	 */
	public function execute( $par = '' ) {
		parent::execute( $par );
		$out = $this->getOutput();

		$this->setHeaders();
		$out->addBodyClasses( 'mw-mf-special-page' );
		$out->addModuleStyles( [
			'mobile.special.styles',
			'mobile.special.codex.styles',
			'mobile.special.mobileoptions.styles',
		] );
		$out->addModules( [
			'mobile.special.mobileoptions.scripts',
		] );
		$this->setJsConfigVars();

		$this->mobileContext->setForceMobileView( true );

		if ( $this->getRequest()->wasPosted() ) {
			$this->submitSettingsForm();
		} else {
			$this->addSettingsForm();
		}
	}

	private function buildAMCToggle(): OOUI\FieldLayout {
		$amcToggle = new OOUI\CheckboxInputWidget( [
			'name' => 'enableAMC',
			'infusable' => true,
			'selected' => $this->userMode->isEnabled(),
			'id' => 'enable-amc-toggle',
			'value' => '1',
		] );
		$layout = new OOUI\FieldLayout(
			$amcToggle,
			[
				'label' => new OOUI\LabelWidget( [
					'input' => $amcToggle,
					'label' => new OOUI\HtmlSnippet(
						Html::openElement( 'div' ) .
						Html::rawElement( 'strong', [],
							$this->msg( 'mw-mf-amc-name' )->parse() ) .
						Html::rawElement( 'div', [ 'class' => 'option-description' ],
							$this->msg( 'mw-mf-amc-description' )->parse()
						) .
						Html::closeElement( 'div' )
					)
				] ),
				'id' => 'amc-field',
			]
		);
		// placing links inside a label reduces usability and accessibility so
		// append links to $layout and outside of label instead
		// https://www.w3.org/TR/html52/sec-forms.html#example-42c5e0c5
		$layout->appendContent( new OOUI\HtmlSnippet(
			Html::openElement( 'ul', [ 'class' => 'hlist option-links' ] ) .
			Html::openElement( 'li' ) .
			Html::rawElement(
					'a',
					// phpcs:ignore Generic.Files.LineLength.TooLong
					[ 'href' => 'https://www.mediawiki.org/wiki/Special:MyLanguage/Reading/Web/Advanced_mobile_contributions' ],
					$this->msg( 'mobile-frontend-mobile-option-amc-learn-more' )->parse()
			) .
			Html::closeElement( 'li' ) .
			Html::openElement( 'li' ) .
			Html::rawElement(
					'a',
					// phpcs:ignore Generic.Files.LineLength.TooLong
					[ 'href' => 'https://www.mediawiki.org/wiki/Special:MyLanguage/Talk:Reading/Web/Advanced_mobile_contributions' ],
					$this->msg( 'mobile-frontend-mobile-option-amc-send-feedback' )->parse()
			) .
			Html::closeElement( 'li' ) .
			Html::closeElement( 'ul' )
		) );
		return $layout;
	}

	/**
	 * Builds mobile user preferences field.
	 * @return \OOUI\FieldLayout
	 */
	private function buildMobileUserPreferences() {
		$spacer = new OOUI\LabelWidget( [
			'name' => 'mobile_preference_spacer',
		] );
		$userPreferences = new OOUI\FieldLayout(
			$spacer,
			[
				'label' => new OOUI\LabelWidget( [
					'input' => $spacer,
					'label' => new OOUI\HtmlSnippet(
						Html::openElement( 'div' ) .
						Html::rawElement( 'strong', [],
							 $this->msg( 'mobile-frontend-user-pref-option' )->parse() ) .
						Html::rawElement( 'div', [ 'class' => 'option-description' ],
							 $this->msg( 'mobile-frontend-user-pref-description' )->parse()
						) .
						Html::closeElement( 'div' )
					)
				] ),
				'id' => 'mobile-user-pref',
			]
		);
		$userPreferences->appendContent( new OOUI\HtmlSnippet(
			Html::openElement( 'ul', [ 'class' => 'hlist option-links' ] ) .
			Html::openElement( 'li' ) .
			Html::rawElement(
				'a',
				[ 'href' => Title::newFromText( 'Special:Preferences' )->getLocalURL() ],
				$this->msg( 'mobile-frontend-user-pref-link' )->parse()
			) .
			Html::closeElement( 'li' ) .
			Html::closeElement( 'ul' )
		) );
		return $userPreferences;
	}

	/**
	 * Mark some html as being content
	 * @param string $html HTML content
	 * @return string of html
	 */
	private static function contentElement( $html ) {
		return Html::rawElement( 'div', [
			'class' => 'content'
		], $html );
	}

	/**
	 * Render the settings form (with actual set settings) and add it to the
	 * output as well as any supporting modules.
	 */
	private function addSettingsForm() {
		$out = $this->getOutput();
		$user = $this->getUser();
		$isTemp = $user->isTemp();

		$out->setPageTitleMsg( $this->msg( 'mobile-frontend-main-menu-settings-heading' ) );
		$out->enableOOUI();

		if ( $this->getRequest()->getCheck( 'success' ) ) {
			$out->wrapWikiMsg(
				self::contentElement(
					Html::successBox(
						$this->msg( 'savedprefs' )->parse(),
						'mw-mf-mobileoptions-message'
					)
				)
			);
		}

		$fields = [];
		$form = new OOUI\FormLayout( [
			'method' => 'POST',
			'id' => 'mobile-options',
			'action' => $this->getPageTitle()->getLocalURL(),
		] );
		$form->addClasses( [ 'mw-mf-settings' ] );

		if ( $this->amc->isAvailable() && !$isTemp ) {
			$fields[] = $this->buildAMCToggle();
		}

		$fields[] = new OOUI\ButtonInputWidget( [
			'id' => 'mw-mf-settings-save',
			'infusable' => true,
			'value' => $this->msg( 'mobile-frontend-save-settings' )->text(),
			'label' => $this->msg( 'mobile-frontend-save-settings' )->text(),
			'flags' => [ 'primary', 'progressive' ],
			'type' => 'submit',
		] );

		if ( $user->isRegistered() && !$isTemp ) {
			$fields[] = new OOUI\HiddenInputWidget( [ 'name' => 'token',
				'value' => $user->getEditToken() ] );
			// Special:Preferences link (https://phabricator.wikimedia.org/T327506)
			$fields[] = $this->buildMobileUserPreferences();
		}

		$form->appendContent(
			...$fields
		);
		$out->addHTML( $form );
	}

	/**
	 * @param WebRequest $request
	 * @return string url to redirect to
	 */
	private function getRedirectUrl( WebRequest $request ) {
		$returnTo = $request->getText( 'returnto' );
		if ( $returnTo !== '' ) {
			$title = Title::newFromText( $returnTo );

			if ( $title !== null ) {
				return $title->getFullURL( $request->getText( 'returntoquery' ) );
			}
		}

		return $this->mobileContext->getMobileUrl(
			$this->getPageTitle()->getFullURL( 'success' )
		);
	}

	/**
	 * Saves the settings submitted by the settings form
	 */
	private function submitSettingsForm() {
		$request = $this->getRequest();
		$user = $this->getUser();

		if ( $user->isRegistered() && !$user->matchEditToken( $request->getVal( 'token' ) ) ) {
			$errorText = __METHOD__ . '(): token mismatch';
			wfDebugLog( 'mobile', $errorText );
			$this->getOutput()->addHTML(
				Html::errorBox(
					$this->msg( "mobile-frontend-save-error" )->parse()
				)
			);
			$this->addSettingsForm();
			return;
		}

		$enableAMC = $request->getBool( 'enableAMC' );

		if ( $this->amc->isAvailable() ) {
			$this->userMode->setEnabled( $enableAMC );
		}

		DeferredUpdates::addCallableUpdate( function () use ( $enableAMC ) {
			if ( $this->readOnlyMode->isReadOnly() ) {
				return;
			}

			$latestUser = $this->getUser()->getInstanceFromPrimary();
			if ( $latestUser === null || !$latestUser->isNamed() ) {
				// The user is anon, temp user or could not be loaded from the database.
				return;
			}

			if ( $this->amc->isAvailable() ) {
				$this->userOptionsManager->setOption(
					$latestUser,
					UserMode::USER_OPTION_MODE_AMC,
					$enableAMC ? UserMode::OPTION_ENABLED : UserMode::OPTION_DISABLED
				);
			}
			$this->userOptionsManager->saveOptions( $latestUser );
		}, DeferredUpdates::PRESEND );

		$this->getOutput()->redirect( $this->getRedirectUrl( $request ) );
	}
}
