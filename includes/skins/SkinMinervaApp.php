<?php
class SkinMinervaApp extends SkinMinervaBeta {
	protected $mode = 'app';

	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-app' )->text();
	}

	public function getHtmlElementAttributes() {
		$attrs = parent::getHtmlElementAttributes();
		$skin = $this->skinname;
		$out = $this->getOutput();
		$target = $out->getTarget();
		$lang = $this->getLanguage()->getCode();
		$queryString = "?skin={$skin}&target={$target}&lang={$lang}";
		$attrs['manifest'] = Title::makeTitle( NS_SPECIAL, 'MobileWebApp/manifest' )->
			getLocalURL() . $queryString;
		return $attrs;
	}

	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		if ( isset( $styles['special'] ) ) {
			unset( $styles['special'] );
		}
		$styles[] = 'mobile.special.app.styles';
		return $styles;
	}

	// FIXME: Get login to work in JavaScript
	protected function isAuthenticatedUser() {
		return false;
	}

	protected function prepareUserButton( QuickTemplate $tpl ) {
		$tpl->set( 'secondaryButton', '' );
	}

	public function getDefaultModules() {
		return array();
	}
}

