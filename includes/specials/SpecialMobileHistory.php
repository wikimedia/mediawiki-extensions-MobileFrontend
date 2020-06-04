<?php

use MediaWiki\MediaWikiServices;
use MediaWiki\Storage\RevisionRecord;
use Wikimedia\Rdbms\IResultWrapper;

/**
 * Mobile formatted history of of a page
 */
class SpecialMobileHistory extends MobileSpecialPageFeed {
	/** @var bool Whether the mobile special page has a desktop special page */
	protected $hasDesktopVersion = true;
	const LIMIT = 50;
	const DB_REVISIONS_TABLE = 'revision';
	/** @var string|null Timestamp to offset results from */
	protected $offset;

	/** @var string */
	protected $specialPageName = 'History';

	/** @var Title|null Null if no title passed */
	protected $title;

	/** @var string a message key for the error message heading that should be shown on a 404 */
	protected $errorNotFoundTitleMsg = 'mobile-frontend-history-404-title';
	/** @var string a message key for the error message description that should be shown on a 404 */
	protected $errorNotFoundDescriptionMsg = 'mobile-frontend-history-404-desc';

	public function __construct() {
		parent::__construct( $this->specialPageName );
	}

	/**
	 * Returns a list of query conditions that should be run against the revision table
	 *
	 * @return array List of conditions
	 */
	protected function getQueryConditions() {
		$conds = [];
		if ( $this->title ) {
			$conds[ 'rev_page' ] = $this->title->getArticleID();
		}
		if ( $this->offset ) {
				$dbr = wfGetDB( DB_REPLICA, self::DB_REVISIONS_TABLE );
				$conds[] = 'rev_timestamp <= ' . $dbr->addQuotes( $this->offset );
		}
		return $conds;
	}

	/**
	 * Gets HTML to place in the header bar
	 * @param Title $title The page to link to
	 * @return string HTML representing the link in the header bar
	 */
	protected function getHeaderBarLink( $title ) {
		return Html::element( 'a',
			[ 'href' => $title->getLocalURL() ],
			$title->getText() );
	}

	/**
	 * Adds HTML to render a header at the top of the feed
	 * @param Title $title The page to link to
	 */
	protected function renderHeaderBar( Title $title ) {
		$namespaceLabel = '';
		$headerTitle = $this->getHeaderBarLink( $title );

		$isTalkNS = MediaWikiServices::getInstance()->getNamespaceInfo()
			->isTalk( $title->getNamespace() );
		if ( $isTalkNS ) {
			$namespaceLabel = Html::element( 'span',
				[ 'class' => 'mw-mf-namespace' ],
				$title->getNsText() . ': ' );
		}
		$this->getOutput()->addHTML(
			Html::openElement( 'div', [ 'class' => 'content-header' ] ) .
			Html::openElement( 'h2', [ 'class' => 'mw-mf-title-wrapper' ] ) .
				$namespaceLabel .
				$headerTitle .
				Html::closeElement( 'h2' ) .
			Html::closeElement( 'div' )
		);
	}

	/**
	 * Checks, if the given title supports the use of SpecialMobileHistory.
	 *
	 * @param Title $title The title to check
	 * @param User $user the user to check
	 * @return bool True, if SpecialMobileHistory can be used, false otherwise
	 */
	public static function shouldUseSpecialHistory( Title $title, User $user ) {
		$services = MediaWikiServices::getInstance();
		$contentHandler = $services->getContentHandlerFactory()->getContentHandler(
			$title->getContentModel()
		);
		$actionOverrides = $contentHandler->getActionOverrides();
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );

		// if history is overwritten, assume, that SpecialMobileHistory can't handle them
		if ( isset( $actionOverrides['history'] ) ) {
			// and return false
			return false;
		}

		if ( $featureManager->isFeatureAvailableForCurrentUser( 'MFUseDesktopSpecialHistoryPage' ) ) {
			return false;
		}

		return MobileFrontendHooks::shouldMobileFormatSpecialPages( $user );
	}

	/**
	 * Render the special page
	 * @param string|null $par parameter as subpage of specialpage
	 */
	public function executeWhenAvailable( $par = '' ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'history' ) );
		$out->addModuleStyles( [
			'mobile.pagelist.styles',
			"mobile.placeholder.images",
			'mobile.pagesummary.styles',
		] );
		$this->offset = $this->getRequest()->getVal( 'offset' );

		if ( $par ) {
			// enter article history view
			$this->title = Title::newFromText( $par );
			if ( $this->title && $this->title->exists() ) {
				$this->getSkin()->setRelevantTitle( $this->title );
				// make sure, the content of the page supports the default history page
				if ( !self::shouldUseSpecialHistory( $this->title, $this->getUser() ) ) {
					// and if not, redirect to the default history action
					$out->redirect( $this->title->getLocalURL( [ 'action' => 'history' ] ) );
					return;
				}

				$this->addModules();
				$this->getOutput()->addHTML(
					Html::openElement( 'div', [ 'class' => 'history content-unstyled' ] )
				);
				$this->renderHeaderBar( $this->title );
				$res = $this->doQuery();
				$this->showHistory( $res );
				$this->getOutput()->addHTML(
					Html::closeElement( 'div' )
				);
				return;
			}
		}

		$this->showPageNotFound();
	}

	/**
	 * Executes the database query and returns the result.
	 * @see getQueryConditions()
	 * @return IResultWrapper
	 */
	protected function doQuery() {
		$dbr = wfGetDB( DB_REPLICA, self::DB_REVISIONS_TABLE );
		$conds = $this->getQueryConditions();
		$options = [
			'ORDER BY' => 'rev_timestamp DESC'
		];

		$options['LIMIT'] = self::LIMIT + 1;

		$revQuery = MediaWikiServices::getInstance()->getRevisionStore()->getQueryInfo();

		$res = $dbr->select(
			$revQuery['tables'], $revQuery['fields'], $conds, __METHOD__, $options, $revQuery['joins']
		);

		return $res;
	}

	/**
	 * Show a row in history, including:
	 * time of edit
	 * changed bytes
	 * name of editor
	 * comment of edit
	 * @param RevisionRecord $rev Revision of the row to show
	 * @param ?RevisionRecord $prev Revision of previous Revision to display the difference
	 */
	private function showRow( RevisionRecord $rev, ?RevisionRecord $prev ) {
		$unhide = $this->getRequest()->getBool( 'unhide' );
		$user = $this->getUser();
		$username = $this->getUsernameText( $rev, $user, $unhide );
		$comment = $this->getRevisionCommentHTML( $rev, $user, $unhide );

		$ts = $rev->getTimestamp();
		$this->renderListHeaderWhereNeeded( $this->getLanguage()->userDate( $ts, $this->getUser() ) );
		$ts = new MWTimestamp( $ts );

		$canSeeText = RevisionRecord::userCanBitfield(
			$rev->getVisibility(),
			RevisionRecord::DELETED_TEXT,
			$user
		);
		if ( $canSeeText && $prev && RevisionRecord::userCanBitfield(
			$prev->getVisibility(),
			RevisionRecord::DELETED_TEXT,
			$user
		) ) {
			$diffLink = SpecialPage::getTitleFor( 'MobileDiff', $rev->getId() )->getLocalURL();
		} elseif ( $canSeeText ) {
			$diffLink = Title::newFromLinkTarget( $rev->getPageAsLinkTarget() )
				->getLocalURL( [ 'oldid' => $rev->getId() ] );
		} else {
			$diffLink = false;
		}

		// When the page is named there is no need to print it in output
		if ( $this->title ) {
			$title = null;
		} else {
			$title = Title::newFromLinkTarget( $rev->getPageAsLinkTarget() );
		}
		$bytes = $rev->getSize();
		if ( $prev ) {
			$bytes -= $prev->getSize();
		}
		$isMinor = $rev->isMinor();

		$revUser = $rev->getUser( RevisionRecord::FOR_THIS_USER, $user );
		if ( $revUser ) {
			$revIsAnon = !( $revUser->isRegistered() );
		} else {
			// Default to anonymous if unknown
			$revIsAnon = true;
		}
		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title,
			$revIsAnon, $bytes, $isMinor );
	}

	/**
	 * Get a button to show more entries of history
	 * @param int $ts The offset to start the history list from
	 * @return string
	 */
	protected function getMoreButton( $ts ) {
		$attrs = [
			'href' => $this->getContext()->getTitle()->
				getLocalURL(
					[
						'offset' => $ts,
					]
				),
			'class' => 'mw-mf-watchlist-more',
		];
		return Html::element(
			'a', $attrs, $this->msg( 'pager-older-n' )->numParams( self::LIMIT )->text()
		);
	}

	/**
	 * Render the history list
	 * @see showRow()
	 * @see doQuery()
	 * @param IResultWrapper $res The result of doQuery
	 */
	protected function showHistory( IResultWrapper $res ) {
		$numRows = $res->numRows();
		$rev1 = $rev2 = null;
		$out = $this->getOutput();
		$revFactory = MediaWikiServices::getInstance()->getRevisionFactory();
		if ( $numRows > 0 ) {
			foreach ( $res as $row ) {
				$rev1 = $revFactory->newRevisionFromRow( $row );
				if ( $rev2 ) {
					$this->showRow( $rev2, $rev1 );
				}
				$rev2 = $rev1;
			}
			if ( $rev1 && $numRows < self::LIMIT + 1 ) {
				$this->showRow( $rev1, null );
			}
			$out->addHTML( '</ul>' );
			// Captured 1 more than we should have done so if the number of
			// results is greater than the limit there are more to show.
			if ( $numRows > self::LIMIT ) {
				$out->addHTML( $this->getMoreButton( $rev1->getTimestamp() ) );
			}
		} else {
			// Edge case.
			// I suspect this is here because revisions may exist but may have been hidden.
			$out->addHTML(
				Html::warningBox( $this->msg( 'mobile-frontend-history-no-results' )->parse() ) );
		}
	}

	/**
	 * Returns desktop URL for this special page
	 * @param string|null $subPage Subpage passed in URL
	 * @return string
	 */
	public function getDesktopUrl( $subPage ) {
		$params = [ 'title' => $subPage, 'action' => 'history' ];
		$offset = $this->getRequest()->getVal( 'offset' );
		if ( $offset ) {
			$params['offset'] = $offset;
		}
		return wfAppendQuery( wfScript(), $params );
	}
}
