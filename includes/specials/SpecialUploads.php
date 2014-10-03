<?php
/**
 * SpecialUploads.php
 */

/**
 * Provides a special page with a list of uploaded items/images of a User
 */
class SpecialUploads extends MobileSpecialPage {
	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'Uploads' );
	}

	/**
	 * Render the special page
	 * @param string|null $par Username to get uploads from
	 */
	public function executeWhenAvailable( $par = '' ) {
		// Anons don't get to see this page
		$this->requireLogin( 'mobile-frontend-donate-image-anon' );

		global $wgMFPhotoUploadEndpoint;

		$this->setHeaders();
		$output = $this->getOutput();
		$output->addJsConfigVars( 'wgMFPhotoUploadEndpoint',  $wgMFPhotoUploadEndpoint );
		$output->setPageTitle( $this->msg( 'mobile-frontend-donate-image-title' ) );

		if ( $par !== '' && $par !== null ) {
			$user = User::newFromName( $par );
			if ( !$user || $user->isAnon() ) {
				// User provided, but is invalid or not registered
				$html = '<div class="alert error">'
					. $this->msg( 'mobile-frontend-photo-upload-invalid-user', $par )->parse()
					. '</div>';
			} else {
				$html = $this->getUserUploadsPageHtml( $user );
			}
		} else {
			$user = $this->getUser();
			// TODO: what if the user cannot upload to the destination wiki in $wgMFPhotoUploadEndpoint?
			$html = $this->getUserUploadsPageHtml( $user );
		}
		$output->addHTML( $html );
	}
	/**
	 * Generates HTML for the uploads page for the passed user.
	 *
	 * @param User $user
	 * @return string
	 */
	public function getUserUploadsPageHtml( User $user ) {
		$uploadCount = $this->getUserUploadCount( $user->getName() );
		$mobileContext = MobileContext::singleton();

		$html = '';
		$attrs = array();
		if ( $uploadCount !== false && $mobileContext->userCanUpload() ) {
			$threshold = $this->getUploadCountThreshold();
			$html .= '<div class="ctaUploadPhoto content">';
			if ( $uploadCount > $threshold ) {
				$msg = $this->msg(
					'mobile-frontend-photo-upload-user-count-over-limit'
				)->text();
			} else {
				$msg = $this->msg(
					'mobile-frontend-photo-upload-user-count'
				)->numParams( $uploadCount )->parse();
				if ( $uploadCount === 0 ) {
					$attrs = array( 'style' => 'display:none' );
				}
			}
			$html .= Html::openElement( 'h2', $attrs ) . $msg . Html::closeElement( 'h2' );
			$html .= '</div>';
		}
		return $html;
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
		global $wgMFPhotoUploadWiki, $wgConf;

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
		// not using SQL's count(*) because it's more expensive with big number of rows
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
