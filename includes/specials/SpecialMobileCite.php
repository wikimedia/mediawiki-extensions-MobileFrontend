<?php

/**
 * Provides a list of citations available for a page
 * @deprecated
 */
class SpecialMobileCite extends SpecialPage {

	public function __construct() {
		parent::__construct( 'MobileCite' );
	}

	/**
	 * Render the page with a list of references for the given revision identifier
	 *
	 * @param string|null $param The revision number
	 */
	public function execute( $param ) {
		$this->setHeaders();
		$out = $this->getOutput();
		// This page is deprecated so redirect to homepage.
		$out->redirect( Title::newMainPage()->getFullURL() );
	}
}
