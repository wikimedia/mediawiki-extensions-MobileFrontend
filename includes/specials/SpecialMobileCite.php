<?php

/**
 * Provides a list of citations available for a page
 * @deprecated
 */
class SpecialMobileCite extends RedirectSpecialPage {

	public function __construct() {
		parent::__construct( 'MobileCite' );
	}

	/**
	 * Render the page with a list of references for the given revision identifier
	 *
	 * @param string|null $subpage
	 * @return Title
	 */
	public function getRedirect( $subpage ) {
		// This page is deprecated so redirect to homepage.
		return Title::newMainPage();
	}
}
