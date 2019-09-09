<?php

use MediaWiki\Revision\RevisionRecord;

/**
 * This is an abstract class intended for use by special pages that consist primarily of
 * a list of pages, for example, Special:Watchlist or Special:History.
 */
abstract class MobileSpecialPageFeed extends MobileSpecialPage {
	/**  @var boolean $showUsername Whether to show the username in results or not */
	protected $showUsername = true;
	protected $lastDate;
	/** @var Title|null */
	protected $title;

	/**
	 * Render the special page content
	 * @param string|null $par parameters submitted as subpage
	 */
	public function execute( $par ) {
		$out = $this->getOutput();
		$out->addModuleStyles( [
			'mobile.special.pagefeed.styles',
			'mobile.special.user.icons'
		] );
		$this->setHeaders();
		$out->setProperty( 'unstyledContent', true );
		parent::execute( $par );
	}

	/**
	 * Formats an edit comment
	 * @param string $comment The raw comment text
	 * @param Title $title The title of the page that was edited
	 * @fixme Duplication with SpecialMobileWatchlist
	 * @suppress SecurityCheck-DoubleEscaped phan false positive
	 *
	 * @return string HTML code
	 */
	protected function formatComment( $comment, $title ) {
		if ( $comment === '' ) {
			$comment = $this->msg( 'mobile-frontend-changeslist-nocomment' )->plain();
		} else {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = htmlspecialchars( Sanitizer::stripAllTags( $comment ) );
		}
		return $comment;
	}

	/**
	 * Renders a date header when necessary.
	 * FIXME: Juliusz won't like this function.
	 * @param string $date The date of the current item
	 */
	protected function renderListHeaderWhereNeeded( $date ) {
		if ( !isset( $this->lastDate ) || $date !== $this->lastDate ) {
			$output = $this->getOutput();
			if ( isset( $this->lastDate ) ) {
				$output->addHTML(
					Html::closeElement( 'ul' )
				);
			}
			$output->addHTML(
				Html::element( 'h2', [ 'class' => 'list-header' ], $date ) .
				Html::openElement( 'ul', [
						'class' => 'page-list diff-summary-list side-list'
					]
				)
			);
		}
		$this->lastDate = $date;
	}

	/**
	 * Generates revision text based on user's rights and preference
	 * @param Revision $rev
	 * @param User $user viewing the revision
	 * @param bool $unhide whether the user wants to see hidden comments
	 *   if the user doesn't have prmission comment will display as rev-deleted-comment
	 * @return string plain test label
	 */
	protected function getRevisionCommentHTML( $rev, $user, $unhide ) {
		if ( $rev->userCan( RevisionRecord::DELETED_COMMENT, $user ) ) {
			if ( $rev->isDeleted( RevisionRecord::DELETED_COMMENT ) && !$unhide ) {
				$comment = $this->msg( 'rev-deleted-comment' )->escaped();
			} else {
				$comment = $rev->getComment( RevisionRecord::FOR_THIS_USER, $user );
				// escape any HTML in summary and add CSS for any auto-generated comments
				$comment = $this->formatComment( $comment, $this->title );
			}
		} else {
			// Confusingly "Revision::userCan" Determines if the current user is
			// allowed to view a particular field of this revision, /if/ it's marked as
			// deleted. This will only get executed in event a comment has been deleted
			// and user cannot view it.
			$comment = $this->msg( 'rev-deleted-comment' )->escaped();
		}
		return $comment;
	}

	/**
	 * Generates username text based on user's rights and preference
	 * @param Revision $rev
	 * @param User $user viewing the revision
	 * @param bool $unhide whether the user wants to see hidden usernames
	 * @return string plain test label
	 */
	protected function getUsernameText( $rev, $user, $unhide ) {
		$userId = $rev->getUser( RevisionRecord::FOR_THIS_USER, $user );
		if ( $userId === 0 ) {
			$username = IP::prettifyIP( $rev->getUserText( RevisionRecord::RAW ) );
		} else {
			$username = $rev->getUserText( RevisionRecord::FOR_THIS_USER, $user );
		}
		if (
			!$rev->userCan( RevisionRecord::DELETED_USER, $user ) ||
			( $rev->isDeleted( RevisionRecord::DELETED_USER ) && !$unhide )
		) {
			$username = $this->msg( 'rev-deleted-user' )->text();
		}
		return $username;
	}

	/**
	 * Renders an item in the feed
	 * @param MWTimestamp $ts The time the edit occurred
	 * @param string $diffLink url to the diff for the edit
	 * @param string $username The username of the user that made the edit (absent if anonymous)
	 * @param string $comment The edit summary, HTML escaped
	 * @param Title|null $title The title of the page that was edited
	 * @param bool $isAnon Is the edit anonymous?
	 * @param int|null $bytes Net number of bytes changed or null if not applicable
	 * @param bool $isMinor Is the edit minor?
	 *
	 * @todo FIXME: use an array as an argument?
	 */
	protected function renderFeedItemHtml( $ts, $diffLink = '', $username = '', $comment = '',
		$title = null, $isAnon = false, $bytes = 0, $isMinor = false
	) {
		$output = $this->getOutput();
		$user = $this->getUser();
		$lang = $this->getLanguage();

		if ( $isAnon ) {
			$usernameClass = MobileUI::iconClass( 'userAnonymous', 'before', 'mw-mf-user mw-mf-anon' );
		} else {
			$usernameClass = MobileUI::iconClass( 'userAvatar', 'before', 'mw-mf-user' );
		}

		$html = Html::openElement( 'li', [ 'class' => 'page-summary' ] );

		if ( $diffLink ) {
			$html .= Html::openElement( 'a', [ 'href' => $diffLink, 'class' => 'title' ] );
		} else {
			$html .= Html::openElement( 'div', [ 'class' => 'title' ] );
		}

		if ( $title ) {
			$html .= Html::element( 'h3', [], $title->getPrefixedText() );
		}

		if ( $username && $this->showUsername ) {
			$html .= Html::rawElement( 'p', [ 'class' => $usernameClass ],
				Html::element( 'span', [], $username )
			);
		}

		$html .= Html::rawElement(
			'p', [ 'class' => 'edit-summary component truncated-text multi-line two-line' ], $comment
		);

		if ( $isMinor ) {
			$html .= ChangesList::flag( 'minor' );
		}

		$html .= Html::openElement( 'div', [ 'class' => 'list-thumb' ] ) .
			Html::element( 'p', [ 'class' => 'timestamp' ], $lang->userTime( $ts, $user ) );

		if ( $bytes ) {
			$formattedBytes = $lang->formatNum( $bytes );
			if ( $bytes > 0 ) {
				$formattedBytes = '+' . $formattedBytes;
				$bytesClass = 'mw-mf-bytesadded';
			} else {
				$bytesClass = 'mw-mf-bytesremoved';
			}
			$html .= Html::element(
				'p',
				[
					'class' => $bytesClass,
					'dir' => 'ltr',
				],
				$formattedBytes
			);
		}

		$html .= Html::closeElement( 'div' );

		if ( $diffLink ) {
			$html .= Html::closeElement( 'a' );
		} else {
			$html .= Html::closeElement( 'div' );
		}
		$html .= Html::closeElement( 'li' );

		$output->addHTML( $html );
	}
}
