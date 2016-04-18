<?php
/**
 * SpecialMobileContributions.php
 */

/**
 * A special page to show the contributions of a user
 * @todo FIXME: On Special:Contributions add ability to filter a la desktop
 */
class SpecialMobileContributions extends SpecialMobileHistory {
	/**
	 * @var string $specialPageName The Name of the special page
	 *		(Note we do not redirect to Special:History/$par to
	 *		allow the parameter to be used for usernames)
	 */
	protected $specialPageName = 'Contributions';
	/**  @var User $user Saves the userobject*/
	protected $user;
	/**
	 * @var MWTimestamp $lastDate A timestamp used for
	 *		MobileSpecialPageFeed::renderListHeaderWhereNeeded
	 */
	protected $lastDate;
	/**  @var bool $showUsername Whether to show the username in results or not */
	protected $showUsername = false;
	/** @var array Lengths of previous revisions */
	protected $prevLengths = array();

	/**
	 * Gets HTML to place in the header bar. Title should always refer to a logged in user
	 * @param Title $title The page to link to
	 * @return string HTML representing the link in the header bar
	 */
	protected function getHeaderBarLink( $title ) {
		return Html::element( 'a',
			array(
				'class' => MobileUI::iconClass( 'user', 'before', 'mw-mf-user' ),
				'href' => $title->getLocalUrl(),
			),
			$title->getText() );
	}

	/**
	 * Render the special page boddy
	 * @param string $par The username
	 */
	public function executeWhenAvailable( $par = '' ) {
		$this->offset = $this->getRequest()->getVal( 'offset', false );
		if ( $par ) {
			// enter article history view
			$this->user = User::newFromName( $par, false );
			if ( $this->user && ( $this->user->idForName() || User::isIP( $par ) ) ) {
				// set page title as on desktop site - bug 66656
				$username = $this->user->getName();
				$out = $this->getOutput();
				$out->addModuleStyles( array(
					'mobile.pagelist.styles',
					'mobile.pagesummary.styles',
				) );
				$out->setHTMLTitle( $this->msg(
					'pagetitle',
					$this->msg( 'contributions-title', $username )->plain()
				)->inContentLanguage() );

				if ( User::isIP( $par ) ) {
					$this->renderHeaderBar( $par );
				} else {
					$this->renderHeaderBar( $this->user->getUserPage() );
				}
				$res = $this->doQuery();
				$out->addHtml( Html::openElement( 'div', array( 'class' => 'content-unstyled' ) ) );
				$this->showContributions( $res );
				$out->addHtml( Html::closeElement( 'div' ) );
				return;
			}
		}
		$this->showPageNotFound();
	}

	/**
	 * Render the contributions of user to page
	 * @param ResultWrapper $res
	 */
	protected function showContributions( ResultWrapper $res ) {
		$numRows = $res->numRows();
		$rev = null;
		$out = $this->getOutput();
		$revs = array();
		$prevRevs = array();
		foreach ( $res as $row ) {
			$rev = new Revision( $row );
			$revs[] = $rev;
			if ( $res->key() <= self::LIMIT + 1 && $rev->getParentId() ) {
				$prevRevs[] = $rev->getParentId();
			}
		}
		$this->prevLengths = Revision::getParentLengths( wfGetDB( DB_SLAVE ), $prevRevs );
		if ( $numRows > 0 ) {
			$count = 0;
			foreach ( $revs as $rev ) {
				if ( $count++ < self::LIMIT ) {
					$this->showContributionsRow( $rev );
				}
			}
			$out->addHtml( '</ul>' );
			// Captured 1 more than we should have done so if the number of
			// results is greater than the limit there are more to show.
			if ( $numRows > self::LIMIT ) {
				$out->addHtml( $this->getMoreButton( $rev->getTimestamp() ) );
			}
		} else {
			// For users who exist but have not made any edits
			$out->addHtml(
				MobileUI::warningBox( $this->msg( 'mobile-frontend-history-no-results' ) ) );
		}
	}

	/**
	 * Render the contribution of the pagerevision (time, bytes added/deleted, pagename comment)
	 * @param Revision $rev
	 */
	protected function showContributionsRow( Revision $rev ) {
		$user = $this->getUser();
		$userId = $rev->getUser( Revision::FOR_THIS_USER, $user );
		if ( $userId === 0 ) {
			$username = IP::prettifyIP( $rev->getUserText( Revision::RAW ) );
			$isAnon = true;
		} else {
			$username = $rev->getUserText( Revision::FOR_THIS_USER, $user );
			$isAnon = false;
		}

		// FIXME: Style differently user comment when this is the case
		if ( $rev->userCan( Revision::DELETED_COMMENT, $user ) ) {
			$comment = $rev->getComment( Revision::FOR_THIS_USER, $user );
			$comment = $this->formatComment( $comment, $this->title );
		} else {
			$comment = $this->msg( 'rev-deleted-comment' )->plain();
		}

		$ts = $rev->getTimestamp();
		$this->renderListHeaderWhereNeeded( $this->getLanguage()->userDate( $ts, $this->getUser() ) );
		$ts = new MWTimestamp( $ts );

		if ( $rev->userCan( Revision::DELETED_TEXT, $user ) ) {
			$diffLink = SpecialPage::getTitleFor( 'MobileDiff', $rev->getId() )->getLocalUrl();
		} else {
			$diffLink = false;
		}

		// FIXME: Style differently user comment when this is the case
		if ( !$rev->userCan( Revision::DELETED_USER, $user ) ) {
			$username = $this->msg( 'rev-deleted-user' )->plain();
		}

		$bytes = null;
		if ( isset( $this->prevLengths[$rev->getParentId()] ) ) {
			$bytes = $rev->getSize() - $this->prevLengths[$rev->getParentId()];
		}
		$isMinor = $rev->isMinor();
		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment,
			$rev->getTitle(), $isAnon, $bytes, $isMinor
		);
	}

	/**
	 * Returns a list of query conditions that should be run against the revision table
	 */
	protected function getQueryConditions() {
		$conds = array();
		$dbr = wfGetDB( DB_SLAVE, self::DB_REVISIONS_TABLE );

		if ( $this->user ) {
			if ( $this->user->getId() ) {
				$conds['rev_user'] = $this->user->getId();
			} else {
				$conds['rev_user_text'] = $this->user->getName();
			}
		}

		$currentUser = $this->getContext()->getUser();

		// T132653: Only list deleted/suppressed edits if the current user - not the
		// target user (`$this->user`) – can view them.
		// This code was taken from ContribsPager#getQueryInfo.
		// FIXME: Make Special:MobileContributions use ContribsPager ASAP.
		if ( $currentUser && $this->user ) {
			if ( !$currentUser->isAllowed( 'deletedhistory' ) ) {
				$conds[] = $dbr->bitAnd( 'rev_deleted', Revision::DELETED_USER ) . ' = 0';
			} elseif ( !$currentUser->isAllowedAny( 'suppressrevision', 'viewsuppressed' ) ) {
				$conds[] = $dbr->bitAnd( 'rev_deleted', Revision::SUPPRESSED_USER ) .
					' != ' . Revision::SUPPRESSED_USER;
			}
		}
		if ( $this->offset ) {
			$conds[] = 'rev_timestamp <= ' . $dbr->addQuotes( $this->offset );
		}
		return $conds;
	}

	/**
	 * Get the URL to go to desktop site of this page
	 * @param string $subPage URL of mobile diff page
	 * @return null
	 */
	public function getDesktopUrl( $subPage ) {
		return null;
	}
}
