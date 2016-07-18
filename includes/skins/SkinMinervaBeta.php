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
	/** @inheritdoc */
	protected $shouldSecondaryActionsIncludeLanguageBtn = true;

	/**
	 * Do not set page actions on the user page that hasn't been created yet.
	 * Also add the language switcher action.
	 *
	 * @inheritdoc
	 * @param BaseTemplate $tpl
	 */
	protected function preparePageActions( BaseTemplate $tpl ) {
		$setPageActions = true;

		if ( $this->isUserPage ) {
			if ( !$this->getTitle()->exists() ) {
				$setPageActions = false;
			}
		}
		if ( $setPageActions ) {
			parent::preparePageActions( $tpl );
			$menu = $tpl->data[ 'page_actions' ];

			$languageSwitcherLinks = [];
			$languageSwitcherClasses = 'disabled';
			if ( $this->doesPageHaveLanguages ) {
				$languageSwitcherLinks['mobile-frontend-language-article-heading'] = [
					'href' => SpecialPage::getTitleFor( 'MobileLanguages', $this->getTitle() )->getLocalURL()
				];
				$languageSwitcherClasses = '';
			}
			$languageSwitcherClasses .= ' language-selector';
			if ( $this->getMFConfig()->get( 'MinervaAlwaysShowLanguageButton' ) ||
				$this->doesPageHaveLanguages ) {
				$menu['language-switcher'] = [ 'text' => '',
					'itemtitle' => $this->msg( 'mobile-frontend-language-article-heading' ),
					'class' => MobileUI::iconClass( 'language-switcher', 'element', $languageSwitcherClasses ),
					'links' => $languageSwitcherLinks,
					'is_js_only' => false
				];
				$tpl->set( 'page_actions', $menu );
			}
		} else {
			$tpl->set( 'page_actions', [] );
		}
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
		$styles[] = 'skins.minerva.beta.styles';
		$styles[] = 'skins.minerva.content.styles.beta';
		$styles[] = 'skins.minerva.icons.beta.images';

		return $styles;
	}
}
