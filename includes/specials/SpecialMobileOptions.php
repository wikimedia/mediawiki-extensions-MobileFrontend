<?php

use MediaWiki\MediaWikiServices;
use MobileFrontend\Features\IFeature;

/**
 * Adds a special page with mobile specific preferences
 */
class SpecialMobileOptions extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Whether this special page has a desktop version or not */
	protected $hasDesktopVersion = true;

	/**
	 * @var MediaWikiServices
	 */
	private $services;

	/**
	 * Advanced Mobile Contributions mode
	 * @var \MobileFrontend\AMC\Manager
	 */
	private $amc;

	/**
	 * @var \MobileFrontend\Features\FeaturesManager
	 */
	private $featureManager;

	public function __construct() {
		parent::__construct( 'MobileOptions' );
		$this->services = MediaWikiServices::getInstance();
		$this->amc = $this->services->getService( 'MobileFrontend.AMC.Manager' );
		$this->featureManager = $this->services->getService( 'MobileFrontend.FeaturesManager' );
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
			'wgMFEnableFontChanger' => $this->featureManager->isFeatureAvailableForCurrentUser(
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

		$this->setHeaders();
		$this->setJsConfigVars();

		$this->mobileContext->setForceMobileView( true );
		$this->mobileContext->setContentTransformations( false );

		if ( $this->getRequest()->wasPosted() ) {
			$this->submitSettingsForm();
		} else {
			$this->addSettingsForm();
		}
	}

	private function buildAMCToggle() {
		/** @var \MobileFrontend\AMC\UserMode $userMode */
			$userMode = $this->services->getService( 'MobileFrontend.AMC.UserMode' );
			$amcToggle = new OOUI\CheckboxInputWidget( [
				'name' => 'enableAMC',
				'infusable' => true,
				'selected' => $userMode->isEnabled(),
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
							Html::rawElement( 'strong', [ 'class' => 'indicator-circle' ],
								$this->msg( 'mobile-frontend-mobile-option-amc' )->parse() ) .
							Html::rawElement( 'div', [ 'class' => 'option-description' ],
								$this->msg( 'mobile-frontend-mobile-option-amc-experiment-description' )->parse()
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
	 * Render the settings form (with actual set settings) and add it to the
	 * output as well as any supporting modules.
	 */
	private function addSettingsForm() {
		$out = $this->getOutput();
		$user = $this->getUser();

		$out->setPageTitle( $this->msg( 'mobile-frontend-main-menu-settings-heading' ) );
		$out->enableOOUI();

		if ( $this->getRequest()->getCheck( 'success' ) ) {
			$out->wrapWikiMsg(
				MobileUI::contentElement(
					Html::successBox( $this->msg( 'savedprefs' ) )
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

		if ( $this->amc->isAvailable() ) {
			$fields[] = $this->buildAMCToggle();
		}
		// beta settings
		$isInBeta = $this->mobileContext->isBetaGroupMember();
		if ( $this->config->get( 'MFEnableBeta' ) ) {
			$input = new OOUI\CheckboxInputWidget( [
				'name' => 'enableBeta',
				'infusable' => true,
				'selected' => $isInBeta,
				'id' => 'enable-beta-toggle',
				'value' => '1',
			] );
			$fields[] = new OOUI\FieldLayout(
				$input,
				[
					'label' => new OOUI\LabelWidget( [
						'input' => $input,
						'label' => new OOUI\HtmlSnippet(
							Html::openElement( 'div' ) .
							Html::rawElement( 'strong', [],
								$this->msg( 'mobile-frontend-settings-beta' )->parse() ) .
							Html::rawElement( 'div', [ 'class' => 'option-description' ],
								$this->msg( 'mobile-frontend-opt-in-explain' )->parse()
							) .
							Html::closeElement( 'div' )
						)
					] ),
					'id' => 'beta-field',
				]
			);

			$manager = $this->services->getService( 'MobileFrontend.FeaturesManager' );
			// TODO The userMode should know how to retrieve features assigned to that mode,
			// we shouldn't do any special logic like this in anywhere else in the code
			$features = array_diff(
				$manager->getAvailableForMode( $manager->getMode( IFeature::CONFIG_BETA ) ),
				$manager->getAvailableForMode( $manager->getMode( IFeature::CONFIG_STABLE ) )
			);

			$classNames = [ 'mobile-options-beta-feature' ];
			if ( $isInBeta ) {
				$classNames[] = 'is-enabled';
				$icon = 'check';
			} else {
				$icon = 'lock';
			}
			/** @var IFeature $feature */
			foreach ( $features as $feature ) {
				$fields[] = new OOUI\FieldLayout(
					new OOUI\IconWidget( [
						'icon' => $icon,
						'title' => wfMessage( 'mobile-frontend-beta-only' )->text(),
					] ),
					[
						'classes' => $classNames,
						'label' => new OOUI\LabelWidget( [
							'label' => new OOUI\HtmlSnippet(
								Html::rawElement( 'div', [],
									Html::element( 'strong', [],
										wfMessage( $feature->getNameKey() )->text() ) .
									Html::element( 'div', [ 'class' => 'option-description' ],
										wfMessage( $feature->getDescriptionKey() )->text() )
								)
							),
						] )
					]
				);
			}
		}

		$fields[] = new OOUI\ButtonInputWidget( [
			'id' => 'mw-mf-settings-save',
			'infusable' => true,
			'value' => $this->msg( 'mobile-frontend-save-settings' )->text(),
			'label' => $this->msg( 'mobile-frontend-save-settings' )->text(),
			'flags' => [ 'primary', 'progressive' ],
			'type' => 'submit',
		] );

		if ( $user->isLoggedIn() ) {
			$fields[] = new OOUI\HiddenInputWidget( [ 'name' => 'token',
				'value' => $user->getEditToken() ] );
		}

		$feedbackLink = $this->getConfig()->get( 'MFBetaFeedbackLink' );
		if ( $feedbackLink && $isInBeta ) {
			$fields[] = new OOUI\ButtonWidget( [
				'framed' => false,
				'href' => $feedbackLink,
				'icon' => 'feedback',
				'flags' => [
					'progressive',
				],
				'classes' => [ 'mobile-options-feedback' ],
				'label' => $this->msg( 'mobile-frontend-send-feedback' )->text(),
			] );
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

			if ( !is_null( $title ) ) {
				return $title->getFullURL();
			}
		}

		return $this->mobileContext->getMobileUrl(
			$this->getPageTitle()->getFullURL( 'success' )
		);
	}

	/**
	 * @param WebRequest $request
	 */
	private function updateAmc( WebRequest $request ) {
		if ( !$this->amc->isAvailable() ) {
			return;
		}

		/** @var \MobileFrontend\AMC\UserMode $userMode */
		$userMode = $this->services->getService( 'MobileFrontend.AMC.UserMode' );
		$userMode->setEnabled( $request->getBool( 'enableAMC' ) );
	}

	/**
	 * @param WebRequest $request
	 */
	private function updateBeta( WebRequest $request ) {
		$group = $request->getBool( 'enableBeta' ) ? 'beta' : '';
		$this->mobileContext->setMobileMode( $group );
	}

	/**
	 * Saves the settings submitted by the settings form
	 */
	private function submitSettingsForm() {
		$request = $this->getRequest();
		$user = $this->getUser();
		$output = $this->getOutput();

		if ( $user->isLoggedIn() && !$user->matchEditToken( $request->getVal( 'token' ) ) ) {
			$errorText = __METHOD__ . '(): token mismatch';
			wfDebugLog( 'mobile', $errorText );
			$output->addHTML( '<div class="error">'
				. $this->msg( "mobile-frontend-save-error" )->parse()
				. '</div>'
			);
			$this->addSettingsForm();
			return;
		}

		// We must treat forms that only update a single field specially because if we
		// don't, all the other options will be clobbered with default values
		switch ( $request->getRawVal( 'updateSingleOption' ) ) {
			case 'enableAMC':
				$this->updateAmc( $request );
				break;
			case 'enableBeta':
				$this->updateBeta( $request );
				break;
			default:
				$this->updateAmc( $request );
				$this->updateBeta( $request );
		}

		$output->redirect( $this->getRedirectUrl( $request ) );
	}
}
