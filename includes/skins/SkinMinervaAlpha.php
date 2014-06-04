<?php
/**
 * Alpha-Implementation of stable class SkinMinervaBeta
 */
class SkinMinervaAlpha extends SkinMinervaBeta {
	/** @var string Name of the template */
	public $template = 'MinervaTemplateAlpha';
	/** @var stringDescribes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'alpha';

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
	 * initialize various variables and generate the template
	 * @return QuickTemplate
	 */
	protected function prepareQuickTemplate() {
		$tpl = parent::prepareQuickTemplate();
		$this->prepareTalkLabel( $tpl );
		return $tpl;
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
				$class = 'count icon icon-32px icon-talk';
			} else {
				$talkLabel = wfMessage( 'mobile-frontend-talk-overlay-header' );
				$class = 'icon icon-32px icon-talk';
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
