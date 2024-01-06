<?php

use MediaWiki\Html\Html;
use MediaWiki\Parser\Sanitizer;
use MediaWiki\Permissions\Authority;
use MediaWiki\Revision\RevisionRecord;
use MediaWiki\Title\Title;
use Wikimedia\IPUtils;

/**
 * This is an abstract class intended for use by special pages that consist primarily of
 * a list of pages, for example, Special:Watchlist or Special:History.
 */
abstract class MobileSpecialPageFeed extends MobileSpecialPage {
	/** @var bool Whether to show the username in results or not */
	protected $showUsername = true;
	/** @var string */
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
			// FIXME: This module should be removed when the following tickets are resolved:
			// * T305113
			// * T109277
			// * T117279
			'mobile.special.pagefeed.styles',
		] );
		$this->setHeaders();
		parent::execute( $par );
	}

	/**
	 * Formats an edit comment
	 * @param string $comment The raw comment text
	 * @param Title $title The title of the page that was edited
	 *
	 * @return string HTML code
	 */
	protected function formatComment( $comment, $title ) {
		if ( $comment === '' ) {
			$comment = $this->msg( 'mobile-frontend-changeslist-nocomment' )->plain();
		} else {
			$comment = $this->commentFormatter->format( $comment, $title );
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
	 * @param RevisionRecord $rev
	 * @param Authority $user viewing the revision
	 * @param bool $unhide whether the user wants to see hidden comments
	 *   if the user doesn't have permission, comment will display as rev-deleted-comment
	 * @return string plain text label
	 */
	protected function getRevisionCommentHTML( RevisionRecord $rev, $user, $unhide ) {
		if ( RevisionRecord::userCanBitfield(
			$rev->getVisibility(),
			RevisionRecord::DELETED_COMMENT,
			$user
		) ) {
			if ( $rev->isDeleted( RevisionRecord::DELETED_COMMENT ) && !$unhide ) {
				$comment = $this->msg( 'rev-deleted-comment' )->escaped();
			} else {
				$commentObj = $rev->getComment( RevisionRecord::FOR_THIS_USER, $user );
				$commentText = $commentObj ? $commentObj->text : '';

				// escape any HTML in summary and add CSS for any auto-generated comments
				$comment = $this->formatComment( $commentText, $this->title );
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
	 * @param RevisionRecord $rev
	 * @param Authority $user viewing the revision
	 * @param bool $unhide whether the user wants to see hidden usernames
	 * @return string plain text label
	 */
	protected function getUsernameText( $rev, $user, $unhide ) {
		$revUser = $rev->getUser( RevisionRecord::FOR_THIS_USER, $user );
		if ( $revUser && $revUser->isRegistered() ) {
			$username = $revUser->getName();
		} else {
			$revUser = $rev->getUser( RevisionRecord::RAW );
			$username = IPUtils::prettifyIP( $revUser->getName() ) ?? $revUser->getName();
		}
		if (
			!RevisionRecord::userCanBitfield(
				$rev->getVisibility(),
				RevisionRecord::DELETED_USER,
				$user
			) ||
			( $rev->isDeleted( RevisionRecord::DELETED_USER ) && !$unhide )
		) {
			$username = $this->msg( 'rev-deleted-user' )->text();
		}
		return $username;
	}

	/**
	 * Renders an item in the feed
	 *
	 * @param array $options An array of various options for
	 *    rendering the feed item's HTML e.g.
	 *
	 *    [
	 *        'ts'       => MWTimestamp - The time the edit occurred
	 *        'diffLink' => string      - The URL to the diff for the edit
	 *        'username' => string      - The username of the user that made
	 *                                    the edit (absent if anonymous)
	 *        'comment'  => string      - The edit summary, HTML escaped
	 *        'title'    => Title|null  - The title of the page that was edited
	 *        'isAnon'   => bool        - Is the edit anonymous?
	 *        'bytes'    => int|null    - Net number of bytes changed or null
	 *                                    if not applicable
	 *        'isMinor'  => bool        - Is the edit minor?
	 *   ];
	 *
	 */
	protected function renderFeedItemHtml( array $options ): void {
		$output = $this->getOutput();
		$user = $this->getUser();
		$lang = $this->getLanguage();

		if ( (bool)( $options['isAnon'] ?? false ) ) {
			$usernameClass = 'mw-mf-user mw-mf-anon';
			$iconHTML = MobileUI::icon( 'userAnonymous' );
		} else {
			$usernameClass = 'mw-mf-user';
			$iconHTML = MobileUI::icon( 'userAvatar' );
		}

		// Add whitespace between icon and label.
		$iconHTML .= ' ';

		$html = Html::openElement( 'li', [ 'class' => 'page-summary' ] );

		if ( isset( $options['diffLink'] ) && $options['diffLink'] ) {
			$html .= Html::openElement( 'a', [ 'href' => $options['diffLink'], 'class' => 'title' ] );
		} else {
			$html .= Html::openElement( 'div', [ 'class' => 'title' ] );
		}

		if ( isset( $options['title'] ) && $options['title'] ) {
			$html .= Html::element( 'h3', [], $options['title']->getPrefixedText() );
		}

		if ( isset( $options['username'] ) && $options['username'] && $this->showUsername ) {
			$html .= Html::rawElement( 'p', [ 'class' => $usernameClass ],
				$iconHTML . ' ' .
				Html::element( 'span', [], $options['username'] )
			);
		}

		$html .= Html::rawElement(
			'p',
			[ 'class' => 'edit-summary component truncated-text multi-line two-line' ],
			$options['comment'] ?? ''
		);

		if ( (bool)( $options['isMinor'] ?? false ) ) {
			$html .= ChangesList::flag( 'minor' );
		}

		$html .= Html::openElement( 'div', [ 'class' => 'list-thumb' ] ) .
			Html::element( 'p', [ 'class' => 'timestamp' ], $lang->userTime( $options['ts'], $user ) );

		if ( isset( $options['bytes'] ) && $options['bytes'] ) {
			$bytes = $options['bytes'];
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

		if ( isset( $options['diffLink'] ) && $options['diffLink'] ) {
			$html .= Html::closeElement( 'a' );
		} else {
			$html .= Html::closeElement( 'div' );
		}
		$html .= Html::closeElement( 'li' );

		$output->addHTML( $html );
	}
}
