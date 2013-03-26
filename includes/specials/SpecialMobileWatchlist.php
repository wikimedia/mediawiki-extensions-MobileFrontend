<?php

class SpecialMobileWatchlist extends SpecialWatchlist {
	const LIMIT = 50; // Performance-safe value with PageImages
	const THUMB_SIZE = 150;

	private $filter,
		$seenTitles,
		$seenDays,
		$today,
		$usePageImages;

	/** @var Title */
	private $fromPageTitle;

	function execute( $par ) {
		wfProfileIn( __METHOD__ );

		$ctx = MobileContext::singleton();
		$this->usePageImages = !$ctx->imagesDisabled() && defined( 'PAGE_IMAGES_INSTALLED' );
		// assumes mobile skin
		$mobileSkin = $ctx->getSkin();
		$mobileSkin->setHtmlHeader( $this->getWatchlistHeader() );

		$user = $this->getUser();
		$output = $this->getOutput();
		$req = $this->getRequest();
		$view = $req->getVal( 'watchlistview', 'a-z' );
		$this->fromPageTitle = Title::newFromText( $req->getVal( 'from', false ) );
		$recentChangesView = ( $view === 'feed' ) ? true : false;

		$output->setPageTitle( $this->msg( 'watchlist' ) );

		if( $user->isAnon() ) {
			// No watchlist for you.
			$output->addHtml( Html::openElement( 'div', array( 'class' => 'content' ) ) );
			parent::execute( $par );
			$output->addHtml( Html::closeElement( 'div' ) );
			wfProfileOut( __METHOD__ );
			return;
		} else {
			$mobileSkin->addArticleClass( 'noMargins watchlist' );
		}

		if ( $recentChangesView ) {
			$this->filter = $this->getRequest()->getVal( 'filter', 'all' );
			$this->showRecentChangesHeader();
			$res = $this->doFeedQuery();
			$this->showFeedResults( $res );
		} else {
			$this->filter = $this->getRequest()->getVal( 'filter', 'articles' );
			$res = $this->doListQuery();
			$this->showListResults( $res );
		}

		wfProfileOut( __METHOD__ );
	}

	/**
	 * Add thumbs to a query, if installed and other preconditions are met
	 *
	 * @param array $tables
	 * @param array $fields
	 * @param array $join_conds
	 * @param $baseTable
	 *
	 * @return void
	 */
	protected function doPageImages( array &$tables, array &$fields, array &$join_conds, $baseTable ) {
		if ( !$this->usePageImages ) {
			return;
		}
		if ( $baseTable === 'page' ) {
			if ( !in_array( 'page', $tables ) ) {
				$tables[] = 'page';
			}
			$idField = 'page_id';
		} else { // recentchanges
			$idField = 'rc_cur_id';
		}
		$tables[] = 'page_props';
		$fields[] = 'pp_value';
		$join_conds['page_props'] = array(
			'LEFT JOIN',
			array(
				"pp_page=$idField",
				'pp_propname' => 'page_image',
			),
		);
	}

	protected function getWatchlistHeader() {
		$cur = $this->getRequest()->getVal( 'watchlistview', 'a-z' );
		$sp = SpecialPage::getTitleFor( 'Watchlist' );
		$attrsList = array(
			'class' => 'button mw-mf-watchlist-view-selector'
		);
		$attrsFeed = array(
			'class' => 'button mw-mf-watchlist-view-selector'
		);
		if ( $cur == 'feed' ) {
			$attrsFeed[ 'class' ] .= ' active';
		} else {
			$attrsList[ 'class' ] .= ' active';
		}

		$html =
			Html::openElement( 'div',
				array(
					'class' => 'mw-mf-watchlist-views header' )
				) .
			Html::openElement( 'div',
				array(
					'class' => 'mw-mf-view-filters' )
				) .
			Linker::link( $sp,
				wfMessage( 'mobile-frontend-watchlist-a-z' )->text(),
				$attrsList,
				array(
					'watchlistview' => 'a-z'
				)
			) .
			Linker::link( $sp,
				wfMessage( 'mobile-frontend-watchlist-feed' )->text(),
				$attrsFeed,
				array(
					'watchlistview' => 'feed'
				)
			) .
			Html::closeElement( 'div' ) .
			Html::closeElement( 'div' );
		return $html;
	}

	function showRecentChangesHeader() {
		$filters = array(
			'all' => 'mobile-frontend-watchlist-filter-all',
			'articles' => 'mobile-frontend-watchlist-filter-articles',
			'talk' => 'mobile-frontend-watchlist-filter-talk',
			'other' => 'mobile-frontend-watchlist-filter-other',
		);
		$output = $this->getOutput();

		$output->addHtml(
			Html::openElement( 'ul', array( 'class' => 'mw-mf-watchlist-selector' ) )
		);

		foreach( $filters as $filter => $msg ) {
			$itemAttrs = array();
			if ( $filter === $this->filter ) {
				$itemAttrs['class'] = 'selected';
			}
			$linkAttrs = array(
				'href' => $this->getTitle()->getLocalUrl(
					array(
						'filter' => $filter,
						'watchlistview' => 'feed',
					)
				)
			);
			$output->addHtml(
				Html::openElement( 'li', $itemAttrs ) .
				Html::element( 'a', $linkAttrs, $this->msg( $msg )->plain() ) .
				Html::closeElement( 'li' )
			);
		}

		$output->addHtml(
			Html::closeElement( 'ul' )
		);
	}

	function doFeedQuery() {
		wfProfileIn( __METHOD__ );

		$user = $this->getUser();
		$dbr = wfGetDB( DB_SLAVE, 'watchlist' );

		# Possible where conditions
		$conds = array();

		// snip....

		$tables = array( 'recentchanges', 'watchlist' );
		$fields = array( $dbr->tableName( 'recentchanges' ) . '.*' );
		$join_conds = array(
			'watchlist' => array(
				'INNER JOIN',
				array(
					'wl_user' => $user->getId(),
					'wl_namespace=rc_namespace',
					'wl_title=rc_title'
				),
			),
		);
		$options = array( 'ORDER BY' => 'rc_timestamp DESC' );
		$options['LIMIT'] = self::LIMIT;

		$rollbacker = $user->isAllowed('rollback');
		if ( $rollbacker ) {
			$tables[] = 'page';
			$join_conds['page'] = array( 'LEFT JOIN', 'rc_cur_id=page_id' );
			if ( $rollbacker ) {
				$fields[] = 'page_latest';
			}
		}

		switch( $this->filter ) {
		case 'all':
			// no-op
			break;
		case 'articles':
			// @fixme content namespaces
			$conds['rc_namespace'] = 0;
			break;
		case 'talk':
			// @fixme associate with content namespaces? or all talks?
			$conds['rc_namespace'] = 1;
			break;
		case 'other':
			// @fixme
			$conds['rc_namespace'] = array(2, 4);
			break;
		}

		ChangeTags::modifyDisplayQuery( $tables, $fields, $conds, $join_conds, $options, '' );
		$values = array();
		wfRunHooks('SpecialWatchlistQuery', array(&$conds,&$tables,&$join_conds,&$fields, &$values) );

		wfProfileIn( __METHOD__ . '-query' );
		$res = $dbr->select( $tables, $fields, $conds, __METHOD__, $options, $join_conds );
		wfProfileOut( __METHOD__ . '-query' );

		wfProfileOut( __METHOD__ );
		return $res;
	}

	function doListQuery() {
		wfProfileIn( __METHOD__ );

		$user = $this->getUser();
		$dbr = wfGetDB( DB_SLAVE, 'watchlist' );

		# Possible where conditions
		$conds = array(
			'wl_user' => $user->getId()
		);
		$tables = array( 'watchlist', 'page', 'revision' );
		$fields = array(
			$dbr->tableName( 'watchlist' ) . '.*',
			// get the timestamp of the last change only
			'MAX(' . $dbr->tableName( 'revision' ) . '.rev_timestamp) AS rev_timestamp'
		);
		$joinConds = array(
			'page' => array( 'JOIN', array(
				'wl_namespace = page_namespace',
				'wl_title = page_title'
			)	),
			'revision' => array( 'JOIN', array(
				'page_id = rev_page'
			) )
		);
		$options = array(
			'GROUP BY' => 'wl_namespace, wl_title',
			'ORDER BY' => 'wl_namespace, wl_title'
		);

		$this->doPageImages( $tables, $fields, $joinConds, 'page' );

		$options['LIMIT'] = self::LIMIT + 1; // add one to decide whether to show the more button

		switch( $this->filter ) {
		case 'all':
			break;
		case 'articles':
			$conds[] = 'wl_namespace = 0'; // Has to be unquoted or MySQL will filesort
			break;
		case 'talk':
			$conds[] = 'wl_namespace = 1';
			break;
		case 'other':
			$conds['wl_namespace'] = array(2, 4);
			break;
		}

		if ( $this->fromPageTitle ) {
			$ns = $this->fromPageTitle->getNamespace();
			$titleQuoted = $dbr->addQuotes( $this->fromPageTitle->getDBkey() );
			$conds[] = "wl_namespace > $ns OR (wl_namespace = $ns AND wl_title >= $titleQuoted)";
		}

		wfProfileIn( __METHOD__ . '-query' );
		$res = $dbr->select( $tables, $fields, $conds, __METHOD__, $options, $joinConds );
		wfProfileOut( __METHOD__ . '-query' );

		wfProfileOut( __METHOD__ );
		return $res;
	}

	function showFeedResults( ResultWrapper $res ) {
		$this->showResults( $res, true );
	}

	function showListResults( ResultWrapper $res ) {
		$this->showResults( $res, false );
	}

	function showResults( ResultWrapper $res, $feed ) {
		wfProfileIn( __METHOD__ );

		$empty = $res->numRows() === 0;
		$this->seenTitles = array();

		if ( $feed ) {
			$this->today = $this->day( wfTimestamp() );
			$this->seenDays = array( $this->today => true );
		}

		$output = $this->getOutput();

		if ( $empty ) {
			$this->showEmptyList( $feed );
		} else {
			$output->addHtml(
				Html::openElement( 'ul',
					array(
						'class' => $feed ? 'mw-mf-watchlist-results' : 'mw-mf-watchlist-results a-to-z',
					)
				)
			);

			$lookahead = 1;
			$fromTitle = false;

			if ( $feed ) {
				foreach( $res as $row ) {
					$this->showFeedResultRow( $row );
				}
			} else {
				foreach( $res as $row ) {
					if ( $lookahead <= self::LIMIT ) {
						$this->showListResultRow( $row );
					} else {
						$fromTitle = Title::makeTitle( $row->wl_namespace, $row->wl_title );
					}
					$lookahead++;
				}
			}

			$output->addHtml( '</ul>' );

			if ( $fromTitle !== false ) {
				$output->addHtml(
					Html::openElement( 'a',
						array(
							'href' => SpecialPage::getTitleFor( 'Watchlist' )->
								getLocalUrl(
									array(
										'from' => $fromTitle->getPrefixedText(),
										'filter' => $this->filter,
									)
								),
							'class' => 'more button',
						)
					) .
					wfMessage( 'mobile-frontend-watchlist-more' )->escaped() .
					Html::closeElement( 'a' )
				);
			}
		}

		wfProfileOut( __METHOD__ );
	}

	function showEmptyList( $feed ) {
		global $wgExtensionAssetsPath;
		$output = $this->getOutput();
		$msg = $feed ? 'mobile-frontend-watchlist-feed-empty' : 'mobile-frontend-watchlist-a-z-empty';
		$dir = $this->getLanguage()->isRTL() ? 'rtl' : 'ltr';
		$output->addHtml(
				Html::openElement( 'div', array( 'class' => 'info' ) ) .
				Html::element( 'p', null, wfMessage( $msg )->plain() ) .
				Html::element( 'p', null, wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto' )->plain() ) .
				Html::element( 'img', array(
					'src' => $wgExtensionAssetsPath . "/MobileFrontend/images/emptywatchlist-$dir.png",
					'alt' => wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto-alt' )->plain(),
					)
				) .
				Html::element( 'a',
					array( 'class' => 'button', 'href' => Title::newMainPage()->getLocalUrl() ),
					wfMessage( 'mobile-frontend-watchlist-back-home' )->plain()
				) .
				Html::closeElement( 'div' )
		);
	}

	private function day( $ts ) {
		return $this->getLanguage()->date( $ts, true );
	}

	private function renderThumb( $row ) {
		wfProfileIn( __METHOD__ );

		if ( $this->usePageImages && !is_null( $row->pp_value ) ) {
			$file = wfFindFile( $row->pp_value );
			if ( $file ) {
				$thumb = $file->transform( array( 'width' => self::THUMB_SIZE, 'height' => self::THUMB_SIZE ) );
				if ( $thumb ) {
					return Html::element( 'div',
						array(
							'class' => 'listThumb ' . ( $thumb->getWidth() > $thumb->getHeight() ? 'listThumbH' : 'listThumbV' ),
							'style' => 'background-image: url("' . wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT ) . '")',
						)
					);
				}
			}
		}

		wfProfileOut( __METHOD__ );
		return '';
	}

	private function showFeedResultRow( $row ) {
		wfProfileIn( __METHOD__ );

		$output = $this->getOutput();

		$title = Title::makeTitle( $row->rc_namespace, $row->rc_title );
		$titleText = $title->getPrefixedText();
		if ( array_key_exists( $titleText, $this->seenTitles ) ) {
			// todo: skip seen titles and show only the latest?
			// return;
		}
		$this->seenTitles[$titleText] = true;

		$comment = $row->rc_comment;
		$ts = new MWTimestamp( $row->rc_timestamp );
		$revId = $row->rc_this_oldid;

		if ( $revId ) {
			$diffTitle = Title::makeTitle( NS_SPECIAL, 'MobileDiff/' . $revId ); // @fixme this seems lame
			$diffLink = $diffTitle->getLocalUrl();
		} else {
			// hack -- use full log entry display
			$diffLink = Title::makeTitle( $row->rc_namespace, $row->rc_title )->getLocalUrl();
		}

		if ( $row->rc_user == 0 ) {
			$username = $this->msg( 'mobile-frontend-changeslist-ip' )->plain();
			$usernameClass = 'mw-mf-user mw-mf-anon';
		} else {
			$username = htmlspecialchars( $row->rc_user_text );
			$usernameClass = 'mw-mf-user';
		}

		if ( $comment === '' ) {
			$comment = $this->msg( 'mobile-frontend-changeslist-nocomment' )->plain();
		} else {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = Sanitizer::stripAllTags( $comment );
		}

		$output->addHtml(
			'<li>' .
			Html::openElement( 'a', array( 'href' => $diffLink, 'class' => 'title' ) ) .
			Html::element( 'h2', array(), $titleText ).
			Html::element( 'div', array( 'class' => $usernameClass ), $username ).
			Html::element( 'p', array( 'class' => 'mw-mf-comment' ), $comment ) .
			Html::element( 'div', array( 'class' => 'mw-mf-time' ), $ts->getHumanTimestamp() ) .
			Html::closeElement( 'a' ) .
			'</li>'
		);

		wfProfileOut( __METHOD__ );
	}

	private function showListResultRow( $row ) {
		wfProfileIn( __METHOD__ );

		$output = $this->getOutput();
		$title = Title::makeTitle( $row->wl_namespace, $row->wl_title );
		$titleText = $title->getPrefixedText();
		$ts = new MWTimestamp( $row->rev_timestamp );
		$lastModified = wfMessage( 'mobile-frontend-watchlist-modified', $ts->getHumanTimestamp() )->text();

		$output->addHtml(
			Html::openElement( 'li', array( 'title' => $titleText ) ) .
			Html::openElement( 'a', array( 'href' => $title->getLocalUrl(), 'class' => 'title' ) ) .
			$this->renderThumb( $row ) .
			Html::element( 'h2', array(), $titleText ).
			Html::element( 'div', array( 'class' => 'mw-mf-time' ), $lastModified ) .
			Html::closeElement( 'a' ) .
			Html::closeElement( 'li' )
		);

		wfProfileOut( __METHOD__ );
	}

}
