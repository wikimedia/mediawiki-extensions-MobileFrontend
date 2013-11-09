<?php

class SpecialUserProfile extends MobileSpecialPage {
	const IMAGE_WIDTH = 320;

	protected $mode = 'beta';
	protected $disableSearchAndFooter = false;

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
			Html::openElement( 'a', array( 'class' => 'container', 'href' => $title->getLocalUrl() ) ) .
			Html::element( 'img', array(
				// uset MediaTransformOutput::getUrl, unfortunately MediaTransformOutput::toHtml
				// returns <img> tag with fixed height which causes the image to be deformed when
				// used with max-width
				'src' => $file->transform( array( 'width' => self::IMAGE_WIDTH ) )->getUrl(),
				// FIXME: Add more meaningful alt text
				'alt' => $title->getText(),
			) ) .
			Html::openElement( 'div', array( 'class' => 'caption' ) ) .
			$this->msg( 'mobile-frontend-profile-last-upload-caption', $this->targetUser->getName() )->numParams( $daysAgo )->parse() .
			Html::closeElement( 'div' ) .
			Html::closeElement( 'a' ) .
			Html::closeElement( 'div' );
		wfProfileOut( __METHOD__ );
		return $img;
	}

	protected function getUserSummary() {
		// @todo: Story 1218
		return '';
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
			$html = Html::openElement( 'div', array( 'class' => 'card' ) )
				. Html::openElement( 'div', array( 'class' => 'container caption' ) )
				. $this->msg( 'mobile-frontend-profile-last-thanked',
					$user,
					$title->getFullText(),
					$this->targetUser
				)->parse()
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
				. Html::openElement( 'div', array( 'class' => 'container' ) )
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
		return Html::element( 'a', $attrs, $this->msg( 'mobile-frontend-profile-usertalk' ) );
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
		$this->addModules();
		$out->setPageTitle( $this->msg( 'mobile-frontend-profile-title' ) );
		if ( $par ) {
			$this->targetUser = User::newFromName( $par );
			// Make sure this is a valid registered user
			if ( $this->targetUser->getId() ) {
				// prepare content
				$this->userInfo = new MobileUserInfo( $this->targetUser );
				$activityHtml = $this->getLastUploadHtml() . $this->getLastThanksHtml()
					. $this->getLastEditHtml();
				$html = Html::openElement( 'div', array( 'class' => 'profile' ) )
					. Html::element( 'h1', array(), $this->targetUser->getName() )
					. $this->getUserSummary()
					. $this->getTalkLink();
				if ( $activityHtml ) {
					$html .= Html::openElement( 'h2' )
						. $this->msg( 'mobile-frontend-profile-activity-heading' )
						. Html::closeElement( 'h2' ) . $activityHtml;
				}
				$html .= $this->getUserFooterHtml()
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
