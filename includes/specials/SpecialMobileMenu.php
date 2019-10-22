<?php

/**
 * Historical artifact for rendering a skin's menu without an article
 * Used for skins where the menu is hidden via JavaScript by default.
 * Can be removed in future MediaWiki release (TBC).
 * @deprecated 2.2.0
 */
class SpecialMobileMenu extends RedirectSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileMenu' );
	}

	/**
	 * @inheritDoc
	 */
	public function getRedirect( $subpage ) {
		return Title::newMainPage();
	}
}
