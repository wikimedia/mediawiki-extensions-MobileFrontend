<?php

use MediaWiki\Storage\RevisionRecord;

/**
 * Show the difference between two revisions of a page
 */
class SpecialMobileDiff extends MobileSpecialPage {
	/** @var boolean $hasDesktopVersion Does this special page has a desktop version? */
	protected $hasDesktopVersion = true;
	/** @var integer $revId Saves the actual revision ID */
	private $revId;
	/** @var Revision $rev Saves the revision Object of actual revision */
	private $rev;
	/** @var Revision $prevRev Saves the previous revision */
	private $prevRev;
	/** @var Title Saves the title of the actual revision */
	private $targetTitle;
	/**
	 * @var InlineDifferenceEngine|DifferenceEngine $mDiffEngine
	 * DifferenceEngine for this Diff-page
	 */
	protected $mDiffEngine;

	public function __construct() {
		parent::__construct( 'MobileDiff' );
	}

	/**
	 * Get the revision object from ID
	 * @param int $id ID of the wanted revision
	 * @return Revision
	 */
	public static function getRevision( $id ) {
		return Revision::newFromId( $id );
	}

	/**
	 * Generate a 404 Error message, that revisions can not be found
	 */
	public function executeBadQuery() {
		wfHttpError( 404, $this->msg( 'mobile-frontend-diffview-404-title' )->text(),
			$this->msg( 'mobile-frontend-diffview-404-desc' )->text() );
	}

	/**
	 * Takes 2 ids/keywords and validates them returning respective revisions
	 *
	 * @param int[] $revids Array of revision ids currently limited to 2 elements
	 * @return Revision[]|null[] Array of previous and next revision. The next revision is null if
	 *   a bad parameter is passed
	 */
	public function getRevisionsToCompare( $revids ) {
		$prev = null;
		$rev = null;

		// check 2 parameters are passed and are numbers
		if ( count( $revids ) === 2 && $revids[0] && $revids[1] ) {
			$id = (int)$revids[1];
			$prevId = (int)$revids[0];
			if ( $id && $prevId ) {
				$rev = static::getRevision( $id );
				// deal with identical ids
				if ( $id === $prevId ) {
					$rev = null;
				} elseif ( $rev ) {
					$prev = static::getRevision( $prevId );
					if ( !$prev ) {
						$rev = null;
					}
				} else {
					$rev = null;
				}
			}
		} elseif ( count( $revids ) === 1 ) {
			$id = (int)$revids[0];
			if ( $id ) {
				$rev = static::getRevision( $id );
				if ( $rev ) {
					$prev = $rev->getPrevious();
				}
			}
		}
		return [ $prev, $rev ];
	}

	/**
	 * Render the diff page
	 * @return bool false when revision not exist
	 * @param string|null $par Revision IDs separated by three points (e.g. 123...124)
	 */
	public function executeWhenAvailable( $par ) {
		$this->setHeaders();
		$output = $this->getOutput();

		// @FIXME add full support for git-style notation (eg ...123, 123...)
		$revisions = $this->getRevisionsToCompare( explode( '...', $par, 2 ) );
		list( $prev, $rev ) = $revisions;

		if ( $rev === null ) {
			$this->executeBadQuery();
			return false;
		}
		$this->revId = $rev->getId();
		$this->rev = $rev;
		$this->prevRev = $prev;
		$this->targetTitle = $this->rev->getTitle();
		$this->getSkin()->setRelevantTitle( $this->targetTitle );

		$output->setPageTitle( $this->msg(
			'mobile-frontend-diffview-title',
			$this->targetTitle->getPrefixedText()
		) );

		$output->addModuleStyles( [
			'mobile.special.user.icons',
			"mobile.placeholder.images",
			'mobile.pagesummary.styles',
			// @todo FIXME: Don't add these styles. This is only needed for the user
			// icon to the left of the username
			'mobile.special.pagefeed.styles'
		] );
		$output->addModules( 'mobile.special.mobilediff.scripts' );

		// Allow other extensions to load more stuff here
		Hooks::run( 'BeforeSpecialMobileDiffDisplay', [ &$output, $this->mobileContext, $revisions ] );

		$output->addHTML( '<div id="mw-mf-diffview" class="content-unstyled"><div id="mw-mf-diffarea">' );

		$this->displayDiffPage();
		$output->addHTML( '</div>' );

		$this->showFooter( $this->getRequest()->getBool( 'unhide' ) );

		$output->addHTML( '</div>' );

		return true;
	}

	/**
	 * Returns the ID of the previous Revision, if it is set, otherwise 0.
	 *
	 * @return int|null
	 */
	protected function getPrevId() {
		return $this->prevRev ? $this->prevRev->getId() : 0;
	}

	/**
	 * Setups the mobile DifferenceEngine and displays a mobile optimised diff.
	 */
	protected function displayDiffPage() {
		$unhide = $this->getRequest()->getBool( 'unhide' );
		$contentHandler = $this->rev->getContentHandler();
		$this->mDiffEngine = $contentHandler->createDifferenceEngine( $this->getContext(),
		$this->getPrevId(), $this->revId, 0, false, $unhide );
		$this->showHeader( $unhide );
		$this->mDiffEngine->showDiffPage();
	}

	/**
	 * Render the header of a diff page including:
	 * Navigation links
	 * Name with url to page
	 * Bytes added/removed
	 * Day and time of edit
	 * Edit Comment
	 *
	 * @param bool $unhide
	 */
	private function showHeader( $unhide = false ) {
		if ( $this->rev->isMinor() ) {
			$minor = ChangesList::flag( 'minor' );
		} else {
			$minor = '';
		}
		$this->getOutput()->addHTML(
			$this->getRevisionNavigationLinksHTML() .
			$this->getIntroHTML() .
			$minor .
			$this->getCommentHTML( $unhide )
		);
	}

	/**
	 * Get the edit comment
	 *
	 * @param bool $unhide
	 * @return string Build HTML for edit comment section
	 */
	private function getCommentHTML( $unhide = false ) {
		$audience = $unhide ? RevisionRecord::FOR_THIS_USER : RevisionRecord::FOR_PUBLIC;
		$comment = $this->rev->getComment( $audience );

		if ( $this->rev->isDeleted( RevisionRecord::DELETED_COMMENT ) && !$unhide ) {
			$commentHtml = $this->msg( 'rev-deleted-comment' )->escaped();
		} elseif ( $comment !== '' && $comment !== null ) {
			$commentHtml = Linker::formatComment( $comment, $this->targetTitle );
		} else {
			$commentHtml = $this->msg( 'mobile-frontend-changeslist-nocomment' )->escaped();
		}

		return Html::rawElement(
			'div',
			[ 'class' => 'mw-mf-diff-comment' ],
			$commentHtml
		);
	}

	/**
	 * Get the intro HTML
	 * @return string Built HTML for intro section
	 */
	private function getIntroHTML() {
		if ( $this->prevRev ) {
			$bytesChanged = $this->rev->getSize() - $this->prevRev->getSize();
		} else {
			$bytesChanged = $this->rev->getSize();
		}
		$glyph = 'bytesChanged';
		$bytesClassNames = 'meta mw-ui-icon-small ';

		if ( $bytesChanged > 0 ) {
			$changeMsg = 'mobile-frontend-diffview-bytesadded';
			$sizeClass = MobileUI::iconClass( $glyph . '-green', 'before',
				$bytesClassNames . 'mw-mf-bytesadded' );
		} elseif ( $bytesChanged === 0 ) {
			$changeMsg = 'mobile-frontend-diffview-bytesnochange';
			$sizeClass = MobileUI::iconClass( $glyph, 'before',
				$bytesClassNames . 'mw-mf-bytesneutral mf-mw-ui-icon-rotate-clockwise' );
		} else {
			$changeMsg = 'mobile-frontend-diffview-bytesremoved';
			$sizeClass = MobileUI::iconClass( $glyph . '-red', 'before',
				$bytesClassNames . 'mw-mf-bytesremoved mf-mw-ui-icon-rotate-flip' );
			$bytesChanged = abs( $bytesChanged );
		}
		$ts = new MWTimestamp( $this->rev->getTimestamp() );
		$user = $this->getUser();
		$actionMessageKey = $this->targetTitle->quickUserCan( 'edit', $user )
			? 'editlink' : 'viewsourcelink';

		$templateData = [
			"articleUrl" => $this->targetTitle->getLocalURL(),
			"articleLinkLabel" => $this->targetTitle->getPrefixedText(),
			"revisionUrl" => $this->targetTitle->getLocalURL( [ 'oldid' => $this->revId ] ),
			"revisionLinkLabel" => $this->msg(
				'revisionasof',
				$this->getLanguage()->userTimeAndDate( $ts, $user ),
				$this->getLanguage()->userDate( $ts, $user ),
				$this->getLanguage()->userTime( $ts, $user )
			)->text(),
			"actionLinkUrl" => $this->targetTitle->getLocalURL( [ 'action' => 'edit' ] ),
			"actionLinkLabel" => $this->msg( $actionMessageKey )->text(),
			"sizeClass" => $sizeClass,
			"bytesChanged" => $this->msg( $changeMsg )->numParams( $bytesChanged )->text(),
			"separator" => $this->msg( 'comma-separator' )->text(),
			"bytesChangedTimeDate" => $this->getLanguage()->getHumanTimestamp( $ts ),
		];

		$templateParser = new TemplateParser( __DIR__ );

		return $templateParser->processTemplate( 'SpecialMobileDiffInfo', $templateData );
	}

	/**
	 * Render the revision navigation links
	 * @return string built HTML for Revision navigation links
	 */
	private function getRevisionNavigationLinksHTML() {
		$prev = $this->rev->getPrevious();
		$next = $this->rev->getNext();
		$history = '';

		if ( $prev || $next ) {
			$history = Html::openElement( 'ul', [ 'class' => 'hlist revision-history-links' ] );
			if ( $prev ) {
				$history .= Html::openElement( 'li', [ 'class' => 'revision-history-prev' ] )
					. Html::element( 'a', [
						'href' => SpecialPage::getTitleFor( 'MobileDiff', $prev->getId() )
							->getLocalURL()
					], $this->msg( 'previousdiff' )->text() ) . Html::closeElement( 'li' );
			}
			if ( $next ) {
				$history .= Html::openElement( 'li', [ 'class' => 'revision-history-next' ] )
					. Html::element( 'a', [
						'href' => SpecialPage::getTitleFor( 'MobileDiff', $next->getId() )
							->getLocalURL()
					], $this->msg( 'nextdiff' )->text() ) . Html::closeElement( 'li' );
			}
			$history .= Html::closeElement( 'ul' );
		}
		return $history;
	}

	/**
	 * Render the footer including userinfos (Name, Role, Editcount)
	 *
	 * @param bool $unhide whether hidden content should be shown
	 */
	private function showFooter( $unhide ) {
		$output = $this->getOutput();

		$output->addHTML(
			Html::openElement( 'div', [ 'id' => 'mw-mf-userinfo',
				'class' => 'position-fixed' ] ) .
			Html::openElement( 'div', [ 'class' => 'post-content' ] )
		);

		$audience = $unhide ? RevisionRecord::FOR_THIS_USER : RevisionRecord::FOR_PUBLIC;
		$userId = $this->rev->getUser( $audience );
		$ipAddr = $this->rev->getUserText( $audience );

		// Note $userId will be 0 and $ipAddr an empty string if the current audience cannot see it.
		if ( $userId ) {
			$user = User::newFromId( $userId );
			$edits = $user->getEditCount();
			$attrs = [
				'class' => MobileUI::iconClass( 'userAvatar-base20', 'before', 'mw-mf-user' ),
				'data-revision-id' => $this->revId,
				'data-user-name' => $user->getName(),
				'data-user-gender' => $user->getOption( 'gender' ),
			];
			// Note we do not use LinkRenderer here as this will render
			// a broken link if the user page does not exist
			$output->addHTML(
				Html::openElement( 'div', $attrs ) .
				$this->getLinkRenderer()->makeLink(
					$user->getUserPage(),
					$user->getName(),
					[ 'class' => 'mw-mf-user-link' ],
					// T197581: Override red linking so that the user page is always accessible
					// for user pages that do not exist. We want to allow access to contributions
					[ 'action' => 'view' ]
				) .
				'</div>' .
				'<div class="mw-mf-roles meta">' .
					$this->listGroups( $user, $this->mobileContext ) .
				'</div>' .
				'<div class="mw-mf-edit-count meta">' .
					$this->msg(
						'mobile-frontend-diffview-editcount',
						$this->getLanguage()->formatNum( $edits )
					)->parse() .
				'</div>'
			);
		} elseif ( $ipAddr ) {
			$userPage = SpecialPage::getTitleFor( 'Contributions', $ipAddr );
			$output->addHTML(
				Html::element( 'div', [
					'class' => MobileUI::iconClass( 'userAnonymous-base20', 'before', 'mw-mf-user mw-mf-anon' ),
				], $this->msg( 'mobile-frontend-diffview-anonymous' )->text() ) .
				'<div>' .
					$this->getLinkRenderer()->makeLink( $userPage, $ipAddr ) .
				'</div>'
			);
		} else {
			// Case where the user cannot see who made the edit
			$output->addHTML(
				$this->msg( 'rev-deleted-user' )->escaped()
			);
		}

		$output->addHTML(
			Html::closeElement( 'div' ) .
			Html::closeElement( 'div' )
		);
	}

	/**
	 * Get the list of groups of user
	 * @param User $user The user object to get the list from
	 * @param IContextSource $context
	 * @return string comma separated list of user groups
	 */

	private function listGroups( User $user, IContextSource $context ) {
		// Get groups to which the user belongs
		$userGroups = $user->getGroups();
		$userMembers = [];
		foreach ( $userGroups as $group ) {
			$userMembers[] = UserGroupMembership::getLink( $group, $context, 'html' );
		}

		return $this->getLanguage()->commaList( $userMembers );
	}

	/**
	 * Get the url for the mobile diff special page to use in Desktop footer
	 * @param WebRequest $req
	 * @return bool|string Return URL or false when revision id's not set
	 */
	public static function getMobileUrlFromDesktop( WebRequest $req ) {
		$rev2 = $req->getText( 'diff' );
		$rev1 = $req->getText( 'oldid' );
		// Actually, both do the same, WTF
		if ( $rev1 == 'prev' || $rev1 == 'next' ) {
			$rev1 = '';
		}
		// redirect requests to the diff page to mobile view
		if ( !$rev2 ) {
			if ( $rev1 ) {
				$rev2 = $rev1;
				$rev1 = '';
			} else {
				return false;
			}
		}

		if ( $rev1 ) {
			$rev = static::getRevision( $rev1 );
			if ( $rev ) {
				// the diff parameter could be the string prev or next - deal with these cases
				if ( $rev2 === 'prev' ) {
					$prev = $rev->getPrevious();
					// yes this is confusing - this is how it works arrgghh
					$rev2 = $rev1;
					$rev1 = $prev ? $prev->getId() : '';
				} elseif ( $rev2 === 'next' ) {
					$next = $rev->getNext();
					$rev2 = $next ? $next->getId() : '';
				} else {
					$rev2 = static::getRevision( $rev2 );
					$rev2 = $rev2 ? $rev2->getId() : '';
				}
			} else {
				$rev2 = '';
			}
		}

		if ( $rev2 ) {
			$subpage = $rev1 ? $rev1 . '...' . $rev2 : $rev2;
			$title = SpecialPage::getTitleFor( 'MobileDiff', $subpage );
			return $title->getLocalURL();
		}
		return false;
	}

	/**
	 * Get the URL for Desktop version of difference view
	 * @param string|null $subPage URL of mobile diff page
	 * @return string Url to mobile diff page
	 */
	public function getDesktopUrl( $subPage ) {
		$parts = explode( '...', $subPage );
		if ( count( $parts ) > 1 ) {
			$params = [ 'diff' => $parts[1], 'oldid' => $parts[0] ];
		} else {
			$params = [ 'diff' => $parts[0] ];
		}
		if ( $this->getRequest()->getVal( 'unhide' ) ) {
			$params['unhide'] = 1;
		}
		return wfAppendQuery( wfScript(), $params );
	}
}
