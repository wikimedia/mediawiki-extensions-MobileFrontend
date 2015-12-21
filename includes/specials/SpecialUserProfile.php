<?php
/**
 * SpecialUserProfile.php
 */

/**
 * Show a mobile specific user profile page
 */
class SpecialUserProfile extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Whether this special page has or has not a desktop version */
	protected $hasDesktopVersion = true;

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
	 * Get the link to users talk page
	 * @return string
	 */
	protected function getTalkLink() {
		// replace secondary icon
		$attrs = array(
			'class' => MobileUI::iconClass( 'talk', 'before', MobileUI::buttonClass() ),
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
	 * Show error page, that the user does not exist, or no user provided
	 * @param string $msgKey Message key to use as error message body
	 * @return string
	 */
	protected function displayNoUserError( $msgKey ) {
		$out = $this->getOutput();

		// generate a user friendly error with a meaningful message
		$html = MobileUI::contentElement(
			MobileUI::errorBox(
				Html::element( 'h2', array(), $this->msg( 'mobile-frontend-profile-error' ) ) .
				Html::element( 'p', array(), $this->msg( $msgKey ) )
			)
		);

		// return page with status code 404, instead of 200 and output the error page
		$out->setStatusCode( 404 );
		$out->addHtml( $html );
	}

	/**
	 * Get the footer with user information (when joined, how
	 * many edits/uploads, visit user page and talk page)
	 * @return string
	 */
	protected function getUserFooterData() {
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

		$username = $this->targetUser->getName();

		return array(
			'editsSummary' => $this->msg( $msg, $username )->
				numParams( $units, $editCount, $uploadCount )->parse(),
			'linkUserPage' => Linker::link( $this->targetUser->getUserPage(),
						$this->msg( 'mobile-frontend-profile-userpage-link', $username )->escaped()
					),
			'linkTalk' => $this->getTalkLink(),
		);
	}

	public function getTemplateData( $templateParser ) {
		$data = $this->getUserFooterData();
		$rev = $this->userInfo->getLastEdit();
		$cards = array();
		if ( $rev ) {
			$daysAgo = $this->getDaysAgo(
				new MWTimestamp( wfTimestamp( TS_UNIX, $rev->getTimestamp() ) )
			);
			$cards[] = $templateParser->processTemplate( 'userprofileCard', array(
				'caption' => $this->msg( 'mobile-frontend-profile-last-edit',
						$rev->getTitle(),
						$daysAgo,
						$this->targetUser->getName()
					)->parse(),
				)
			);
		}
		$thank = $this->userInfo->getLastThanking();
		if ( $thank ) {
			$user = $thank['user'];
			$cards[] = $templateParser->processTemplate( 'userprofileCard', array(
				'caption' => $this->msg( 'mobile-frontend-profile-last-thank',
						$user,
						$this->targetUser
					)->parse(),
				)
			);
		}

		Hooks::run( 'SpecialUserProfileCards', array( &$cards, $this->targetUser ) );
		if ( count( $cards ) > 0 ) {
			$data['hasActivity'] = true;
			$data['heading'] = $this->msg( 'mobile-frontend-profile-activity-heading' )->text();
			$data['cards'] = $cards;
		}
		return $data;
	}

	/**
	 * Render the page
	 * @param string $par The username of the user to display
	 */
	public function executeWhenAvailable( $par ) {
		$out = $this->getOutput();
		$this->setHeaders();
		$out->addJsConfigVars( array( 'wgMFMaxDescriptionChars' => self::MAX_DESCRIPTION_CHARS ) );
		if ( $par ) {
			$this->targetUser = User::newFromName( $par );
			$pageTitle = $this->targetUser ? $this->targetUser->getName() : $par;
			$out->setPageTitle( $pageTitle );
			// Make sure this is a valid registered user and not an invalid username (e.g. ip see bug 56822)
			if ( $this->targetUser && $this->targetUser->getId() ) {
				$context = MobileContext::singleton();
				// if in beta redirect to the user page, i.e. User:Username
				if ( $context->isBetaGroupMember() ) {
					$redirectTitle = Title::makeTitle( NS_USER, $this->targetUser->getName() );
					$out->redirect( $redirectTitle->getLocalURL() );
				} else {
					// Prepare content
					$templateParser = new TemplateParser( __DIR__ );
					$this->userInfo = new MobileUserInfo( $this->targetUser );
					$html = $templateParser->processTemplate( 'userprofile',
						$this->getTemplateData( $templateParser ) );
					$out->addHtml( $html );
				}
			} else {
				$this->displayNoUserError( 'mobile-frontend-profile-nouser' );
			}
		} else {
			$out->setPageTitle( $this->msg( 'mobile-frontend-profile-title' ) );
			$this->displayNoUserError( 'mobile-frontend-profile-noargs' );
		}
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
