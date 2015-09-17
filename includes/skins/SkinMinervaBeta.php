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
	/** @var string $mode Describes 'stability' of the skin - beta, stable */
	protected $mode = 'beta';

	/** @inheritdoc **/
	protected function getHeaderHtml() {
		$html = parent::getHeaderHtml();
		$vars = $this->getSkinConfigVariables();
		$description = $vars['wgMFDescription'];
		if ( $description && !$this->getTitle()->isSpecialPage() ) {
			$html .= Html::element( 'div',
				array(
					'class' => 'tagline',
				), $description );
		}
		return $html;
	}

	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		$vars['wgMFDescription'] = $this->getOutput()->getProperty( 'wgMFDescription' );
		$vars['wgMFImagesCategory'] = $this->getOutput()->getProperty( 'wgMFImagesCategory' );

		return $vars;
	}

	/**
	 * Returns an array with details for a talk button.
	 * @param Title $talkTitle Title object of the talk page
	 * @param array $talkButton Array with data of desktop talk button
	 * @return array
	 */
	protected function getTalkButton( $talkTitle, $talkButton ) {
		$button = parent::getTalkButton( $talkTitle, $talkButton );
		// use a button with icon in beta
		$button['attributes']['class'] = MobileUI::iconClass( 'talk', 'before', 'talk icon-32px' );

		return $button;
	}

	/**
	 * Returns an array of modules related to the current context of the page.
	 * @return array
	 */
	public function getContextSpecificModules() {
		$modules = parent::getContextSpecificModules();
		if ( $this->getCategoryLinks( false ) ) {
			$modules[] = 'skins.minerva.categories';
		}

		return $modules;
	}

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['beta'] = array(
			'skins.minerva.beta.scripts',
		);

		Hooks::run( 'SkinMinervaDefaultModules', array( $this, &$modules ) );

		// Disable CentralNotice modules in beta
		if ( array_key_exists( 'centralnotice', $modules ) ) {
			unset( $modules['centralnotice'] );
		}

		return $modules;
	}

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'skins.minerva.beta.images';
		if ( $this->getTitle()->isMainPage() ) {
			$styles[] = 'skins.minerva.mainPage.beta.styles';
		}

		return $styles;
	}

	/**
	 * If the user is in beta mode, we assume, he is an experienced
	 * user (he/she found the "beta" switch ;))
	 */
	protected function isExperiencedUser() {
		return true;
	}
}
