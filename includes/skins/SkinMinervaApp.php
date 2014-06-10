<?php
/**
 * SkinMinervaApp.php
 */

/**
 * App-Implementation of stable class SkinMinerva
 */
class SkinMinervaApp extends SkinMinervaBeta {
	/** @var string $mode Describes 'stability' of the skin - alpha, beta, stable */
	protected $mode = 'app';

	/**
	 * Get the placeholder for search input.
	 * @return string
	 */
	protected function getSearchPlaceHolderText() {
		return wfMessage( 'mobile-frontend-placeholder-app' )->text();
	}

	/**
	 * Returns an array of html attributes from Skin class
	 * extended with additional, mobile app specific parameters.
	 * @return string
	 */
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

	/**
	 * Get the needed styles for this skin
	 * @return array
	 */
	protected function getSkinStyles() {
		$styles = parent::getSkinStyles();
		if ( isset( $styles['special'] ) ) {
			unset( $styles['special'] );
		}
		$styles[] = 'mobile.special.app.styles';
		return $styles;
	}

	/**
	 * Check whether the user is anonymous.
	 * Returns always false
	 * @todo Get login to work in JavaScript
	 * @return boolean
	 */
	protected function isAuthenticatedUser() {
		return false;
	}

	/**
	 * Prepares user button (secondary button)
	 * @return array
	 */
	protected function prepareUserButton( QuickTemplate $tpl ) {
		$tpl->set( 'secondaryButton', '' );
	}

	/**
	 * Returns the javascript modules to load.
	 * Returns always an empty array.
	 * @return array
	 */
	public function getDefaultModules() {
		return array();
	}
}

