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

		return $vars;
	}

	/**
	 * initialize various variables and generate the template
	 * @param OutputPage $out optional parameter: The OutputPage Obj.
	 */
	public function outputPage( OutputPage $out = null ) {
		if ( !$out ) {
			$out = $this->getOutput();
		}
		# Replace page content before DOMParse to make sure images are scrubbed
		# and Zero transformations are applied.
		$this->handleNewPages( $out );
		parent::outputPage( $out );
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
			$modules[] = 'mobile.categories';
		}

		return $modules;
	}

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['beta'] = array( 'skins.minerva.beta.scripts' );
		Hooks::run( 'SkinMinervaDefaultModules', array( $this, &$modules ) );

		// Disable CentralNotice modules in beta
		if ( array_key_exists( 'centralnotice', $modules ) ) {
			unset( $modules['centralnotice'] );
		}

		return $modules;
	}

	/**
	 * Returns an array of links for page secondary actions
	 * @param BaseTemplate $tpl
	 * @return Array
	 */
	protected function getSecondaryActions( BaseTemplate $tpl ) {
		$buttons = parent::getSecondaryActions( $tpl );

		$title = $this->getTitle();
		$namespaces = $tpl->data['content_navigation']['namespaces'];
		if ( $this->isTalkAllowed() ) {
			// FIXME [core]: This seems unnecessary..
			$subjectId = $title->getNamespaceKey( '' );
			$talkId = $subjectId === 'main' ? 'talk' : "{$subjectId}_talk";
			$talkButton = isset( $namespaces[$talkId] ) && !$title->isTalkPage() ?
				$namespaces[$talkId]['text'] : '';

			$talkTitle = $title->getTalkPage();
			$buttons['talk'] = array(
				'attributes' => array(
					'href' => $talkTitle->getLinkURL(),
					'class' =>  MobileUI::iconClass( 'talk', 'before', 'talk' ),
					'data-title' => $talkTitle->getFullText(),
				),
				'label' => $talkButton,
			);
		}

		return $buttons;
	}

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'skins.minerva.beta.styles';
		$styles[] = 'skins.minerva.tablet.beta.styles';
		if ( $this->getTitle()->isMainPage() ) {
			$styles[] = 'skins.minerva.mainPage.beta.styles';
		}

		return $styles;
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
	 * @return html for a message to display at top of old revisions
	 */
	protected function getOldRevisionHtml() {
		$viewSourceLink = Html::openElement( 'p' ) .
				Html::element( 'a', array( 'href' => '#editor/0' ),
					$this->msg( 'mobile-frontend-view-source' )->text() ) .
				Html::closeElement( 'p' );
		return $viewSourceLink . parent::getOldRevisionHtml();
	}

	/** @inheritdoc */
	protected function preparePageContent( QuickTemplate $tpl ) {
		parent::preparePageContent( $tpl );

		$title = $this->getTitle();

		if ( !$title ) {
			return;
		}
	}

	/**
	 * If the user is in beta/alpha mode, we assume, he is an experienced
	 * user (he/she found the "beta/alpha" switch ;))
	 */
	protected function isExperiencedUser() {
		return true;
	}
}
