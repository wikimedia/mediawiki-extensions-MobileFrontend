<?php

use Wikimedia\Rdbms\ResultWrapper;

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
	protected $prevLengths = [];
	/** @var string a message key for the error message heading that should be shown on a 404 */
	protected $errorNotFoundTitleMsg = 'mobile-frontend-contributions-404-title';
	/** @var string a message key for the error message description that should be shown on a 404 */
	protected $errorNotFoundDescriptionMsg = 'mobile-frontend-contributions-404-desc';

	/**
	 * Gets HTML to place in the header bar. Title should always refer to a logged in user
	 * @param Title $title The page to link to
	 * @return string HTML representing the link in the header bar
	 */
	protected function getHeaderBarLink( $title ) {
		// Convert user page URL to User object.
		$user = User::newFromName( $title->getText(), false );
		$glyph = $user->isAnon() ? 'anonymous' : 'user';

		return Html::element( 'a',
			[
				'class' => MobileUI::iconClass( $glyph, 'before', 'mw-mf-user' ),
				'href' => $title->getLocalUrl(),
			],
			$title->getText() );
	}

	/**
	 * Render the special page body
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
				$out->addModuleStyles( [
					'mobile.pagelist.styles',
					'mobile.special.user.icons',
					'mobile.pagesummary.styles',
				] );
				$out->setHTMLTitle( $this->msg(
					'pagetitle',
					$this->msg( 'contributions-title', $username )->plain()
				)->inContentLanguage() );

				if ( User::isIP( $par ) ) {
					$this->renderHeaderBar( Title::newFromText( 'User:' . $par ) );
				} else {
					$this->renderHeaderBar( $this->user->getUserPage() );
				}
				$pager = new ContribsPager( $this->getContext(), ContribsPager::processDateFilter( [
					'target' => $this->user->getName(),
					// All option setting is baked into SpecialContribution::execute
					// Until that method gets refactored we will ignore all options
					// See https://phabricator.wikimedia.org/T199429
				] ) );
				$res = $pager->reallyDoQuery( $this->offset, self::LIMIT, false );
				$out->addHTML( Html::openElement( 'div', [ 'class' => 'content-unstyled' ] ) );
				$this->showContributions( $res, $pager );
				$out->addHTML( Html::closeElement( 'div' ) );
				return;
			}
		}
		$this->showPageNotFound();
	}

	/**
	 * Render the contributions of user to page
	 * @param ResultWrapper $res Result of doQuery
	 * @param ContribsPager $pager
	 */
	protected function showContributions( ResultWrapper $res, ContribsPager $pager ) {
		$numRows = $res->numRows();
		$rev = null;
		$out = $this->getOutput();
		$revs = [];
		$prevRevs = [];
		foreach ( $res as $row ) {
			$rev = $pager->tryToCreateValidRevision( $row );
			if ( $rev ) {
				$revs[] = $rev;
				if ( $res->key() <= self::LIMIT + 1 && $rev->getParentId() ) {
					$prevRevs[] = $rev->getParentId();
				}
			}
		}
		$this->prevLengths = Revision::getParentLengths( wfGetDB( DB_REPLICA ), $prevRevs );
		if ( $numRows > 0 ) {
			$count = 0;
			foreach ( $revs as $rev ) {
				if ( $count++ < self::LIMIT ) {
					$this->showContributionsRow( $rev );
				}
			}
			$out->addHTML( '</ul>' );
			$queries = $pager->getPagingQueries();
			if ( is_array( $queries['next'] ) && array_key_exists( 'offset', $queries['next'] ) ) {
				$out->addHTML( $this->getMoreButton( $queries['next']['offset'] ) );
			}
		} else {
			// For users who exist but have not made any edits
			$out->addHTML(
				Html::warningBox( $this->msg( 'mobile-frontend-history-no-results' ) ) );
		}
	}

	/**
	 * Render the contribution of the pagerevision (time, bytes added/deleted, pagename comment)
	 * @param Revision $rev Revision to show contribution for
	 */
	protected function showContributionsRow( Revision $rev ) {
		$unhide = (bool)$this->getRequest()->getVal( 'unhide' );
		$user = $this->getUser();
		$username = $this->getUsernameText( $rev, $user, $unhide );
		$comment = $this->getRevisionCommentHTML( $rev, $user, $unhide );

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
			$rev->getTitle(), $user->isAnon(), $bytes, $isMinor
		);
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
