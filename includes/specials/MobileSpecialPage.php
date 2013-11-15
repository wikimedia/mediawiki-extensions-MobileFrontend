<?php

class MobileSpecialPage extends SpecialPage {
	protected $mode = 'stable';
	/**
	 * @var bool: Whether this special page should appear on Special:SpecialPages
	 */
	protected $listed = false;
	/**
	 * @var bool: Whether the special page's content should be wrapped in div.content
	 */
	protected $unstyledContent = true;
	/**
	 * FIXME: Remove need for this alternative chrome for certain Special Pages
	 * @var bool: Whether the page has an alternative header and a footer
	 */
	protected $disableSearchAndFooter = true;

	/* Executes the page when available in the current $mode */
	public function executeWhenAvailable( $subPage ) {}

	public function execute( $subPage ) {
		$ctx = MobileContext::singleton();
		if ( $this->mode !== 'stable' ) {
			if ( $this->mode === 'beta' && !$ctx->isBetaGroupMember() ) {
				$this->renderOptinBanner();
			} else if ( $this->mode === 'alpha' && !$ctx->isAlphaGroupMember() ) {
				$this->renderOptinBanner();
			} else {
				$this->executeWhenAvailable( $subPage );
			}
		} else {
			$this->executeWhenAvailable( $subPage );
		}
	}

	public function setHeaders() {
		parent::setHeaders();
		$this->addModules();

		if ( $this->unstyledContent ) {
			$this->getOutput()->setProperty( 'unstyledContent', true );
		}
	}

	protected function renderOptinBanner() {
		$out = $this->getOutput();
		$out->setProperty( 'unstyledContent', true );
		$out->addHTML( Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
			wfMessage( 'mobile-frontend-requires-optin' )->parse() .
			Html::closeElement( 'div' )
		);
	}

	protected function addModules() {
		$out = $this->getOutput();
		$rl = $out->getResourceLoader();
		$title = $this->getPageTitle();
		list( $name, /* $subpage */ ) = SpecialPageFactory::resolveAlias( $title->getDBkey() );
		$id = strtolower( $name );
		// FIXME: These names should be more specific
		$specialStyleModuleName = 'mobile.' . $id . '.styles';
		$specialScriptModuleName = 'mobile.' . $id . '.scripts';

		if ( $rl->getModule( $specialStyleModuleName ) ) {
			$out->addModuleStyles( $specialStyleModuleName );
		}

		if ( $rl->getModule( $specialScriptModuleName ) ) {
			$out->addModules( $specialScriptModuleName );
		}
	}

	public function isListed() {
		return $this->listed;
	}

	protected function showPageNotFound() {
		wfHttpError( 404, $this->msg( 'mobile-frontend-generic-404-title' )->text(),
			$this->msg( 'mobile-frontend-generic-404-desc' )->text() );
	}
}
