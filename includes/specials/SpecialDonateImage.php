<?php

class SpecialDonateImage extends UnlistedSpecialPage {

	public function __construct() {
		parent::__construct( 'DonateImage' );
	}

	public function execute( $par = '' ) {
		$ctx = MobileContext::singleton();
		$user = $this->getUser();

		$mobileSkin = $ctx->getSkin();

		$this->setHeaders();
		$output = $this->getOutput();
		$output->htmlClass = 'galleryPage';
		$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title' ) );

		// TODO: what if the user cannot upload to the destination wiki in $wgMFPhotoUploadEndpoint?
		if( $user->isAnon() ) {
			$html = '<div class="alert error">' .
				$this->msg( 'mobile-frontend-donate-image-anon' )->parse() .
				'</div>';
		} else {
			$uploadCount = $this->getUserUploadCount( $user->getName() );
			$html = '';
			if ( $uploadCount !== false ) {
				$threshold = $this->getUploadCountThreshold();
				$html .= '<div class="ctaUploadPhoto">';
				if ( $uploadCount > $threshold ) {
					$msg = $this->msg(
						'mobile-frontend-photo-upload-user-count-over-limit'
					)->text();
				} else {
					$msg = $this->msg(
						'mobile-frontend-photo-upload-user-count'
					)->numParams( $uploadCount )->parse();
				}
				$html .= Html::openElement( 'h2', array() ) . $msg . Html::closeElement( 'h2' );
				$html .= '</div>';
			}
			$html .= '<ul class="mobileUserGallery"></ul>';
		}
		$output->addHTML( $html );
	}

	/**
	 * Fetches number of uploads for a given username
	 *
	 * We use 'username' here rather than id to take advantage of indexes.
	 *
	 * @TODO add memcache support
	 *
	 * @param string $username
	 * @return int|bool Will return the # of images (up to the threshold + 1)
	 *		or will return false if there are database errors.
	 */
	private function getUserUploadCount( $username ) {
		global $wgMFPhotoUploadEndpoint, $wgMFPhotoUploadWiki, $wgConf;

		if ( !$wgMFPhotoUploadWiki ) {
			$dbr = wfGetDB( DB_SLAVE );
		} elseif (
				$wgMFPhotoUploadWiki &&
				!in_array( $wgMFPhotoUploadWiki, $wgConf->getLocalDatabases() )
			) {
			// early return if the database is invalid
			return false;
		} else {
			$dbr = wfGetDB( DB_SLAVE, array(), $wgMFPhotoUploadWiki );
		}

		$limit = $this->getUploadCountThreshold() + 1;
		$dbr->ignoreErrors( true );
		$res = $dbr->select(
			'image',
			'img_size',
			array( 'img_user_text' => $username ),
			__METHOD__,
			array( 'LIMIT' => $limit )
		);
		return ( $res ) ? $res->numRows() : false;
	}

	/**
	 * Getter for upload count threshold
	 *
	 * Currently hardcoded as 500; using this handy method to simplify possible
	 * changes in the future.
	 *
	 * @return int
	 */
	public function getUploadCountThreshold() {
		return 500;
	}
}
