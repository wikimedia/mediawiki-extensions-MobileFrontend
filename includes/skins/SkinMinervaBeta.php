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
	/** @var bool whether the page is the user's page, i.e. User:Username */
	public $isUserPage = false;

	/** @inheritdoc **/
	public function __construct() {
		$title = $this->getTitle();
		if ( $title->inNamespace( NS_USER ) && !$title->isSubpage() ) {
			$pageUserId = User::idFromName( $title->getText() );
			if ( $pageUserId ) {
				$this->pageUser = User::newFromId( $pageUserId );
				$this->isUserPage = true;
			}
		}
		parent::__construct();
	}

	/** @inheritdoc **/
	protected function getHeaderHtml() {
		if ( $this->isUserPage ) {
			// The heading is just the username without namespace
			$html = Html::rawElement( 'h1', array( 'id' => 'section_0' ),
				$this->pageUser->getName() );
			$fromDate = $this->pageUser->getRegistration();
			if ( is_string( $fromDate ) ) {
				$fromDateTs = new MWTimestamp( wfTimestamp( TS_UNIX, $fromDate ) );
				$html .= Html::element( 'div', array( 'class' => 'tagline', ),
					$this->msg( 'mobile-frontend-user-page-member-since',
						$fromDateTs->format( 'F, Y' ) )
				);
			}
		} else {
			$html = parent::getHeaderHtml();
			$vars = $this->getSkinConfigVariables();
			$description = $vars['wgMFDescription'];
			if ( $description && !$this->getTitle()->isSpecialPage() ) {
				$html .= Html::element( 'div',
					array(
						'class' => 'tagline',
					), $description );
			}
		}
		return $html;
	}

	/**
	 * Do not set page actions on the user page that hasn't been created yet.
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
		} else {
			$tpl->set( 'page_actions', array() );
		}
	}

	/**
	 * Do not return secondary actions on the user page
	 *
	 * @inheritdoc
	 * @param BaseTemplate $tpl
	 */
	protected function getSecondaryActions( BaseTemplate $tpl ) {
		if ( !$this->isUserPage ) {
			parent::getSecondaryActions( $tpl );
		}
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

		// TalkOverlay feature
		if ( $this->isUserPage ) {
			$modules[] = 'skins.minerva.talk';
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
		$title = $this->getTitle();
		$styles = parent::getSkinStyles();
		$styles[] = 'skins.minerva.beta.images';
		if ( $title->isMainPage() ) {
			$styles[] = 'skins.minerva.mainPage.beta.styles';
		} elseif ( $this->isUserPage ) {
			$styles[] = 'skins.minerva.beta.userpage.styles';
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

	/**
	 * Add talk, contributions, and uploads links at the top of the user page.
	 *
	 * @inheritdoc
	 * @param BaseTemplate $tpl
	 */
	protected function prepareHeaderAndFooter( BaseTemplate $tpl ) {
		parent::prepareHeaderAndFooter( $tpl );
		if ( $this->isUserPage ) {
			$talkPage = $this->pageUser->getTalkPage();
			$data = array(
				'talkPageTitle' => $talkPage->getPrefixedURL(),
				'talkPageLink' => $talkPage->getLocalUrl(),
				'talkPageLinkTitle' => $this->msg(
					'mobile-frontend-user-page-talk' )->escaped(),
				'contributionsPageLink' => SpecialPage::getTitleFor(
					'Contributions', $this->pageUser )->getLocalURL(),
				'contributionsPageTitle' => $this->msg(
					'mobile-frontend-user-page-contributions' )->escaped(),
				'uploadsPageLink' => SpecialPage::getTitleFor(
					'Uploads', $this->pageUser )->getLocalURL(),
				'uploadsPageTitle' => $this->msg(
					'mobile-frontend-user-page-uploads' )->escaped(),
			);
			$templateParser = new TemplateParser( __DIR__ );
			$tpl->set( 'postheadinghtml',
				$templateParser->processTemplate( 'user_page_links', $data ) );
		}
	}
}
