<?php

class SpecialUserProfile extends MobileSpecialPage {
	const IMAGE_WIDTH = 320;

	protected $mode = 'beta';
	protected $disableSearchAndFooter = false;

	/**
	 * Maximum number of characters to display as the user description
	 */
	const MAX_DESCRIPTION_CHARS = 255;

	/**
	 * @var User
	 */
	private $targetUser;
	/**
	 * @var MobileUserInfo
	 */
	private $userInfo;
	/**
	 * The user's description of himself or herself
	 * @var String
	 */
	public $userDescription;
	/**
	 * Whether or not the page is editable by the current user
	 * @var Boolean
	 */
	private $editable = false;

	public function __construct() {
		parent::__construct( 'UserProfile' );
	}

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
		$img = Html::openElement( 'div', array( 'class' => 'card' ) ) .
			Html::openElement( 'a', array( 'class' => 'container image', 'href' => $title->getLocalUrl() ) ) .
			Html::element( 'img', array(
				// uset MediaTransformOutput::getUrl, unfortunately MediaTransformOutput::toHtml
				// returns <img> tag with fixed height which causes the image to be deformed when
				// used with max-width
				'src' => $file->transform( array( 'width' => self::IMAGE_WIDTH ) )->getUrl(),
				// FIXME: Add more meaningful alt text
				'alt' => $title->getText(),
			) ) .
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
	 * Returns HTML to show the user's description as well as a hidden form for editing
	 * the description.
	 *
	 * @return String HTML
	 *
	 */
	protected function getUserSummary() {
		$user = $this->getUser();
		$out = '';
		if ( $this->editable || $this->userDescription ) {
			$out = Html::openElement( 'div', array( 'class' => 'user-description-container' ) );
				if ( $this->userDescription ) {
					$out .= Html::openElement( 'p', array( 'class' => 'user-description' ) );
					// FIXME: Use quotation-marks message
					// NOTE: This outputs WikiText as raw text (not parsed). This is on
					// purpose, but may be changed in the future.
					$out .= htmlspecialchars( $this->userDescription );
					$out .= Html::closeElement( 'p' );
				} else if ( $this->editable ) {
					$out .= Html::openElement( 'p', array( 'class' => 'user-description-placeholder' ) );
					$out .= $this->msg( 'mobile-frontend-profile-description-placeholder',
						$this->targetUser );
					$out .= Html::closeElement( 'p' );
				}
			$out .= Html::closeElement( 'div' );
		}
		return $out;
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
			$title = $thank['title'];
			$imageHtml = '';
			if ( defined( 'PAGE_IMAGES_INSTALLED' ) ) {
				$file = PageImages::getPageImage( $title );
				if ( $file ) {
					$thumb = $file->transform( array( 'width' => self::IMAGE_WIDTH ) );
					if ( $thumb && $thumb->getUrl() ) {
						$imageHtml = Html::element( 'img',
							array( 'src' => wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT ) )
						);
					}
				}
			}
			$html = Html::openElement( 'div', array( 'class' => 'card' ) )
				. Html::openElement( 'div', array( 'class' => 'container' ) )
				. $imageHtml
				. Html::openElement( 'div', array( 'class' => 'caption' ) )
				. $this->msg( 'mobile-frontend-profile-last-thanked',
					$user,
					$title->getFullText(),
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
			$imageHtml = '';
			if ( defined( 'PAGE_IMAGES_INSTALLED' ) ) {
				$title = $rev->getTitle();
				$file = PageImages::getPageImage( $title );
				if ( $file ) {
					$thumb = $file->transform( array( 'width' => self::IMAGE_WIDTH ) );
					if ( $thumb && $thumb->getUrl() ) {
						$imageHtml = Html::element( 'img',
							array( 'src' => wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT ) )
						);
					}
				}
			}
			$html = Html::openElement( 'div', array( 'class' => 'card' ) )
				. Html::openElement( 'div', array( 'class' => 'container image' ) )
				. $imageHtml
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

	protected function getTalkLink() {
		// replace secondary icon
		$attrs = array(
			'class' => 'talk',
			'href' => $this->targetUser->getTalkPage()->getLocalUrl(),
		);
		return Html::element( 'a', $attrs, $this->msg( 'mobile-frontend-profile-usertalk', $this->targetUser->getName() ) );
	}

	protected function getHtmlNoUser() {
		$html = Html::openElement( 'div', array( 'class' => 'alert error' ) );
		$html .= Html::element( 'h2', array(), $this->msg( 'mobile-frontend-profile-error' ) );
		$html .= Html::element( 'p', array(), $this->msg( 'mobile-frontend-profile-nouser' ) );
		$html .= Html::closeElement( 'div' );
		return $html;
	}

	protected function getUserFooterHtml() {
		$fromDate = $this->targetUser->getRegistration();
		$editCount = $this->targetUser->getEditCount();
		$uploadCount = $this->userInfo->countRecentUploads( $fromDate );
		$ts = new MWTimestamp( wfTimestamp( TS_UNIX, $fromDate ) );
		$diff = $ts->diff( new MWTimestamp() );
		if ( $diff->y ) {
			$msg = 'mobile-frontend-profile-footer-years';
			$units = $diff->y;
		} elseif ( $diff->m ) {
			$msg = 'mobile-frontend-profile-footer-months';
			$units = $diff->m;
		} else {
			$msg = 'mobile-frontend-profile-footer-days';
			$units = $diff->d;
		}

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
			. Html::closeElement( 'div' );
	}

	public function executeWhenAvailable( $par ) {
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$request = $this->getRequest();
		$this->addModules();
		$out->addModuleStyles( 'mobile.special.styles' );
		$out->setProperty( 'unstyledContent', true );
		$out->addJsConfigVars( array( 'wgMFMaxDescriptionChars' => self::MAX_DESCRIPTION_CHARS ) );
		$out->setPageTitle( $this->msg( 'mobile-frontend-profile-title' ) );
		if ( $par ) {
			$this->targetUser = User::newFromName( $par );
			// Make sure this is a valid registered user and not an invalid username (e.g. ip see bug 56822)
			if ( $this->targetUser && $this->targetUser->getId() ) {

				// See if user is allowed to edit this user profile
				$user = $this->getUser();
				if ( $user->isLoggedIn() &&
					$user->isAllowed( 'edit' ) &&
					$user->getId() === $this->targetUser->getId()
				) {
					$this->editable = true;
				}

				// Prepare content
				$this->userInfo = new MobileUserInfo( $this->targetUser );
				$activityHtml = $this->getLastEditHtml() . $this->getLastUploadHtml()
					. $this->getLastThanksHtml();

				// FIXME: There's probably a cleaner way to do this.
				$userDescPageName = $this->targetUser->getUserPage()->getPrefixedText() . '/UserProfileIntro';
				$this->userDescription = $this->getLang()->truncate( $this->getWikiPageText( $userDescPageName ),
					self::MAX_DESCRIPTION_CHARS );

				$summary = $this->getUserSummary();
				$talkLink = $this->getTalkLink();
				if ( $summary ) {
					$lead = $summary . $talkLink;
				} else {
					$lead = '';
				}

				$html = Html::element( 'h1', array(), $this->targetUser->getName() )
					. Html::openElement( 'div', array( 'class' => 'profile content' ) )
					. $lead;

				if ( $activityHtml ) {
					$html .= Html::openElement( 'h2' )
						. $this->msg( 'mobile-frontend-profile-activity-heading' )
						. Html::closeElement( 'h2' )
						. Html::openElement( 'div', array( 'class' => 'card-container' ) )
						. $activityHtml
						. Html::closeElement( 'div' );
				}
				if ( !$summary ) {
					$html .= $talkLink;
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
	 * @param string $wikiPageTitle The title of the WikiPage
	 * @return string The text of the page
	 */
	protected function getWikiPageText( $wikiPageTitle ) {
		$text = '';
		$title = Title::newFromText( $wikiPageTitle );
		if ( $title ) {
			$wikiPage = WikiPage::newFromID( $title->getArticleID() );
			if ( $wikiPage ) {
				$content = $wikiPage->getContent();
				if ( $content ) {
					$text = ContentHandler::getContentText( $content );
				}
			}
		}
		return $text;
	}
}
