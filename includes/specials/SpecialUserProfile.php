<?php

class SpecialUserProfile extends MobileSpecialPage {
	/**
	 * @var User
	 */
	private $targetUser;
	/**
	 * @var MobileUserInfo
	 */
	private $userInfo;

	public function __construct() {
		parent::__construct( 'UserProfile' );
	}

	protected function getDaysAgo( MWTimestamp $ts ) {
		$now = new MWTimestamp();
		$diff = $ts->diff( $now );
		return $diff->days;
	}

	/**
	 * Returns HTML to show the last upload or a message where there is no last upload
	 *
	 * @return String HTML string representing the last upload by the user
	 */
	protected function getLastUpload() {
		wfProfileIn( __METHOD__ );

		$file = $this->userInfo->getLastUpload();
		if ( !$file ) {
			wfProfileOut( __METHOD__ );
			return '';
		}

		$title = $file->getTitle();
		$ts = new MWTimestamp( $file->getTimestamp() );
		$daysAgo = $this->getDaysAgo( $ts );
		$img = Html::openElement( 'div', array( 'class' => 'last-upload section-end' ) ) .
			Html::openElement( 'a', array( 'href' => $title->getLocalUrl() ) ) .
			Html::element( 'img', array(
				// uset MediaTransformOutput::getUrl, unfortunately MediaTransformOutput::toHtml
				// returns <img> tag with fixed height which causes the image to be deformed when
				// used with max-width
				'src' => $file->transform( array( 'width' => 320 ) )->getUrl(),
				// FIXME: Add more meaningful alt text
				'alt' => $title->getText(),
			) ) .
			Html::openElement( 'div', array( 'class' => 'thumbcaption secondary-statement' ) ) .
			$this->msg( 'mobile-frontend-profile-last-upload-caption', $this->targetUser->getName() )->numParams( $daysAgo )->parse() .
			Html::closeElement( 'div' ) .
			Html::closeElement( 'a' ) .
			Html::closeElement( 'div' );
		wfProfileOut( __METHOD__ );
		return $img;
	}

	protected function getUserSummary() {
		$registered = $this->targetUser->getRegistration();
		$editCount = $this->targetUser->getEditCount();
		$ts = new MWTimestamp( wfTimestamp( TS_UNIX, $registered ) );
		$daysAgo = $this->getDaysAgo( $ts );

		$name = $this->targetUser->getName();
		if( $editCount < 50 ) {
			$role = $this->msg( 'mobile-frontend-profile-user-desc-1', $name );
		} else if ( $editCount < 5000 ) {
			$role = $this->msg( 'mobile-frontend-profile-user-desc-2', $name );
		} else {
			$role = $this->msg( 'mobile-frontend-profile-user-desc-3', $name );
		}

		return Html::openElement( 'div', array( 'class' => 'section section-registered' ) ) .
			Html::element( 'p', array( 'class' => 'statement' ),
			$this->msg( 'mobile-frontend-profile-registration', $name )->numParams( $daysAgo, $editCount )->parse() ) .
			Html::element( 'p', array( 'class' => 'secondary-statement section-end' ), $role ) .
			Html::closeElement( 'div' );
	}

	protected function getRecentActivityHtml() {
		wfProfileIn( __METHOD__ );
		// render
		$fromDate = time() - ( 3600 * 24 * 30 );
		$count = $this->userInfo->countRecentEdits( $fromDate );
		$uploadCount = $this->userInfo->countRecentUploads( $fromDate );

		$msgContributions = $this->msg( 'mobile-frontend-profile-contributions', $this->targetUser->getName() )
			->numParams( $count, $uploadCount )
			->parse();

		$lastUploadHtml = $this->getLastUpload();
		$activityClassName = $lastUploadHtml? 'section section-activity' : 'section section-activity section-end';
		$html =
			Html::openElement( 'div', array( 'class' => $activityClassName ) ) .
			Html::openElement( 'p', array( 'class' => 'statement' ) ) .
			$msgContributions .
			Html::closeElement( 'p' );

		if ( $lastUploadHtml ) {
			$html .= $lastUploadHtml;
		}

		$html .= Html::closeElement( 'div' );

		wfProfileOut( __METHOD__ );
		return $html;
	}

	protected function getLastThanks() {
		wfProfileIn( __METHOD__ );
		$html = '';
		$thank = $this->userInfo->getLastThanking();
		if ( $thank ) {
			$user = $thank['user'];
			$title = $thank['title'];
			$html = Html::openElement( 'div', array( 'class' => 'section section-thanks statement section-end' ) );
			$html .= $this->msg( 'mobile-frontend-profile-last-thanked',
				$user,
				$title->getFullText(),
				$this->targetUser
			)->parse();
			$html .= '</div>';
		}
		wfProfileOut( __METHOD__ );
		return $html;
	}

	protected function setUserProfileUIElements() {
		// replace secondary icon
		$attrs = array(
			'class' => 'talk',
			'id' => 'secondary-button',
			'href' => $this->targetUser->getTalkPage()->getLocalUrl(),
		);
		$secondaryButton = Html::element( 'a', $attrs, $this->msg( 'mobile-frontend-profile-usertalk' ) );

		// define heading
		$heading = Html::element( 'h1', array(), $this->targetUser->getName() );

		// set values
		/** @var SkinMobile $skin */
		$skin = $this->getSkin();
		$skin->setTemplateVariable( 'secondaryButton', $secondaryButton );
		$skin->setTemplateVariable( 'specialPageHeader', $heading );
	}

	// FIXME: Change this into 404 error
	protected function getHtmlNoArg() {
		$html = Html::element( 'p', array(), $this->msg( 'mobile-frontend-profile-noargs' ) );
		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			$profileUrl = SpecialPage::getTitleFor( $this->getName(), $user->getName() )->getLocalURL();
			$html .= Html::openElement( 'p', array() );
			$html .= Html::element( 'a', array( 'href' => $profileUrl ), $this->msg( 'mobile-frontend-profile-yours' )->plain() );
			$html .= Html::closeElement( 'p', array() );
		}
		return $html;
	}

	// FIXME: Change this into 404 error (and possibly merge with getHtmlNoArg)
	protected function getHtmlNoUser() {
		$html = Html::element( 'p', array(), $this->msg( 'mobile-frontend-profile-nouser' ) );
		$user = $this->getUser();
		if ( $user->isLoggedIn() ) {
			$profileUrl = SpecialPage::getTitleFor( $this->getName(), $user->getName() )->getLocalURL();
			$html .= Html::openElement( 'p', array() );
			$html .= Html::element( 'a', array( 'href' => $profileUrl ), $this->msg( 'mobile-frontend-profile-yours' )->plain() );
			$html .= Html::closeElement( 'p', array() );
		}
		return $html;
	}

	public function getHtmlBetaAlphaOptIn() {
		return Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
			$this->msg( 'mobile-frontend-requires-optin' )->parse() .
			Html::closeElement( 'div' );
	}

	public function execute( $par = '' ) {
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$this->addModules();
		$out->setPageTitle( $this->msg( 'mobile-frontend-profile-title' ) );
		$ctx = MobileContext::singleton();
		if ( !$ctx->isBetaGroupMember() ) {
			$html = $this->getHtmlBetaAlphaOptIn();
		} else if ( $par ) {
			$this->targetUser = User::newFromName( $par );
			// Make sure this is a valid registered user
			if ( $this->targetUser->getId() ) {
				// prepare content
				$this->userInfo = new MobileUserInfo( $this->targetUser );
				$this->setUserProfileUIElements();
				$link = Linker::link( $this->targetUser->getUserPage(),
					$this->msg( 'mobile-frontend-profile-userpage-link' )->escaped(),
					array( 'class' => 'statement section user-page section-end' )
				);
				$html = Html::openElement( 'div', array( 'class' => 'profile' ) )
					. $this->getUserSummary()
					. $this->getRecentActivityHtml()
					. $this->getLastThanks()
					. $link
					. Html::closeElement( 'div' );
			} else {
				$html = $this->getHtmlNoUser();
			}
		} else {
			$html = $this->getHtmlNoArg();
		}
		wfProfileOut( __METHOD__ );
		$out->addHtml( $html );
	}
}
