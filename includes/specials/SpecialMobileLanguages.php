<?php
/**
 * Redirect from Special:MobileLanguages to the article
 *
 * @file
 * @ingroup SpecialPage
 */
class SpecialMobileLanguages extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileLanguages' );
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subpage ) {
		$url = wfAppendQuery( wfScript( 'index' ), [ 'title' => $subpage ] );
		$this->getOutput()->redirect( $url . '#p-lang', '301' );
	}
}
