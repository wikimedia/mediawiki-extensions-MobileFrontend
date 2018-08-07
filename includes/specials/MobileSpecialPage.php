<?php


/**
 * Basic mobile implementation of SpecialPage to use in specific mobile special pages
 */
class MobileSpecialPage extends SpecialPage {
	/** @var boolean $hasDesktopVersion If true, the page will also be available on desktop */
	protected $hasDesktopVersion = false;
	/** @var string $mode Saves the actual mode used by user (stable|beta) */
	protected $mode = 'stable';
	/** @var boolean $listed Whether this special page should appear on Special:SpecialPages */
	protected $listed = false;
	/** @var boolean Whether the special page's content should be wrapped in div.content */
	protected $unstyledContent = true;
	/** @var Config MobileFrontend's config object */
	protected $config = null;
	/** @var string a message key for the error message heading that should be shown on a 404 */
	protected $errorNotFoundTitleMsg = 'mobile-frontend-generic-404-title';
	/** @var string a message key for the error message description that should be shown on a 404 */
	protected $errorNotFoundDescriptionMsg = 'mobile-frontend-generic-404-desc';

	/**
	 * Wrapper for MobileContext::getMFConfig
	 * @return Config|null
	 */
	protected function getMFConfig() {
		return $this->config;
	}

	/**
	 * Executes the page when available in the current $mode
	 * @param string $subPage parameter as subpage of specialpage
	 */
	public function executeWhenAvailable( $subPage ) {
	}

	/**
	 * Checks the availability of the special page in actual mode and display the page, if available
	 * @param string $subPage parameter submitted as "subpage"
	 */
	public function execute( $subPage ) {
		$ctx = MobileContext::singleton();
		$this->config = $ctx->getMFConfig();
		$out = $this->getOutput();
		$out->setProperty( 'desktopUrl', $this->getDesktopUrl( $subPage ) );
		if ( !$ctx->shouldDisplayMobileView() && !$this->hasDesktopVersion ) {
			# We are not going to return any real content
			$out->setStatusCode( 404 );
			$this->renderUnavailableBanner( $this->msg( 'mobile-frontend-requires-mobile' ) );
		} elseif ( $this->mode !== 'stable' ) {
			if ( $this->mode === 'beta' && !$ctx->isBetaGroupMember() ) {
				$this->renderUnavailableBanner( $this->msg( 'mobile-frontend-requires-optin' )->parse() );
			} else {
				$this->executeWhenAvailable( $subPage );
			}
		} else {
			$this->executeWhenAvailable( $subPage );
		}
	}

	/**
	 * Add modules to headers and wrap content in div.content if unstyledContent = true
	 */
	public function setHeaders() {
		parent::setHeaders();
		$this->addModules();

		if ( $this->unstyledContent ) {
			$this->getOutput()->setProperty( 'unstyledContent', true );
		}
	}

	/**
	 * Renders a banner telling the user the page is unavailable
	 *
	 * @param string $msg Message to display
	 */
	protected function renderUnavailableBanner( $msg ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'mobile-frontend-requires-title' ) );
		$out->setProperty( 'unstyledContent', true );
		$out->addHTML( Html::warningBox( $msg ) );
	}

	/**
	 * Add mobile special page specific modules (styles and scripts)
	 */
	protected function addModules() {
		$out = $this->getOutput();
		$rl = $out->getResourceLoader();
		$name = $this->getName();
		$id = strtolower( $name );
		// FIXME: These names should be more specific
		$specialStyleModuleName = 'mobile.special.' . $id . '.styles';
		$specialScriptModuleName = 'mobile.special.' . $id . '.scripts';

		if ( $rl->isModuleRegistered( $specialStyleModuleName ) ) {
			$out->addModuleStyles( [
				'mobile.special.styles',
				$specialStyleModuleName
			] );
		}

		if ( $rl->isModuleRegistered( $specialScriptModuleName ) ) {
			$out->addModules( $specialScriptModuleName );
		}
		Hooks::run( 'MobileSpecialPageStyles', [ $id, $out ] );
	}

	/**
	 * Returns if this page is listed on Special:SpecialPages
	 * @return bool
	 */
	public function isListed() {
		return $this->listed;
	}

	/**
	 * Render mobile specific error page, when special page can not be found
	 */
	protected function showPageNotFound() {
		$this->getOutput()->setStatusCode( 404 );
		$this->getOutput()->addHTML(
			MobileUI::contentElement(
				Html::errorBox(
					$this->msg( $this->errorNotFoundDescriptionMsg )->text(),
					$this->msg( $this->errorNotFoundTitleMsg )->text()
				)
			)
		);
	}

	/**
	 * When overridden in a descendant class, returns desktop URL for this special page
	 * @param string $subPage Subpage passed in URL
	 * @return string|null Desktop URL for this special page or null if a standard one should be used
	 */
	public function getDesktopUrl( $subPage ) {
		return null;
	}
}
