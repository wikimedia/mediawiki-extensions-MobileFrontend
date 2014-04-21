<?php

class MobileSpecialPage extends SpecialPage {
	protected $hasDesktopVersion = false;
	protected $mode = 'stable';
	/**
	 * @var bool: Whether this special page should appear on Special:SpecialPages
	 */
	protected $listed = false;
	/**
	 * @var bool Whether the special page's content should be wrapped in div.content
	 */
	protected $unstyledContent = true;

	/* Executes the page when available in the current $mode */
	public function executeWhenAvailable( $subPage ) {
	}

	public function execute( $subPage ) {
		$ctx = MobileContext::singleton();
		if ( !$ctx->shouldDisplayMobileView() && !$this->hasDesktopVersion ) {
			$this->renderUnavailableBanner( $this->msg( 'mobile-frontend-requires-mobile' ) );
		} elseif ( $this->mode !== 'stable' ) {
			if ( $this->mode === 'beta' && !$ctx->isBetaGroupMember() ) {
				$this->renderUnavailableBanner( $this->msg( 'mobile-frontend-requires-optin' )->parse() );
			} elseif ( $this->mode === 'alpha' && !$ctx->isAlphaGroupMember() ) {
				// @todo FIXME: Do we need a more specific one for alpha special
				// pages (we currently have none)
				$this->renderUnavailableBanner( $this->msg( 'mobile-frontend-requires-optin' )->parse() );
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

	/**
	 * Renders a banner telling the user the page is unavailable
	 *
	 * $msg String Message to display
	 */
	protected function renderUnavailableBanner( $msg ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'mobile-frontend-requires-title' ) );
		$out->setProperty( 'unstyledContent', true );
		$out->addHTML( Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
			$msg .
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
		$specialStyleModuleName = 'mobile.special.' . $id . '.styles';
		$specialScriptModuleName = 'mobile.special.' . $id . '.scripts';

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
