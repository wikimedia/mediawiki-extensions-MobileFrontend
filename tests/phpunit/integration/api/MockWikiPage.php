<?php

class MockWikiPage extends WikiPage {
	public function getLatest() {
		return 123;
	}

	public function isRedirect() {
		return $this->getTitle()->getPrefixedText() === 'Redirected';
	}

	public function getRedirectTarget() {
		if ( $this->getTitle()->getPrefixedText() === 'Redirected' ) {
			return SpecialPage::getTitleFor( 'Blankpage' );
		}
		return null;
	}
}
