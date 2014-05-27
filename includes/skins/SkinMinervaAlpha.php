<?php

class SkinMinervaAlpha extends SkinMinervaBeta {
	public $template = 'MinervaTemplateAlpha';
	protected $mode = 'alpha';

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-alpha' )->text();
	}

	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		$modules['alpha'] = array( 'mobile.alpha' );
		return $modules;
	}

	protected function prepareQuickTemplate() {
		$tpl = parent::prepareQuickTemplate();
		$this->prepareTalkLabel( $tpl );
		return $tpl;
	}

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
