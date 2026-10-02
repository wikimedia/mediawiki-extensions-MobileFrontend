<?php

use MediaWiki\SpecialPage\RedirectSpecialPage;

/**
 * Redirect from Special:Uploads to Special:ListFiles
 *
 * @ingroup SpecialPage
 * @codeCoverageIgnore
 */
class SpecialUploads extends RedirectSpecialPage {
	public function __construct() {
		parent::__construct( 'Uploads' );
	}

	/**
	 * @inheritDoc
	 */
	public function getRedirect( $subpage ) {
		return self::getTitleFor( 'Listfiles', $subpage );
	}
}
