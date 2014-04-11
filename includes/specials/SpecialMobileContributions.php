<?php
// FIXME: On Special:Contributions add ability to filter a la desktop
class SpecialMobileContributions extends SpecialMobileHistory {
	// Note we do not redirect to Special:History/$par to allow the parameter to be used for usernames
	protected $specialPageName = 'Contributions';
	/**  @var User */
	protected $user;
	/**  @var MWTimestamp */
	protected $lastDate;

	public function executeWhenAvailable( $par = '' ) {
		wfProfileIn( __METHOD__ );
		if ( $par ) {
			// enter article history view
			$this->user = User::newFromName( $par );
			if ( $this->user && $this->user->idForName() ) {
				$this->renderHeaderBar( $this->user->getUserPage() );
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
		if ( $this->user ) {
			$conds = array(
				'rev_user' => $this->user->getID(),
			);
		} else {
			$conds = array();
		}
		return $conds;
	}

	protected function renderFeedItemHtml( $ts, $diffLink ='', $username = '',
		$comment = '', $title = false, $isAnon = false, $bytes = 0
	) {
		// Stop username from being rendered
		$username = false;
		parent::renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title, false, $bytes );
	}

}
