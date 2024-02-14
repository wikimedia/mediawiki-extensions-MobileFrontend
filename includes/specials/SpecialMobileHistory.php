<?php

use MediaWiki\SpecialPage\UnlistedSpecialPage;

/**
 * Mobile formatted history of a page
 */
class SpecialMobileHistory extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'History' );
	}

	/**
	 * Checks, if the given title supports the use of SpecialMobileHistory.
	 * Always returns false.
	 *
	 * @deprecated 1.41 retained for backwards compatibility;
	 * @param Title $title The title to check
	 * @param User $user the user to check
	 * @return bool True, if SpecialMobileHistory can be used, false otherwise
	 */
	public static function shouldUseSpecialHistory( Title $title, User $user ) {
		return false;
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subpage ) {
		$url = wfAppendQuery( wfScript( 'index' ), [ 'title' => $subpage, 'action' => 'history' ] );
		$this->getOutput()->redirect( $url, '301' );
	}
}
