<?php
/**
 * Redirect from Special:Uploads to Special:ListFiles
 *
 * @file
 * @ingroup SpecialPage
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
