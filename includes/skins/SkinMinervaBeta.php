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
	 * Returns true, if the page can have a talk page.
	 * @return boolean
	 */
	protected function isTalkAllowed() {
		$title = $this->getTitle();
		return $this->isAllowedPageAction( 'talk' ) &&
			!$title->isTalkPage() &&
			$title->canTalk();
	}

	/**
	 * Returns true, if the talk page of this page is wikitext-based.
	 * @return boolean
	 */
	protected function isWikiTextTalkPage() {
		return $this->getTitle()->getTalkPage()->getContentModel() === CONTENT_MODEL_WIKITEXT;
	}

	/**
	 * Returns an array of modules related to the current context of the page.
	 * @return array
	 */
	public function getContextSpecificModules() {
		$modules = parent::getContextSpecificModules();
		$title = $this->getTitle();
		if (
			( $this->isTalkAllowed() || $title->isTalkPage() ) &&
			$this->isWikiTextTalkPage()
		) {
			$modules[] = 'mobile.talk';
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
					'class' =>  MobileUI::iconClass( 'talk', 'before', 'talk icon-32px' ),
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
		$styles[] = 'mediawiki.ui.icon';
		$styles[] = 'skins.minerva.icons.styles';
		$styles[] = 'skins.minerva.icons.images';
		$styles[] = 'skins.minerva.beta.styles';
		$styles[] = 'skins.minerva.beta.images';

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
