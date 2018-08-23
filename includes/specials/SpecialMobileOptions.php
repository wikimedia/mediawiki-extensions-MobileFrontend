<?php

use MobileFrontend\Features\IFeature;

/**
 * Adds a special page with mobile specific preferences
 */
class SpecialMobileOptions extends MobileSpecialPage {
	/** @var Title The title of page to return to after save */
	private $returnToTitle;
	/** @var boolean $hasDesktopVersion Whether this special page has a desktop version or not */
	protected $hasDesktopVersion = true;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'MobileOptions' );
	}

	/**
	 * @return bool
	 */
	public function doesWrites() {
		return true;
	}

	/**
	 * Render the special page
	 * @param string|null $par Parameter submitted as subpage
	 */
	public function execute( $par = '' ) {
		parent::execute( $par );
		$context = MobileContext::singleton();

		$this->returnToTitle = Title::newFromText( $this->getRequest()->getText( 'returnto' ) );
		if ( !$this->returnToTitle ) {
			$this->returnToTitle = Title::newMainPage();
		}

		$this->setHeaders();
		$context->setForceMobileView( true );
		$context->setContentTransformations( false );

		if ( $this->getRequest()->wasPosted() ) {
			$this->submitSettingsForm();
		} else {
			$this->addSettingsForm();
		}
	}

	/**
	 * Render the settings form (with actual set settings) and add it to the
	 * output as well as any supporting modules.
	 */
	private function addSettingsForm() {
		$out = $this->getOutput();
		$context = MobileContext::singleton();
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

		// beta settings
		$isInBeta = $context->isBetaGroupMember();
		if ( $this->getMFConfig()->get( 'MFEnableBeta' ) ) {
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

			$manager = \MediaWiki\MediaWikiServices::getInstance()
				->getService( 'MobileFrontend.FeaturesManager' );

			$features = array_diff(
				$manager->getAvailable( IFeature::CONFIG_BETA ),
				$manager->getAvailable( IFeature::CONFIG_STABLE )
			);

			$classNames = [ 'mobile-options-beta-feature' ];
			if ( $isInBeta ) {
				$classNames[] = 'is-enabled';
				$icon = 'check';
			} else {
				$icon = 'lock';
			}
			/** @var \MobileFrontend\Features\IFeature $feature */
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
			$fields
		);
		$out->addHTML( $form );
	}

	/**
	 * Saves the settings submitted by the settings form
	 */
	private function submitSettingsForm() {
		$context = MobileContext::singleton();
		$request = $this->getRequest();
		$user = $this->getUser();

		if ( $user->isLoggedIn() && !$user->matchEditToken( $request->getVal( 'token' ) ) ) {
			$errorText = __METHOD__ . '(): token mismatch';
			wfDebugLog( 'mobile', $errorText );
			$this->getOutput()->addHTML( '<div class="error">'
				. $this->msg( "mobile-frontend-save-error" )->parse()
				. '</div>'
			);
			$this->addSettingsForm();
			return;
		}

		$group = $request->getBool( 'enableBeta' ) ? 'beta' : '';
		$context->setMobileMode( $group );
		$url = $this->getPageTitle()->getFullURL( 'success' );
		$context->getOutput()->redirect( MobileContext::singleton()->getMobileUrl( $url ) );
	}
}
