<?php

/**
 * Retrieves information about a user for Special:MobileProfile
 */
class MobileUserInfo {
	// Note: If changing this please check mobile-frontend-profile-contributions message key
	const LIMIT = 500;

	/**
	 * @var User: User whose information is retrieved
	 */
	private $user;

	public function __construct( User $user ) {
		if ( $user->isAnon() ) {
			throw new MWException( __CLASS__ . ' is intended for logged in users only' );
		}
		$this->user = $user;
	}

	/**
	 * Returns a count of the most recent edits since a given timestamp, not exceeding LIMIT
	 *
	 * @param Integer $fromDate Time to measure from
	 * @return Integer the amount of edits
	 */
	public function countRecentEdits( $fromDate ) {
		wfProfileIn( __METHOD__ );
		$dbr = wfGetDB( DB_SLAVE );
		$where = array(
			'rc_user_text' => $this->user->getName(),
		);
		$where[] = 'rc_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $fromDate ) );
		$constraints = array(
			'LIMIT' => self::LIMIT + 1,
		);
		$innerSelect = $dbr->selectSQLText( 'recentchanges', 'rc_timestamp', $where, __METHOD__, $constraints );
		$res = $dbr->query( "SELECT COUNT(*) FROM ($innerSelect) t", __METHOD__ );
		$row = $res->fetchRow();
		$result = 0;
		if ( $row ) {
			$result = $row[0];
		}
		wfProfileOut( __METHOD__ );
		return $result;
	}

	/**
	 * Returns a count of the most recent uploads to $wgMFPhotoUploadWiki since a given timestamp, not exceeding LIMIT
	 *
	 * @param Integer $fromDate Time to measure from
	 * @return Integer the amount of edits
	 */
	public function countRecentUploads( $fromDate ) {
		global $wgMFPhotoUploadWiki, $wgConf;

		wfProfileIn( __METHOD__ );
		if ( !$wgMFPhotoUploadWiki ) {
			$dbr = wfGetDB( DB_SLAVE );
		} elseif (
			$wgMFPhotoUploadWiki &&
			!in_array( $wgMFPhotoUploadWiki, $wgConf->getLocalDatabases() )
		) {
			// early return if the database is invalid
			wfProfileOut( __METHOD__ );
			return false;
		} else {
			$dbr = wfGetDB( DB_SLAVE, array(), $wgMFPhotoUploadWiki );
		}

		$where = array( 'img_user_text' => $this->user->getName() );
		$where[] = 'img_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $fromDate ) );
		$constraints = array(
			'LIMIT' => self::LIMIT + 1,
		);
		$innerSelect = $dbr->selectSQLText( 'image', 'img_timestamp', $where, __METHOD__, $constraints );
		$res = $dbr->query( "SELECT COUNT(*) FROM ($innerSelect) t", __METHOD__ );
		$row = $res->fetchRow();
		$result = 0;
		if ( $row ) {
			$result = $row[0];
		}
		wfProfileOut( __METHOD__ );
		return $result;
	}

	/**
	 * Returns last file uploaded by user
	 *
	 * @return File|null
	 */
	public function getLastUpload() {
		global $wgMFPhotoUploadWiki, $wgConf;

		wfProfileIn( __METHOD__ );
		if ( !$wgMFPhotoUploadWiki ) {
			$dbr = wfGetDB( DB_SLAVE );
		} elseif (
			$wgMFPhotoUploadWiki &&
			!in_array( $wgMFPhotoUploadWiki, $wgConf->getLocalDatabases() )
		) {
			// early return if the database is invalid
			wfProfileOut( __METHOD__ );
			return false;
		} else {
			$dbr = wfGetDB( DB_SLAVE, array(), $wgMFPhotoUploadWiki );
		}

		$where = array( 'img_user_text' => $this->user->getName() );
		$constraints = array( 'ORDER BY' => 'img_timestamp DESC' );
		$name = $dbr->selectField( 'image', 'img_name', $where, __METHOD__, $constraints );
		$file = $name === false ? null : wfFindFile( $name );
		wfProfileOut( __METHOD__ );
		return $file;
	}

	/**
	 * Returns user who last thanked current user. Requires Extension:Echo
	 *
	 * @return array|null
	 */
	public function getLastThanking() {
		wfProfileIn( __METHOD__ );
		$thank = false;
		if ( class_exists( 'MWEchoDbFactory' ) ) {
			$dbr = MWEchoDbFactory::getDB( DB_SLAVE );
			$rows = $dbr->select(
				array( 'echo_event', 'echo_notification' ),
				'event_agent_id, event_page_id, notification_timestamp',
				array(
					'notification_user' => $this->user->getId(),
					'event_id=notification_event',
					'event_type' => 'edit-thank' ),
				__METHOD__,
				array( 'ORDER BY' => 'notification_timestamp DESC' )
			);
			$row = $rows->fetchObject();
			if ( $row ) {
				$thank = array(
					'title' => Title::newFromId( $row->event_page_id ),
					'user' => User::newFromId( $row->event_agent_id ),
				);
			}
		}
		wfProfileOut( __METHOD__ );
		return $thank;
	}
}