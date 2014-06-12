<?php
/**
 * SpecialUserProfile.php
 */

/**
 * Show a mobile specific user profile page
 */
class SpecialUserProfile extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Whether this special page has or has not a desktop version */
	protected $hasDesktopVersion = false;

	/**
	 * Maximum number of characters to display as the user description
	 */
	const MAX_DESCRIPTION_CHARS = 255;

	/** @var User $targetUser The user object of the user to show on page */
	private $targetUser;
	/** @var MobileUserInfo $userInfo MobileUserInfo with informationen about the user */
	private $userInfo;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'UserProfile' );
	}

	/**
	 * Get the difference between now and the timestamp provided
	 * @param MWTimestamp $ts The timstamp
	 * @return integer The difference in days
	 */
	protected function getDaysAgo( MWTimestamp $ts ) {
		$now = new MWTimestamp();
		$diff = $ts->diff( $now );
		return $diff->days;
	}

	/**
	 * Returns HTML to show the last upload or an empty string when there has been no last upload
	 *
	 * @return String HTML string representing the last upload by the user
	 */
	protected function getLastUploadHtml() {
		wfProfileIn( __METHOD__ );

		$file = $this->userInfo->getLastUpload();
		if ( !$file ) {
			wfProfileOut( __METHOD__ );
			return '';
		}

		$title = $file->getTitle();
		$ts = new MWTimestamp( $file->getTimestamp() );
		$daysAgo = $this->getDaysAgo( $ts );
		$page = new MobilePage( $title, $file );
		$img = Html::openElement( 'div', array( 'class' => 'card' ) ) .
			Html::openElement( 'a', array(
				'class' => 'container image',
				'href' => $title->getLocalUrl() )
			) .
			$page->getMediumThumbnailHtml() .
			Html::openElement( 'div', array( 'class' => 'caption' ) ) .
			$this->msg( 'mobile-frontend-profile-last-upload-caption' )
				->numParams( $daysAgo ) // $1
				->params( $this->targetUser->getName() ) // $2
				->parse() .
			Html::closeElement( 'div' ) .
			Html::closeElement( 'a' ) .
			Html::closeElement( 'div' );
		wfProfileOut( __METHOD__ );
		return $img;
	}

	/**
	 * Returns HTML to show the last thanking or an empty string if the user has never been thanked
	 *
	 * @return String HTML string representing the last thank by the user
	 */
	protected function getLastThanksHtml() {
		wfProfileIn( __METHOD__ );
		$html = '';
		$thank = $this->userInfo->getLastThanking();
		if ( $thank ) {
			$user = $thank['user'];
			$html = Html::openElement( 'div', array( 'class' => 'card' ) )
				. Html::openElement( 'div', array( 'class' => 'container' ) )
				. MobilePage::getPlaceHolderThumbnailHtml( 'list-thumb-thanks' )
				. Html::openElement( 'div', array( 'class' => 'caption' ) )
				. $this->msg( 'mobile-frontend-profile-last-thank',
					$user,
					$this->targetUser
				)->parse()
				. '</div>'
				. '</div>'
				. '</div>';
		}
		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * Returns HTML to show the last edit or an empty string when the user has not edited
	 *
	 * @return String HTML string representing the last edit by the user
	 */
	protected function getLastEditHtml() {
		wfProfileIn( __METHOD__ );
		$rev = $this->userInfo->getLastEdit();
		if ( $rev ) {
			$daysAgo = $this->getDaysAgo( new MWTimestamp( wfTimestamp( TS_UNIX, $rev->getTimestamp() ) ) );
			$page = new MobilePage( $rev->getTitle() );
			if ( $page->hasThumbnail() ) {
				$thumbnail = $page->getMediumThumbnailHtml();
			} else {
				$thumbnail = $page->getPlaceHolderThumbnailHtml( 'list-thumb-edit' );
			}
			$html = Html::openElement( 'div', array( 'class' => 'card' ) )
				. Html::openElement( 'div', array( 'class' => 'container image' ) )
				. $thumbnail
				. Html::openElement( 'div', array( 'class' => 'caption' ) )
				. $this->msg( 'mobile-frontend-profile-last-edit',
					$rev->getTitle(),
					$daysAgo,
					$this->targetUser->getName()
				)->parse()
				. '</div>'
				. '</div>'
				. '</div>';
		} else {
			$html = '';
		}

		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * Get the link to users talk page
	 * @return string
	 */
	protected function getTalkLink() {
		// replace secondary icon
		$attrs = array(
			'class' => 'icon-talk-blue button mw-ui-button icon icon-text',
			'href' => $this->targetUser->getTalkPage()->getLocalUrl(),
		);
		// FIXME: What if this is the user's own profile? Should we change the message?
		return Html::element(
			'a',
			$attrs,
			$this->msg( 'mobile-frontend-profile-usertalk',
				$this->targetUser->getName() )
		);
	}

	/**
	 * Get Html to show, that the user does not exist, or no user provided
	 * @return string
	 */
	protected function getHtmlNoUser() {
		$html = Html::openElement( 'div', array( 'class' => 'alert error' ) );
		$html .= Html::element( 'h2', array(), $this->msg( 'mobile-frontend-profile-error' ) );
		$html .= Html::element( 'p', array(), $this->msg( 'mobile-frontend-profile-nouser' ) );
		$html .= Html::closeElement( 'div' );
		return $html;
	}

	/**
	 * Get the footer with user information (when joined, how
	 * many edits/uploads, visit user page and talk page)
	 * @return string
	 */
	protected function getUserFooterHtml() {
		$fromDate = $this->targetUser->getRegistration();
		$ts = new MWTimestamp( wfTimestamp( TS_UNIX, $fromDate ) );
		$diff = $ts->diff( new MWTimestamp() );
		if ( $fromDate === null ) {
			// User was registered in pre-historic times when registration wasn't recorded
			$msg = 'mobile-frontend-profile-footer-ancient';
			$units = 0;
			$fromDate = '20010115000000'; // No users before that date
		} elseif ( $diff->y ) {
			$msg = 'mobile-frontend-profile-footer-years';
			$units = $diff->y;
		} elseif ( $diff->m ) {
			$msg = 'mobile-frontend-profile-footer-months';
			$units = $diff->m;
		} else {
			$msg = 'mobile-frontend-profile-footer-days';
			$units = $diff->d;
		}
		$editCount = $this->targetUser->getEditCount();
		$uploadCount = $this->userInfo->countRecentUploads( $fromDate );

		// Ensure that the upload count is compatible with the i18n message
		if ( $uploadCount > 500 ) {
			$uploadCount = 500;
		}

		return Html::openElement( 'div', array( 'class' => 'footer' ) )
			. Html::openElement( 'div' )
			. $this->msg( $msg, $this->targetUser->getName() )->
				numParams( $units, $editCount, $uploadCount )->parse()
			. Html::closeElement( 'div' )
			. Html::openElement( 'div' )
			. Linker::link( $this->targetUser->getUserPage(),
				$this->msg( 'mobile-frontend-profile-userpage-link' )->escaped()
			)
			. Html::closeElement( 'div' )
			. $this->getTalkLink();
	}

	/**
	 * Render the page
	 * @param string $par The username of the user to display
	 */
	public function executeWhenAvailable( $par ) {
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$this->setHeaders();
		$out->addJsConfigVars( array( 'wgMFMaxDescriptionChars' => self::MAX_DESCRIPTION_CHARS ) );
		if ( $par ) {
			$this->targetUser = User::newFromName( $par );
			$pageTitle = $this->targetUser ? $this->targetUser->getName() : $par;
			$out->setPageTitle( $pageTitle );
			// Make sure this is a valid registered user and not an invalid username (e.g. ip see bug 56822)
			if ( $this->targetUser && $this->targetUser->getId() ) {

				// Prepare content
				$this->userInfo = new MobileUserInfo( $this->targetUser );
				$activityHtml = $this->getLastEditHtml() . $this->getLastUploadHtml()
					. $this->getLastThanksHtml();

				$html = Html::openElement( 'div', array( 'class' => 'profile content' ) );

				if ( $activityHtml ) {
					$html .= Html::openElement( 'div', array( 'class' => 'card-container' ) )
						. Html::openElement( 'h2' )
						. $this->msg( 'mobile-frontend-profile-activity-heading' )
						. Html::closeElement( 'h2' )
						. $activityHtml
						. Html::closeElement( 'div' );
				}
				$html .= $this->getUserFooterHtml()
					. Html::closeElement( 'div' );

			} else {
				$html = $this->getHtmlNoUser();
			}
			$out->addHtml( $html );
		} else {
			wfHttpError( 404, $this->msg( 'mobile-frontend-profile-error' )->text(),
				$this->msg( 'mobile-frontend-profile-noargs' )->text() );
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * Retrieve the text of a WikiPage
	 * @param Title $title The title object of the WikiPage
	 * @return string The text of the page
	 */
	protected function getWikiPageText( Title $title ) {
		$text = '';
		$wikiPage = WikiPage::newFromID( $title->getArticleID() );
		if ( $wikiPage ) {
			$content = $wikiPage->getContent();
			if ( $content ) {
				$text = ContentHandler::getContentText( $content );
			}
		}
		return $text;
	}
}
