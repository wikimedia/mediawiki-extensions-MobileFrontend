<?php
// FIXME: On Special:Contributions add ability to filter a la desktop
class SpecialMobileContributions extends SpecialMobileHistory {
	// Note we do not redirect to Special:History/$par to allow the parameter to be used for usernames
	protected $specialPageName = 'Contributions';
	/**  @var User */
	protected $user;
	/**  @var MWTimestamp */
	protected $lastDate;
	/**  @var bool Whether to show the username in results or not */
	protected $showUsername = false;

	/**
	 * Gets HTML to place in the header bar
	 * @param {Title} title: The page to link to
	 * @return string: HTML representing the link in the header bar
	 */
	protected function getHeaderBarLink( $title ) {
		return Html::element( 'a',
			array(
				'class' => 'mw-mf-user',
				'href' => SpecialPage::getTitleFor( 'UserProfile', $title->getText() )->getLocalUrl(),
			),
			$title->getText() );
	}

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
}
