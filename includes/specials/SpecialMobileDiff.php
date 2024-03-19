<?php

use MediaWiki\SpecialPage\UnlistedSpecialPage;

/**
 * Show the difference between two revisions of a page
 */
class SpecialMobileDiff extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileDiff' );
	}

	/**
	 * Get the URL for Desktop version of difference view
	 * @param string|null $subPage URL of mobile diff page
	 * @return string|null Url to mobile diff page
	 */
	public function getDesktopUrl( $subPage ) {
		if ( $subPage === null ) {
			return null;
		}
		$parts = explode( '...', $subPage );
		if ( count( $parts ) > 1 ) {
			$params = [ 'diff' => $parts[1], 'oldid' => $parts[0] ];
		} else {
			$params = [ 'diff' => $parts[0] ];
		}
		if ( $this->getRequest()->getVal( 'unhide' ) ) {
			$params['unhide'] = 1;
		}
		return wfAppendQuery( wfScript(), $params );
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subPage ) {
		$out = $this->getOutput();
		if ( !$subPage ) {
			$out->setStatusCode( 404 );
			$out->addHTML(
				Html::errorBox(
					$out->msg( 'mobile-frontend-generic-404-title' )->text(),
					$out->msg( 'mobile-frontend-generic-404-desc' )->text()
				)
			);

			return;
		}
		$out->redirect( $this->getDesktopUrl( $subPage ), '301' );
	}
}
