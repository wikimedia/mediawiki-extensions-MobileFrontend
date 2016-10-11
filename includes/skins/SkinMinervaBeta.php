<?php

/**
 * SkinMinervaBeta.php
 */

use MobileFrontend\MenuBuilder;

/**
 * Beta-Implementation of stable class SkinMinerva
 */
class SkinMinervaBeta extends SkinMinerva {
	/** @var string $template Name of this template */
	public $template = 'MinervaTemplateBeta';
	/** @var string $mode Describes 'stability' of the skin - beta, stable */
	protected $mode = 'beta';

	/**
	 * Whether the new footer is to be used
	 * @return boolean
	 */
	public function isFooterV2() {
		return true;
	}

	/**
	 * The "switch-language" is always allowed in MFBeta.
	 *
	 * @inheritdoc
	 */
	protected function isAllowedPageAction( $action ) {
		return !$this->getTitle()->isMainPage() && $action === 'switch-language' ?
			true : parent::isAllowedPageAction( $action );
	}

	/**
	 * Do not return secondary actions on the user page.
	 *
	 * @inheritdoc
	 */
	protected function getSecondaryActions( BaseTemplate $tpl ) {
		if ( $this->isUserPage ) {
			return [];
		} else {
			return parent::getSecondaryActions( $tpl );
		}
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
		$modules['beta'] = [
			'skins.minerva.beta.scripts',
		];

		Hooks::run( 'SkinMinervaDefaultModules', [ $this, &$modules ] );

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
		$title = $this->getTitle();
		$styles = parent::getSkinStyles();
		if ( $title->isMainPage() ) {
			$styles[] = 'skins.minerva.mainPage.beta.styles';
		}
		$styles[] = 'skins.minerva.content.styles.beta';
		$styles[] = 'skins.minerva.icons.images.variants';

		return $styles;
	}
}
