<?php

class SpecialUserProfile extends MobileSpecialPage {
	const LIMIT = 500;

	public function __construct() {
		parent::__construct( 'UserProfile' );
	}

	protected function getDaysAgo( $ts ) {
		$now = new MWTimestamp();
		$diff = $ts->diff( $now );
		return $diff->days;
	}

	protected function getListHtml( $tag, $attrs, $items ) {
		$html = Html::openElement( $tag, $attrs );
		foreach( $items as $item ) {
			$html .= Html::openElement( 'li' );
			$html .= $item;
			$html .= Html::closeElement( 'li' );
		}
		$html .= Html::closeElement( $tag );
		return $html;
	}

	/**
	 * Returns a count of the most recent edits since a given timestamp
	 *
	 * @param User $user The user name to query against
	 * @param Integer $fromDate Time to measure from
	 * @return Integer the amount of edits
	 */
	protected function countRecentEdits( $user, $fromDate ) {
		$dbr = wfGetDB( DB_SLAVE );
		$where = array(
			'rc_user_text' => $user->getName(),
		);
		$where[] = 'rc_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $fromDate ) );
		$constraints = array(
			'limit' => self::LIMIT + 1,
		);
		$res = $dbr->select( 'recentchanges', 'rc_timestamp', $where, __METHOD__, $constraints );
		return $res->numRows();
	}

	/**
	 * Returns a count of the most recent uploads to $wgMFPhotoUploadWiki since a given timestamp
	 *
	 * @param User $user The user name to query against
	 * @param Integer $fromDate Time to measure from
	 * @return Integer the amount of edits
	 */
	protected function countRecentUploads( $user, $fromDate ) {
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

		$where = array( 'img_user_text' => $user->getName() );
		$where[] = 'img_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $fromDate ) );
		$constraints = array(
			'limit' => self::LIMIT + 1,
		);
		$res = $dbr->select( 'image', 'img_timestamp', $where, __METHOD__, $constraints );
		return $res->numRows();
	}

	/**
	 * Returns HTML to show the last upload or a message where there is no last upload
	 *
	 * @param User $user The user name to query against
	 * @return String HTML string representing the last upload by the user
	 */
	protected function getLastUpload( $user ) {
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

		$where = array( 'img_user_text' => $user->getName() );
		$constraints = array( 'LIMIT' => 1, 'ORDER BY' => 'img_timestamp DESC' );
		$res = $dbr->select( 'image', 'img_name, img_timestamp', $where, __METHOD__, $constraints );
		foreach( $res as $row ) {
			$name = $row->img_name;
			$file = wfFindFile( $name );
			$title = Title::newFromText( $name, NS_FILE );
			$ts = new MWTimestamp( wfTimestamp( TS_UNIX, $row->img_timestamp ) );
			$daysAgo = $this->getDaysAgo( $ts );

			$img = Html::openElement( 'div', array( 'class' => 'thumb' ) ) .
				Html::openElement( 'a', array( 'href' => $title->getLocalUrl() ) ) .
				$file->transform( array( 'width' => 320, 'height' => 320 ) )->toHtml() .
				Html::openElement( 'div', array( 'class' => 'thumbcaption' ) ) .
				$this->msg( 'mobile-frontend-profile-upload-caption', $name, $user, $daysAgo )->parse() .
				Html::closeElement( 'div' ) .
				Html::closeElement( 'a' ) .
				Html::closeElement( 'div' );
			return $img;
		}
		return '';
	}

	protected function getUserSummary( User $user ) {
		$registered = $user->getRegistration();
		$editCount = $user->getEditCount();
		$ts = new MWTimestamp( wfTimestamp( TS_UNIX, $registered ) );
		$daysAgo = $this->getDaysAgo( $ts );

		if( $editCount < 50 ) {
			$role = $this->msg( 'mobile-frontend-profile-user-desc-1', $user );
		} else if ( $editCount < 5000 ) {
			$role = $this->msg( 'mobile-frontend-profile-user-desc-2', $user );
		} else {
			$role = $this->msg( 'mobile-frontend-profile-user-desc-3', $user );
		}

		return Html::element( 'p', array( 'class' => 'statement' ),
			$this->msg( 'mobile-frontend-profile-registered', $daysAgo, $editCount )->parse() ) .
			Html::element( 'p', array( 'class' => 'secondary-statement' ), $role );
	}

	protected function getRecentActivityHtml( User $user ) {
		// render
		$fromDate = time() - ( 3600 * 24 * 30 );
		$count = $this->countRecentEdits( $user, $fromDate );
		$uploadCount = $this->countRecentUploads( $user, $fromDate );

		$urlContributions = SpecialPage::getTitleFor( 'Contributions', $user->getName() )->getLocalUrl();
		$urlUploads = SpecialPage::getTitleFor( 'Uploads', $user->getName() )->getLocalUrl();
		$msgUploads = $uploadCount > self::LIMIT ? $this->msg( 'mobile-frontend-profile-uploads-limit', self::LIMIT ) :
			$this->msg( 'mobile-frontend-profile-uploads', $uploadCount );
		$msgEdits = $count > self::LIMIT ? $this->msg( 'mobile-frontend-profile-edits-limit', self::LIMIT ) :
				$this->msg( 'mobile-frontend-profile-edits', $count );
		$statsRecent = array(
			Html::element( 'a', array( 'href' => $urlContributions ), $msgEdits ),
			Html::element( 'a', array( 'href' => $urlUploads ), $msgUploads ),
		);
		$lastUploadHtml = $this->getLastUpload( $user );
		if ( $lastUploadHtml ) {
			$statsRecent[] = $lastUploadHtml;
		}

		$html = Html::element( 'h2', array(), $this->msg( 'mobile-frontend-profile-heading-recent' ) ) .
			$this->getListHtml( 'ul', array( 'class' => 'statements' ), $statsRecent );

		return $html;
	}

	protected function setUserProfileUIElements( User $user ) {
		// replace secondary icon
		$attrs = array(
			'class' => 'talk',
			'id' => 'secondary-button',
			'href' => $user->getTalkPage()->getLocalUrl(),
		);
		$secondaryButton = Html::element( 'a', $attrs, $this->msg( 'mobile-frontend-profile-usertalk' ) );

		// define heading
		$heading = Html::element( 'h1', array(), $user->getName() );

		// set values
		$skin = $this->getSkin();
		$skin->setTemplateVariable( 'secondaryButton', $secondaryButton );
		$skin->setTemplateVariable( 'specialPageHeader', $heading );
	}

	public function getHtmlNoArg() {
		$html = Html::element( 'p', array(), $this->msg( 'mobile-frontend-profile-noargs' ) );
		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			$profileUrl = SpecialPage::getTitleFor( $this->getName(), $user->getName() )->getLocalURL();
			$html .= Html::openElement( 'p', array() );
			$html .= Html::element( 'a', array( 'href' => $profileUrl ), $this->msg( 'mobile-frontend-profile-yours' ) );
			$html .= Html::closeElement( 'p', array() );
		}
		return $html;
	}

	public function getHtmlBetaAlphaOptIn() {
		return Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
			wfMessage( 'mobile-frontend-requires-optin' )->parse() .
			Html::closeElement( 'div' );
	}

	public function execute( $par = '' ) {
		$out = $this->getOutput();
		$this->addModules();
		$out->setPageTitle( $this->msg( 'mobile-frontend-profile-title' ) );
		$ctx = MobileContext::singleton();
		if ( !$ctx->isBetaGroupMember() ) {
			$html = $this->getHtmlBetaAlphaOptIn();
		} else if ( $par ) {
			$user = User::newFromName( $par );
			// prepare content
			if ( $user ) {
				$this->setUserProfileUIElements( $user );
				$html = Html::openElement( 'div', array( 'class' => 'profile' ) ) .
					$this->getUserSummary( $user ) . $this->getRecentActivityHtml( $user ) . '</div>';
			} else {
				$html = $this->getHtmlNoArg();
			}
		} else {
			$html = $this->getHtmlNoArg();
		}
		$out->addHtml( $html );
	}
}
