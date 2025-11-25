<?php

use MediaWiki\Exception\BadTitleError;
use MediaWiki\SpecialPage\UnlistedSpecialPage;
use MediaWiki\Title\Title;

/**
 * Redirect from Special:MobileLanguages to the article
 *
 * @ingroup SpecialPage
 * @codeCoverageIgnore
 */
class SpecialMobileLanguages extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'MobileLanguages' );
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subpage ) {
		$title = Title::newFromText( $subpage );
		if ( !$title || !$title->canExist() ) {
			// Reject invalid titles
			// Reject non-wikipage destinations (e.g. Special or Media).
			throw new BadTitleError();
		}
		$url = $title->getLocalURL() . '#p-lang';
		$this->getOutput()->redirect( $url, '301' );
	}
}
