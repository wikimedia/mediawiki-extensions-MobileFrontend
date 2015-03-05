<?php

/**
 * Backwards-compatability redirect. IPs go to Special:Contributions,
 * Users go to User:$username, invalid input displays a BadTitleError
 */
class SpecialUserProfile extends RedirectSpecialPage {

	public function __construct() {
		parent::__construct( 'UserProfile' );
	}

	public function getRedirect( $par ) {
		if ( User::isIP( $par ) ) {
			return SpecialPage::getTitleFor( 'Contributions', $par );
		} else {
			$user = User::newFromName( $par );
			if ( !$user ) {
				throw new BadTitleError();
			}
			if ( $user->getId() ) {
				return $user->getUserPage();
			} else {
				return SpecialPage::getTitleFor( 'Contributions', $par );
			}
		}
	}
}
