<?php

class SpecialMobileWatchlist extends SpecialWatchlist {
	const LIMIT = 50; // Performance-safe value with PageImages
	const THUMB_SIZE = 150;
	const VIEW_OPTION_NAME = 'mfWatchlistView';
	const FILTER_OPTION_NAME = 'mfWatchlistFilter';

	private $filter,
		$seenTitles,
		$seenDays,
		$today,
		$usePageImages,
		$optionsChanged = false;

	/** @var Title */
	private $fromPageTitle;

	function execute( $par ) {
		wfProfileIn( __METHOD__ );

		$ctx = MobileContext::singleton();
		$this->usePageImages = !$ctx->imagesDisabled() && defined( 'PAGE_IMAGES_INSTALLED' );

		$user = $this->getUser();
		$output = $this->getOutput();
		$output->addModuleStyles( 'mobile.watchlist.styles' );
		$output->addModules( 'mobile.watchlist.scripts' );
		$req = $this->getRequest();
		$view = $req->getVal( 'watchlistview', 'a-z' );
		$this->fromPageTitle = Title::newFromText( $req->getVal( 'from', false ) );

		$this->setHeaders();
		$output->setPageTitle( $this->msg( 'watchlist' ) );

		if( $user->isAnon() ) {
			// No watchlist for you.
			parent::execute( $par );
			wfProfileOut( __METHOD__ );
			return;
		} else {
			$output->setProperty( 'unstyledContent', true );
		}

		if ( $view === 'feed' ) {
			$this->filter = $this->getRequest()->getVal( 'filter', 'all' );
			$this->showRecentChangesHeader();
			$res = $this->doFeedQuery();
			$this->showFeedResults( $res );
			// make filter stick on feed view
			$this->updatePreference( self::FILTER_OPTION_NAME, $this->filter );
		} else {
			$this->filter = $this->getRequest()->getVal( 'filter', 'articles' );
			$res = $this->doListQuery();
			$this->showListResults( $res );
		}

		// make view sticky
		$this->updatePreference( self::VIEW_OPTION_NAME, $view );
		if ( $this->optionsChanged ) {
			$user->saveSettings();
		}
		$this->getOutput()->setProperty( 'mobile.htmlHeader', $this->getWatchlistHeader() );

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
		$user = $this->getUser();
		$sp = SpecialPage::getTitleFor( 'Watchlist' );
		$attrsList = $attrsFeed = array();
		$view = $user->getOption( SpecialMobileWatchlist::VIEW_OPTION_NAME, 'a-z' );
		$filter = $user->getOption( SpecialMobileWatchlist::FILTER_OPTION_NAME, 'all' );
		if ( $view === 'feed' ) {
			$attrsFeed[ 'class' ] = 'active';
		} else {
			$attrsList[ 'class' ] = 'active';
		}

		$html =
		Html::openElement( 'ul', array( 'class' => 'button-bar' ) ) .
			Html::openElement( 'li', $attrsList ) .
			Linker::link( $sp,
				wfMessage( 'mobile-frontend-watchlist-a-z' )->text(),
				array( 'class' => 'button' ),
				array( 'watchlistview' => 'a-z' )
			) .
			Html::closeElement( 'li' ) .
			Html::openElement( 'li', $attrsFeed ) .
			Linker::link( $sp,
				wfMessage( 'mobile-frontend-watchlist-feed' )->text(),
				array( 'class' => 'button' ),
				array( 'watchlistview' => 'feed', 'filter' => $filter )
			) .
			Html::closeElement( 'li' ) .
			Html::closeElement( 'ul' );

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
					'wl_title=rc_title',
					// FIXME: Filter out wikidata changes which currently show as anonymous (see bug 49315)
					'rc_type!=' . RC_EXTERNAL,
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
		wfRunHooks( 'SpecialWatchlistQuery', array( &$conds, &$tables, &$join_conds, &$fields, &$values ) );

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
			'page' => array( 'LEFT JOIN', array(
				'wl_namespace = page_namespace',
				'wl_title = page_title'
			)	),
			'revision' => array( 'LEFT JOIN', array(
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

	// FIXME: use templates/articleList.html to keep consistent with nearby view
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
						'class' => $feed ? 'page-list' : 'page-list a-to-z',
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
							'class' => 'more',
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
		$dir = $this->getLanguage()->isRTL() ? 'rtl' : 'ltr';

		// FIXME: This is necessary until new nav pushed to beta
		if ( MobileContext::singleton()->isBetaGroupMember() ) {
			$imgUrl = $wgExtensionAssetsPath . "/MobileFrontend/images/emptywatchlist-page-actions-$dir.png";
		} else {
			$imgUrl = $wgExtensionAssetsPath . "/MobileFrontend/images/emptywatchlist-$dir.png";
		}
		if ( $feed ) {
			$msg = Html::element( 'p', null, wfMessage( 'mobile-frontend-watchlist-feed-empty' )->plain() );
		} else {
			$msg  = Html::element( 'p', null, wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto' )->plain() ) .
				Html::element( 'img', array(
					'src' => $imgUrl,
					'alt' => wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto-alt' )->plain(),
					)
				);
		}

		$output->addHtml(
				Html::openElement( 'div', array( 'class' => 'info' ) ) .
				$msg .
				Html::openElement( 'div' ) .
				Html::element( 'a',
					array( 'class' => 'button', 'href' => Title::newMainPage()->getLocalUrl() ),
					wfMessage( 'mobile-frontend-watchlist-back-home' )->plain()
				) .
				Html::closeElement( 'div' ) .
				Html::closeElement( 'div' )
		);
	}

	private function day( $ts ) {
		return $this->getLanguage()->date( $ts, true );
	}

	private function renderThumb( $row ) {
		wfProfileIn( __METHOD__ );

		if ( $this->usePageImages ) {
			$needsPhoto = true;
			$props = array(
				'class' => 'listThumb needsPhoto',
			);
			if ( !is_null( $row->pp_value ) ) {
				$file = wfFindFile( $row->pp_value );
				if ( $file ) {
					$thumb = $file->transform( array( 'width' => self::THUMB_SIZE, 'height' => self::THUMB_SIZE ) );
					if ( $thumb ) {
						$needsPhoto = false;
						$props = array(
								'class' => 'listThumb ' . ( $thumb->getWidth() > $thumb->getHeight() ? 'listThumbH' : 'listThumbV' ),
								'style' => 'background-image: url("' . wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT ) . '")',
						);
					}
				}
			}
			return array(
				'html' => Html::element( 'div', $props ),
				'needsPhoto' => $needsPhoto,
			);
		}

		wfProfileOut( __METHOD__ );
		return array(
			'html' => '',
		);
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
			Html::element( 'div', array( 'class' => 'info' ), $ts->getHumanTimestamp() ) .
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
		$ts = $row->rev_timestamp;
		if ( $ts ) {
			$ts = new MWTimestamp( $ts );
			$lastModified = wfMessage( 'mobile-frontend-watchlist-modified', $ts->getHumanTimestamp() )->text();
			$className = 'title';
		} else {
			$className = 'title new';
			$lastModified = '';
		}

		$thumb = $this->renderThumb( $row );

		$output->addHtml(
			Html::openElement( 'li', array( 'title' => $titleText ) ) .
			Html::openElement( 'a', array( 'href' => $title->getLocalUrl(), 'class' => $className ) ) .
			$thumb['html'] .
			Html::element( 'h2', array(), $titleText ).
			Html::element( 'div', array( 'class' => 'info' ), $lastModified ) .
			Html::closeElement( 'a' ) .
			Html::closeElement( 'li' )
		);

		wfProfileOut( __METHOD__ );
	}

	private function updatePreference( $name, $value ) {
		$user = $this->getUser();
		if ( $user->getOption( $name ) != $value ) {
			$user->setOption( $name, $value );
			$this->optionsChanged = true;
		}
	}
}
