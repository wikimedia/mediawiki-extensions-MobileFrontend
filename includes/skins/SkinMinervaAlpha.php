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

	protected function getSkinStyles() {
		// This replaces MobileFrontend's button styles with MediaWiki UI button styles
		// MediaWiki UI is in core so to be consistent with desktop these are preferable to use
		$styles = parent::getSkinStyles();
		$key = array_search( 'skins.minerva.buttons.styles', $styles );
		unset( $styles[$key] );
		$styles[] = 'mediawiki.ui.button';
		return $styles;
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
				$numTopics = $dbr->selectField( 'page_props', 'pp_value',
					array( 'pp_page' => $talkTitle->getArticleID(), 'pp_propname' => 'page_top_level_section_count' ),
					__METHOD__
				);
			} else {
				$numTopics = 0;
			}
			if ( $numTopics ) {
				$talkLabel = $this->getLanguage()->formatNum( $numTopics );
				$class = 'count';
			} else {
				$talkLabel = wfMessage( 'mobile-frontend-talk-overlay-header' );
				$class = '';
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
