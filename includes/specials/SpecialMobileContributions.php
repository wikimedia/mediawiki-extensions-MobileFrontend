<?php
// FIXME: On Special:Contributions add ability to filter a la desktop
class SpecialMobileContributions extends SpecialMobileHistory {
	// Note we do not redirect to Special:History/$par to allow the parameter to be used for usernames
	protected $specialPageName = 'Contributions';
	/**  @var User */
	protected $user;

	public function executeWhenAvailable( $par = '' ) {
		wfProfileIn( __METHOD__ );
		if ( $par ) {
			// enter article history view
			$this->user = User::newFromName( $par );
			if ( $this->user && $this->user->idForName() ) {
				$this->renderHeaderBar( $this->msg( 'mobile-frontend-contribution-summary',
					$this->user->getName() ), true );
				$res = $this->doQuery();
				$this->showHistory( $res );
				wfProfileOut( __METHOD__ );
				return;
			}
		}
		$this->showPageNotFound();
		wfProfileOut( __METHOD__ );
	}

	protected function getQueryConditions() {
		$conds = array();
		$dbr = wfGetDB( DB_SLAVE, self::DB_REVISIONS_TABLE );

		if ( $this->user ) {
			$conds = array(
				'rev_user' => $this->user->getID(),
			);

			$currentUser = $this->getContext()->getUser();

			// T132653: Only list deleted/suppressed edits if the current user - not the
			// target user (`$this->user`) – can view them.
			// This code was taken from ContribsPager#getQueryInfo.
			if ( $currentUser ) {
				if ( !$currentUser->isAllowed( 'deletedhistory' ) ) {
					$conds[] = $dbr->bitAnd( 'rev_deleted', Revision::DELETED_USER ) . ' = 0';
				} elseif ( !$currentUser->isAllowedAny( 'suppressrevision', 'viewsuppressed' ) ) {
					$conds[] = $dbr->bitAnd( 'rev_deleted', Revision::SUPPRESSED_USER ) .
						' != ' . Revision::SUPPRESSED_USER;
				}
			}
		}
		return $conds;
	}

	protected function renderFeedItemHtml( $ts, $diffLink ='', $username = '',
		$comment = '', $title = false, $isAnon = false
	) {
		// Stop username from being rendered
		$username = false;
		parent::renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title );
	}

}
