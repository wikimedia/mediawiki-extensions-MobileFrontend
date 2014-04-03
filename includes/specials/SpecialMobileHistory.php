<?php

class SpecialMobileHistory extends MobileSpecialPageFeed {
	const LIMIT = 50;
	protected $mode = 'beta';
	/**  @var String|null timestamp to offset results from */
	protected $offset;

	/**  @var String name of the special page */
	protected $specialPageName = 'History';

	/**  @var Title|null if no title passed */
	protected $title;

	public function __construct() {
		parent::__construct( $this->specialPageName );
	}

	/**
	 * Returns a list of query conditions that should be run against the revision table
	 *
	 * @return Array: List of conditions
	 */
	protected function getQueryConditions() {
		$conds = array();
		if ( $this->title ) {
			$conds[ 'rev_page' ] = $this->title->getArticleID();
		} elseif ( $this->offset ) {
				$conds[] = 'rev_timestamp <= ' . $dbr->addQuotes( $this->offset );
		}
		return $conds;
	}

	/**
	 * Adds HTML to render a header at the top of the feed
	 * @param {Message} msg: A message to print in the header bar
	 * @param {boolean} parse: Whether to parse the message or to escape it (defaults to escape)
	 *
	 * @return Array: List of conditions
	 */
	protected function renderHeaderBar( $msg, $parse=false ) {
		$msg = $parse ? $msg->parse() : $msg->escaped();
		$this->getOutput()->addHtml(
			Html::openElement( 'div', array( 'class' => 'page-header-bar' ) ) .
			Html::openElement( 'div' ) .
			$msg .
			Html::closeElement( 'div' ) .
			Html::closeElement( 'div' )
		);
	}

	protected function showPageNotFound() {
		wfHttpError( 404, $this->msg( 'mobile-frontend-history-404-title' )->text(),
			$this->msg( 'mobile-frontend-history-404-desc' )->text()
		);
	}

	public function executeWhenAvailable( $par = '' ) {
		wfProfileIn( __METHOD__ );

		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'history' ) );
		$this->offset = $this->getRequest()->getVal( 'offset', false );
		if ( $par ) {
			// enter article history view
			$this->title = Title::newFromText( $par );
			if ( $this->title && $this->title->exists() ) {
				$this->renderHeaderBar(
					$this->msg( 'mobile-frontend-history-summary', $this->title->getText() ),
					true
				);
				$res = $this->doQuery();
				$this->showHistory( $res );
				wfProfileOut( __METHOD__ );
				return;
			}
		}

		$this->showPageNotFound();
		wfProfileOut( __METHOD__ );
	}

	protected function doQuery() {
		wfProfileIn( __METHOD__ );
		$table = 'revision';
		$dbr = wfGetDB( DB_SLAVE, $table );
		$conds = $this->getQueryConditions();
		$options = array(
			'ORDER BY' => 'rev_timestamp DESC'
		);

		$options['LIMIT'] = self::LIMIT + 1;

		$tables = array( $table );
		$fields = array( '*' );

		wfProfileIn( __METHOD__ . '-query' );
		$res = $dbr->select( $tables, $fields, $conds, __METHOD__, $options );
		wfProfileOut( __METHOD__ . '-query' );

		wfProfileOut( __METHOD__ );
		return $res;
	}

	/**
	 * @param Revision $rev
	 * @param Revision|null $prev
	 */
	protected function showRow( Revision $rev, $prev ) {
		wfProfileIn( __METHOD__ );
		$user = $this->getUser();
		$userId = $rev->getUser( Revision::FOR_THIS_USER, $user );
		if ( $userId === 0 ) {
			$username = '';
		} else {
			$username = $rev->getUserText( Revision::FOR_THIS_USER, $user );
		}

		// FIXME: Style differently user comment when this is the case
		if ( $rev->userCan( Revision::DELETED_COMMENT, $user ) ) {
			$comment = $rev->getComment( Revision::FOR_THIS_USER, $user );
			$comment = $this->formatComment( $comment, $this->title );
		} else {
			$comment = $this->msg( 'rev-deleted-comment' )->plain();
		}

		$ts = new MWTimestamp( $rev->getTimestamp() );

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
			$title = false;
		} else {
			$title = $rev->getTitle();
		}
		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title );

		wfProfileOut( __METHOD__ );
	}

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
		return Html::element( 'a', $attrs, 'more' );
	}

	protected function showHistory( ResultWrapper $res ) {
		$numRows = $res->numRows();
		$rev1 = $rev2 = null;
		$out = $this->getOutput();
		if ( $numRows > 0 ) {
			$out->addHtml(
				Html::openElement( 'ul',
					array(
						'class' => 'page-list'
					)
				)
			);

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
}
