<?php
/**
 * SkinMinervaBeta.php
 */

/**
 * Beta-Implementation of stable class SkinMinerva
 */
class SkinMinervaBeta extends SkinMinerva {
	/** @var string $template Name of this template */
	public $template = 'MinervaTemplateBeta';
	/** @var string $mode Describes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'beta';

	/**
	 * initialize various variables and generate the template
	 * @param OutputPage $out optional parameter: The OutputPage Obj.
	 */
	public function outputPage( OutputPage $out = null ) {
		wfProfileIn( __METHOD__ );
		if ( !$out ) {
			$out = $this->getOutput();
		}
		# Replace page content before DOMParse to make sure images are scrubbed
		# and Zero transformations are applied.
		$this->handleNewPages( $out );
		parent::outputPage( $out );
	}

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$title = $this->getTitle();

		$styles = parent::getSkinStyles();
		$styles[] = 'skins.minerva.chrome.styles.beta';

		return $styles;
	}

	/**
	 * initialize various variables and generate the template
	 * @return QuickTemplate
	 */
	protected function prepareQuickTemplate() {
		$tpl = parent::prepareQuickTemplate();
		// Move last modified link to top as long as it is not the main page
		$tpl->set( '_lastModifiedAbove', !$this->getTitle()->isMainPage() );
		return $tpl;
	}

	/**
	 * Get various skin specific configuration.
	 * @return array
	 */
	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		// Kill this when we fix the functionality in PageApi.js
		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			$vars['wgMFUserGender'] = $this->getUser()->getOption( 'gender' );
		} else {
			$vars['wgMFUserGender'] = 'unknown';
		}
		return $vars;
	}

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		if ( $this->isAllowedPageAction( 'talk' ) ) {
			$modules['talk'] = array( 'mobile.talk' );
		}
		$modules['beta'] = array( 'mobile.beta' );
		$modules['beta'][] = 'mobile.geonotahack';
		wfRunHooks( 'SkinMinervaDefaultModules', array( $this, &$modules ) );
		return $modules;
	}

	/**
	 * Handles new pages to show error message and print message, that page does not exist.
	 * @param OutputPage $out
	 */
	protected function handleNewPages( OutputPage $out ) {
		# Show error message
		$title = $this->getTitle();
		if ( !$title->exists()
			&& !$title->isSpecialPage()
			&& $title->userCan( 'create', $this->getUser() )
			&& $title->getNamespace() !== NS_FILE
		) {
			$out->clearHTML();
			$out->addHTML(
				Html::openElement( 'div', array( 'id' => 'mw-mf-newpage' ) )
				. wfMessage( 'mobile-frontend-editor-newpage-prompt' )->parse()
				. Html::closeElement( 'div' )
			);
		}
	}

	/**
	 * Prepare warnings for mobile devices
	 * @param BaseTemplate $tpl
	 */
	protected function prepareWarnings( BaseTemplate $tpl ) {
		parent::prepareWarnings( $tpl );
		$out = $this->getOutput();
		if ( $out->getRequest()->getText( 'oldid' ) ) {
			$subtitle = $out->getSubtitle();
			$tpl->set( '_old_revision_warning',
				Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
				Html::openElement( 'p', array() ).
					Html::element( 'a', array( 'href' => '#editor/0' ),
					$this->msg( 'mobile-frontend-view-source' )->text() ) .
				Html::closeElement( 'p' ) .
				$subtitle .
				Html::closeElement( 'div' ) );
		}
	}
}
