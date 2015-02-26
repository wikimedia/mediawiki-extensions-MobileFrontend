<?php
/**
 * MobileUserInfo.php
 */

/**
 * Retrieves information about a user for Special:MobileProfile
 */
class MobileUserInfo {
	// Note: If changing this please check mobile-frontend-profile-contributions message key
	const LIMIT = 500;

	/**
	 * @var User User whose information is retrieved
	 */
	private $user;

	/**
	 * Construct the class
	 *
	 * @param User $user A User object
	 * @throws Exception when used on anonymous user.
	 */
	public function __construct( User $user ) {
		if ( $user->isAnon() ) {
			throw new Exception( __CLASS__ . ' is intended for logged in users only' );
		}
		$this->user = $user;
	}

	/**
	 * Returns a count of the most recent edits since a given timestamp, not exceeding LIMIT
	 *
	 * @param int $fromDate Time to measure from
	 * @return int the amount of edits
	 */
	public function countRecentEdits( $fromDate ) {
		$dbr = wfGetDB( DB_SLAVE );
		$where = array(
			'rc_user_text' => $this->user->getName(),
		);
		$where[] = 'rc_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $fromDate ) );
		$constraints = array(
			'LIMIT' => self::LIMIT + 1,
		);

		$result = $dbr->selectRowCount(
			'recentchanges',
			'rc_timestamp',
			$where,
			__METHOD__,
			$constraints
		);

		return $result;
	}

	/**
	 * Returns a count of the most recent uploads to $wgMFPhotoUploadWiki since
	 * a given timestamp, not exceeding LIMIT.
	 *
	 * @param int $fromDate Time to measure from
	 * @return int the amount of edits
	 */
	public function countRecentUploads( $fromDate ) {
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

		$where = array( 'img_user_text' => $this->user->getName() );
		$where[] = 'img_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $fromDate ) );
		$constraints = array(
			'LIMIT' => self::LIMIT + 1,
		);

		$result = $dbr->selectRowCount( 'image', 'img_timestamp', $where, __METHOD__, $constraints );

		return $result;
	}

	/**
	 * Returns the last edit of the user
	 *
	 * @return Revision|false
	 */
	public function getLastEdit() {
		$conds = array(
			'rev_user' => $this->user->getId(),
		);
		$options = array(
			'LIMIT' => 1,
			'ORDER BY' => 'rev_timestamp DESC',
		);

		$dbr = wfGetDB( DB_SLAVE, 'revision' );
		$res = $dbr->select( 'revision', 'rev_id', $conds, __METHOD__, $options );
		$row = $res->fetchObject();
		if ( $row ) {
			$rev = Revision::newFromId( $row->rev_id );
		} else {
			$rev = false;
		}

		return $rev;
	}

	/**
	 * Returns user who last thanked current user. Requires Extension:Echo
	 *
	 * @return array|null
	 */
	public function getLastThanking() {
		$thank = false;
		// Check that the Thank Extension and Echo extension are both installed
		// before doing this (bug 56825).
		if ( class_exists( 'EchoNotificationMapper' ) && class_exists( 'ApiThank' ) ) {
			// @FIXME - Inject the instance into the class for unittest?
			$mapper = new EchoNotificationMapper();
			$notifs = $mapper->fetchByUser(
				$this->user, 1, null, array( 'edit-thank' )
			);
			if ( $notifs ) {
				$notif = reset( $notifs );
				$agent = $notif->getEvent()->getAgent();
				if ( $agent ) {
					$thank = array( 'user' => $agent );
				}
			}
		}

		return $thank;
	}
}
