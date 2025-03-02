<?php

use MediaWiki\SpecialPage\RedirectSpecialPage;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;

/**
 * Formerly a special page to show the difference between two revisions of a page - decomissioned in T358293
 * Now redirects to the core diff functionality; or, if called without a subpage, to the form at Special:Diff
 */
class SpecialMobileDiff extends RedirectSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileDiff' );
	}

	/**
	 * Determine the page to redirect to
	 *
	 * @param string|null $subPage The subpage, if any, passed to Special:MobileDiff
	 * @return Title|bool Either a Title object representing Special:Diff, or `true` to indicate that the redirect
	 * should be to index.php with the added parameters
	 */
	public function getRedirect( $subPage ) {
		// If called without a subpage, redirect to the form at Special:Diff
		if ( $subPage == null ) {
			return SpecialPage::getTitleFor( 'Diff' );
		}

		// Retrieve the diff parameters from the subpage
		$parts = explode( '...', $subPage );
		if ( count( $parts ) > 1 ) {
			$this->mAddedRedirectParams['oldid'] = $parts[0];
			$this->mAddedRedirectParams['diff'] = $parts[1];
		} else {
			$this->mAddedRedirectParams['diff'] = $parts[0];
		}

		// Maintain backwards compatibility: SpecialMobileDiff used
		// `getRequest()->getBool( 'unhide' )`, whereas Article::showDiffPage
		// currently uses `$request->getInt( 'unhide' ) === 1`
		if ( $this->getRequest()->getBool( 'unhide' ) ) {
			$this->mAddedRedirectParams['unhide'] = 1;
		}

		// Redirect to index.php with the added query parameters
		return true;
	}
}
