<?php
/**
 * SpecialMobileHistory.php
 */

/**
 * Mobile formatted history of of a page
 */
class SpecialMobileHistory extends MobileSpecialPageFeed {
	/** @var boolean $hasDesktopVersion Whether the mobile special page has a desktop special page */
	protected $hasDesktopVersion = true;
	const LIMIT = 50;
	const DB_REVISIONS_TABLE = 'revision';
	/** @var string|null $offset timestamp to offset results from */
	protected $offset;

	/** @var string $specialPageName name of the special page */
	protected $specialPageName = 'History';

	/** @var Title|null $title Null if no title passed */
	protected $title;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( $this->specialPageName );
	}

	/**
	 * Returns a list of query conditions that should be run against the revision table
	 *
	 * @return array List of conditions
	 */
	protected function getQueryConditions() {
		$conds = array();
		if ( $this->title ) {
			$conds[ 'rev_page' ] = $this->title->getArticleID();
		}
		if ( $this->offset ) {
				$dbr = wfGetDB( DB_SLAVE, self::DB_REVISIONS_TABLE );
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
			array( 'href' => $title->getLocalUrl() ),
			$title->getText() );
	}

	/**
	 * Adds HTML to render a header at the top of the feed
	 * @param Title|string $title The page to link to or a string to show
	 */
	protected function renderHeaderBar( $title ) {
		if ( $title instanceof Title ) {
			$headerTitle = $this->getHeaderBarLink( $title );
		} else {
			// manually style it as a userlink
			$headerTitle = Html::element(
				'span',
				array( 'class' => MobileUI::iconClass( 'user', 'before', 'mw-mf-user icon-16px' ) ),
				$title
			);
		}
		$this->getOutput()->addHtml(
			Html::openElement( 'div', array( 'class' => 'content-header' ) ) .
			Html::openElement( 'h2', array() ) .
				$headerTitle .
				Html::closeElement( 'h2' ) .
			Html::closeElement( 'div' )
		);
	}

	/**
	 * Show an error page, if page not found
	 */
	protected function showPageNotFound() {
		wfHttpError( 404, $this->msg( 'mobile-frontend-history-404-title' )->text(),
			$this->msg( 'mobile-frontend-history-404-desc' )->text()
		);
	}

	/**
	 * Render the special page
	 * @param string $par parameter as subpage of specialpage
	 */
	public function executeWhenAvailable( $par = '' ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'history' ) );
		$this->offset = $this->getRequest()->getVal( 'offset', false );
		if ( $par ) {
			// enter article history view
			$this->title = Title::newFromText( $par );
			if ( $this->title && $this->title->exists() ) {
				$this->addModules();
				$this->renderHeaderBar( $this->title );
				$res = $this->doQuery();
				$this->showHistory( $res );
				return;
			}
		}

		$this->showPageNotFound();
	}

	/**
	 * Executes the database query and returns the result.
	 * @see getQueryConditions()
	 * @return ResultWrapper
	 */
	protected function doQuery() {
		$dbr = wfGetDB( DB_SLAVE, self::DB_REVISIONS_TABLE );
		$conds = $this->getQueryConditions();
		$options = array(
			'ORDER BY' => 'rev_timestamp DESC'
		);

		$options['LIMIT'] = self::LIMIT + 1;

		$tables = array( self::DB_REVISIONS_TABLE );
		$fields = array( '*' );

		$res = $dbr->select( $tables, $fields, $conds, __METHOD__, $options );

		return $res;
	}

	/**
	 * Show a row in history, including:
	 * time of edit
	 * changed bytes
	 * name of editor
	 * comment of edit
	 * @param Revision $rev Revision id of the row wants to show
	 * @param Revision|null $prev Revision id of previous Revision to display the difference
	 */
	protected function showRow( Revision $rev, $prev ) {
		$user = $this->getUser();
		$userId = $rev->getUser( Revision::FOR_THIS_USER, $user );
		if ( $userId === 0 ) {
			$username = IP::prettifyIP( $rev->getUserText( Revision::RAW ) );
			$isAnon = true;
		} else {
			$username = $rev->getUserText( Revision::FOR_THIS_USER, $user );
			$isAnon = false;
		}

		// FIXME: Style differently user comment when this is the case
		if ( $rev->userCan( Revision::DELETED_COMMENT, $user ) ) {
			$comment = $rev->getComment( Revision::FOR_THIS_USER, $user );
			$comment = $this->formatComment( $comment, $this->title );
		} else {
			$comment = $this->msg( 'rev-deleted-comment' )->plain();
		}

		$ts = $rev->getTimestamp();
		$this->renderListHeaderWhereNeeded( $this->getLanguage()->userDate( $ts, $this->getUser() ) );
		$ts = new MWTimestamp( $ts );

		$canSeeText = $rev->userCan( Revision::DELETED_TEXT, $user );
		if ( $canSeeText && $prev && $prev->userCan( Revision::DELETED_TEXT, $user ) ) {
			$diffLink = SpecialPage::getTitleFor( 'MobileDiff', $rev->getId() )->getLocalUrl();
		} elseif ( $canSeeText && $rev->getTitle() !== null ) {
			$diffLink = $rev->getTitle()->getLocalUrl( array( 'oldid' => $rev->getId() ) );
		} else {
			$diffLink = false;
		}

		// FIXME: Style differently user comment when this is the case
		if ( !$rev->userCan( Revision::DELETED_USER, $user ) ) {
			$username = $this->msg( 'rev-deleted-user' )->plain();
		}

		// When the page is named there is no need to print it in output
		if ( $this->title ) {
			$title = null;
		} else {
			$title = $rev->getTitle();
		}
		$bytes = $rev->getSize();
		if ( $prev ) {
			$bytes -= $prev->getSize();
		}
		$isMinor = $rev->isMinor();
		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title, $isAnon, $bytes,
			$isMinor );
	}

	/**
	 * Get a button to show more entries of history
	 * @param integer $ts The offset to start the history list from
	 * @return string
	 */
	protected function getMoreButton( $ts ) {
		$attrs = array(
			'href' => $this->getContext()->getTitle()->
				getLocalUrl(
					array(
						'offset' => $ts,
					)
				),
			'class' => 'more',
		);
		return Html::element( 'a', $attrs, $this->msg( 'pager-older-n' )->numParams( self::LIMIT ) );
	}

	/**
	 * Render the history list
	 * @see showRow()
	 * @see doQuery()
	 * @param ResultWrapper $res The result of doQuery
	 */
	protected function showHistory( ResultWrapper $res ) {
		$numRows = $res->numRows();
		$rev1 = $rev2 = null;
		$out = $this->getOutput();
		if ( $numRows > 0 ) {

			foreach ( $res as $row ) {
				$rev1 = new Revision( $row );
				if ( $rev2 ) {
					$this->showRow( $rev2, $rev1 );
				}
				$rev2 = $rev1;
			}
			if ( $rev1 && $numRows < self::LIMIT + 1 ) {
				$this->showRow( $rev1, null );
			}
			$out->addHtml( '</ul>' );
			// Captured 1 more than we should have done so if the number of
			// results is greater than the limit there are more to show.
			if ( $numRows > self::LIMIT ) {
				$out->addHtml( $this->getMoreButton( $rev1->getTimestamp() ) );
			}
		} else {
			$out->addHtml( Html::element( 'div', array( 'class' => 'error alert' ),
				$this->msg( 'mobile-frontend-history-no-results' ) ) );
		}
	}

	/**
	 * Returns desktop URL for this special page
	 * @param string $subPage Subpage passed in URL
	 * @return string
	 */
	public function getDesktopUrl( $subPage ) {
		$params = array( 'title' => $subPage, 'action' => 'history' );
		$offset = $this->getRequest()->getVal( 'offset' );
		if ( $offset ) {
			$params['offset'] = $offset;
		}
		return wfAppendQuery( wfScript(), $params );
	}
}
