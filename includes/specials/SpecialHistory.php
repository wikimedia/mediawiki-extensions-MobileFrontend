<?php

class SpecialHistory extends MobileSpecialPageFeed {
	const LIMIT = 50;
	protected $mode = 'beta';
	/**  @var String|null timestamp to offset results from */
	protected $offset;

	/**  @var Title|null if no title passed */
	protected $title;

	public function __construct() {
		parent::__construct( 'History' );
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
				$out->addHtml(
					Html::openElement( 'div', array( 'class' => 'page-header-bar' ) ) .
					Html::openElement( 'div' ) .
					$this->msg( 'mobile-frontend-history-summary', $this->title->getText() )->parse() .
					Html::closeElement( 'div' ) .
					Html::closeElement( 'div' )
				);
			} else {
				wfHttpError( 404, $this->msg( 'mobile-frontend-history-404-title' )->text(),
					$this->msg( 'mobile-frontend-history-404-desc' )->text() );
			}
		}
		$res = $this->doQuery();
		$this->showHistory( $res );

		wfProfileOut( __METHOD__ );
	}

	protected function doQuery() {
		wfProfileIn( __METHOD__ );
		$table = 'revision';
		$dbr = wfGetDB( DB_SLAVE, $table );
		$conds = array();
		if ( $this->offset ) {
			$conds[] = 'rev_timestamp <= ' . $dbr->addQuotes( $this->offset );
		}
		if ( $this->title ) {
			$conds['rev_page'] = $this->title->getArticleID();
		}
		$options = array(
			'ORDER BY' => 'rev_timestamp DESC',
			'USE INDEX' => 'page_timestamp',
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
		$username = $userId === 0 ? '' : $rev->getUserText( Revision::FOR_THIS_USER, $user );

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
			$diffLink = SpecialPage::getTitleFor( 'MobileDiff', $prev->getId() )->getLocalUrl();
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
			// Captured 1 more than we should have done so if the number of results is greater than the limit there are more to show
			if ( $numRows > self::LIMIT ) {
				$out->addHtml( $this->getMoreButton( $rev1->getTimestamp() ) );
			}
		} else {
			$out->addHtml( Html::element( 'div', array( 'class' => 'error alert' ),
				$this->msg( 'mobile-frontend-history-no-results' ) ) );
		}
	}
}
