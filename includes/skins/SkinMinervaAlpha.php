<?php
/**
 * SkinMinervaAlpha.php
 */

/**
 * Alpha-Implementation of stable class SkinMinervaBeta
 */
class SkinMinervaAlpha extends SkinMinervaBeta {
	/** @var string Name of the template */
	public $template = 'MinervaTemplateAlpha';
	/** @var stringDescribes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'alpha';

	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		$styles[] = 'mediawiki.ui.icon';
		$styles[] = 'skins.minerva.icons.styles';
		return $styles;
	}

	/**
	 * Returns the javascript modules to load.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['alpha'] = array( 'mobile.alpha' );
		return $modules;
	}

	/**
	 * Creates element relating to secondary button
	 * @param string $title Title attribute value of secondary button
	 * @param string $url of secondary button
	 * @param string $spanLabel text of span associated with secondary button.
	 * @param string $spanClass the class of the secondary button
	 * @return string html relating to button
	 */
	protected function createSecondaryButton( $title, $url, $spanLabel, $spanClass ) {
		return Html::element( 'a', array(
				'title' => $title,
				'href' => $url,
				'class' => MobileUI::iconClass( 'notifications', 'element',
					'user-button main-header-button icon-32px' ),
				'id' => 'secondary-button',
			) ) .
			Html::element(
				'span',
				array( 'class' => $spanClass ),
				$spanLabel
			);
	}

	/**
	 * initialize various variables and generate the template
	 * @return QuickTemplate
	 */
	protected function prepareQuickTemplate() {
		$tpl = parent::prepareQuickTemplate();
		$this->prepareTalkLabel( $tpl );
		return $tpl;
	}

	/**
	 * Get various skin specific configuration.
	 * @return array
	 */
	public function getSkinConfigVariables() {
		$vars = parent::getSkinConfigVariables();
		$vars['wgMFAnonymousEditing'] = true;
		return $vars;
	}

	/**
	 * Add the talk page link for logged in alpha users to template
	 * @param BaseTemplate $tpl an instance of BaseTemplate
	 * @return QuickTemplate
	 */
	protected function prepareTalkLabel( BaseTemplate $tpl ) {
		$title = $this->getTitle();
		$isSpecialPage = $title->isSpecialPage();

		// talk page link for logged in alpha users
		if ( !$isSpecialPage && !$title->isTalkPage() ) {
			$talkTitle = $title->getTalkPage();
			if ( $talkTitle->getArticleID() ) {
				$dbr = wfGetDB( DB_SLAVE );
				$numTopics = (int)$dbr->selectField( 'page_props', 'pp_value',
					array(
						'pp_page' => $talkTitle->getArticleID(),
						'pp_propname' => 'page_top_level_section_count'
					),
					__METHOD__
				);
			} else {
				$numTopics = 0;
			}
			if ( $numTopics ) {
				$talkLabel = $this->getLanguage()->formatNum( $numTopics );

				$class = MobileUI::iconClass( 'talk', 'element', 'count' );
			} else {
				$talkLabel = wfMessage( 'mobile-frontend-talk-overlay-header' );
				$class = MobileUI::iconClass( 'talk', 'element' );
			}
			$menu = $tpl->data['page_actions'];
			if ( isset( $menu['talk'] ) ) {
				$menu['talk']['text'] = $talkLabel;
				$menu['talk']['class'] = $class;
			}
			$tpl->set( 'page_actions', $menu );
		}
	}
}
