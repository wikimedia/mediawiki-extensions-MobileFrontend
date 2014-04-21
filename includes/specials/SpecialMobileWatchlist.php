<?php

class SpecialMobileWatchlist extends MobileSpecialPageFeed {
	const LIMIT = 50; // Performance-safe value with PageImages
	const THUMB_SIZE = 150;
	const VIEW_OPTION_NAME = 'mfWatchlistView';
	const FILTER_OPTION_NAME = 'mfWatchlistFilter';

	public function __construct() {
		parent::__construct( 'Watchlist' );
	}

	private $filter,
		$usePageImages,
		$optionsChanged = false;

	/** @var Title */
	private $fromPageTitle;

	protected function renderAnonBanner() {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'watchnologin' ) );
		$out->setRobotPolicy( 'noindex,nofollow' );
		$link = Linker::linkKnown(
			SpecialPage::getTitleFor( 'Userlogin' ),
			$this->msg( 'loginreqlink' )->escaped(),
			array(),
			array( 'returnto' => $this->getPageTitle()->getPrefixedText() )
		);
		$out->addHTML(
			Html::openElement( 'div', array( 'class' => 'alert warning' ) ) .
			$this->msg( 'watchlistanontext' )->rawParams( $link )->parse() .
			Html::closeElement( 'div' )
		);
	}

	/**
	 * Saves a user preference that reflects the current state of the watchlist
	 * e.g. whether it is the feed or A-Z view and which filters are currently applied.
	 */
	protected function updateStickyTabs() {
		if ( $this->view === 'feed' ) {
			// make filter stick on feed view
			$this->updatePreference( self::FILTER_OPTION_NAME, $this->filter );
		}
		// make view sticky
		$this->updatePreference( self::VIEW_OPTION_NAME, $this->view );
	}

	function executeWhenAvailable( $par ) {
		wfProfileIn( __METHOD__ );
		$ctx = MobileContext::singleton();
		$this->usePageImages = !$ctx->imagesDisabled() && defined( 'PAGE_IMAGES_INSTALLED' );

		$user = $this->getUser();
		$output = $this->getOutput();
		$output->addModules( 'skins.minerva.special.watchlist.scripts' );
		$req = $this->getRequest();
		$this->view = $req->getVal( 'watchlistview', 'a-z' );
		$this->filter = $req->getVal( 'filter', 'all' );
		$this->fromPageTitle = Title::newFromText( $req->getVal( 'from', false ) );

		$output->setPageTitle( $this->msg( 'watchlist' ) );

		if( $user->isAnon() ) {
			// No watchlist for you.
			$this->renderAnonBanner();
			wfProfileOut( __METHOD__ );
			return;
		}

		// This needs to be done before calling getWatchlistHeader
		$this->updateStickyTabs();

		$output->addHtml( '<div class="content-header">' . $this->getWatchlistHeader() . '</div>' );

		if ( $this->view === 'feed' ) {
			$this->showRecentChangesHeader();
			$res = $this->doFeedQuery();

			if ( $res->numRows() ) {
				$this->showFeedResults( $res );
			} else {
				$this->showEmptyList( true );
			}
		} else {
			$this->filter = $this->getRequest()->getVal( 'filter', 'articles' );
			$res = $this->doListQuery();
			if ( $res->numRows() ) {
				$this->showListResults( $res );
			} else {
				$this->showEmptyList( false );
			}
		}

		if ( $this->optionsChanged ) {
			$user->saveSettings();
		}

		wfProfileOut( __METHOD__ );
	}

	/**
	 * Returns an array of conditions restricting namespace in queries
	 * @param string $column
	 *
	 * @return array
	 */
	protected function getNSConditions( $column ) {
		$conds = array();
		switch( $this->filter ) {
			case 'all':
				// no-op
				break;
			case 'articles':
				// @fixme content namespaces
				$conds[] = "$column = 0"; // Has to be unquoted or MySQL will filesort for wl_namespace
				break;
			case 'talk':
				// @fixme associate with content namespaces? or all talks?
				$conds[] = "$column = 1";
				break;
			case 'other':
				// @fixme
				$conds[] = "$column IN (2, 4)";
				break;
		}
		return $conds;
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
			$attrsList[ 'class' ] = 'mw-ui-button';
			// FIXME [MediaWiki UI] This probably be described as a different type of mediawiki ui element
			$attrsFeed[ 'class' ] = 'active mw-ui-progressive mw-ui-button';
		} else {
			$attrsFeed[ 'class' ] = 'mw-ui-button';
			// FIXME [MediaWiki UI] This probably be described as a different type of mediawiki ui element
			$attrsList[ 'class' ] = 'active mw-ui-progressive mw-ui-button';
		}

		$html =
		Html::openElement( 'ul', array( 'class' => 'button-bar mw-ui-button-group' ) ) .
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
			Html::openElement( 'ul', array( 'class' => 'mw-mf-watchlist-selector page-header-bar' ) )
		);

		foreach( $filters as $filter => $msg ) {
			$itemAttrs = array();
			if ( $filter === $this->filter ) {
				$itemAttrs['class'] = 'selected';
			}
			$linkAttrs = array(
				'href' => $this->getPageTitle()->getLocalUrl(
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

	protected function doFeedQuery() {
		wfProfileIn( __METHOD__ );

		$user = $this->getUser();
		$dbr = wfGetDB( DB_SLAVE, 'watchlist' );

		# Possible where conditions
		$conds = $this->getNSConditions( 'rc_namespace' );

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

		ChangeTags::modifyDisplayQuery( $tables, $fields, $conds, $join_conds, $options, '' );
		// Until 1.22, MediaWiki used an array here. Since 1.23 (Iec4aab87), it uses a FormOptions
		// object (which implements array-like interface ArrayAccess).
		// Let's keep using an array and hope any new extensions are compatible with both styles...
		$values = array();
		wfRunHooks(
			'SpecialWatchlistQuery',
			array( &$conds, &$tables, &$join_conds, &$fields, &$values )
		);

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
		$conds = $this->getNSConditions( 'wl_namespace' );
		$conds['wl_user'] = $user->getId();
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

	protected function showFeedResults( ResultWrapper $res ) {
		$this->showResults( $res, true );
	}

	protected function showListResults( ResultWrapper $res ) {
		$output = $this->getOutput();
		$output->addHtml(
			Html::openElement( 'ul', array( 'class' => 'watchlist ' . 'page-list thumbs' ) )
		);

		$this->showResults( $res, false );
	}

	// FIXME: use templates/articleList.html to keep consistent with nearby view
	protected function showResults( ResultWrapper $res, $feed ) {
		wfProfileIn( __METHOD__ );

		$output = $this->getOutput();

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

		wfProfileOut( __METHOD__ );
	}

	function showEmptyList( $feed ) {
		global $wgExtensionAssetsPath;
		$output = $this->getOutput();
		$dir = $this->getLanguage()->isRTL() ? 'rtl' : 'ltr';

		$imgUrl = $wgExtensionAssetsPath . "/MobileFrontend/images/emptywatchlist-page-actions-$dir.png";

		if ( $feed ) {
			$msg = Html::element( 'p', null, wfMessage( 'mobile-frontend-watchlist-feed-empty' )->plain() );
		} else {
			$msg = Html::element( 'p', null,
				wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto' )->plain()
			);
			$msg .=	Html::element( 'img', array(
				'src' => $imgUrl,
				'alt' => wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto-alt' )->plain(),
			) );
		}

		$output->addHtml(
			Html::openElement( 'div', array( 'class' => 'info empty-page' ) ) .
				$msg .
				Html::element( 'a',
					array( 'class' => 'button', 'href' => Title::newMainPage()->getLocalUrl() ),
					wfMessage( 'mobile-frontend-watchlist-back-home' )->plain()
				) .
				Html::closeElement( 'div' )
		);
	}

	// FIXME: Refactor to use MobilePage
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
					$thumb = $file->transform( array(
						'width' => self::THUMB_SIZE,
						'height' => self::THUMB_SIZE )
					);

					if ( $thumb ) {
						$needsPhoto = false;
						$props = array(
							'class' => 'listThumb ' . ( $thumb->getWidth() > $thumb->getHeight()
								? 'listThumbH'
								: 'listThumbV' ),
							'style' => 'background-image: url("' .
								wfExpandUrl( $thumb->getUrl(), PROTO_CURRENT ) . '")',
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

	protected function showFeedResultRow( $row ) {
		wfProfileIn( __METHOD__ );

		if ( $row->rc_deleted ) {
			wfProfileOut( __METHOD__ );
			return;
		}

		$output = $this->getOutput();
		$user = $this->getUser();
		$lang = $this->getLanguage();

		$date = $lang->userDate( $row->rc_timestamp, $user );
		$this->renderListHeaderWhereNeeded( $date );

		$title = Title::makeTitle( $row->rc_namespace, $row->rc_title );
		$comment = $this->formatComment( $row->rc_comment, $title );
		$ts = new MWTimestamp( $row->rc_timestamp );
		$username = $row->rc_user != 0
			? htmlspecialchars( $row->rc_user_text )
			: IP::prettifyIP( $row->rc_user_text );
		$revId = $row->rc_this_oldid;
		$bytes = $row->rc_new_len - $row->rc_old_len;
		$isAnon = $row->rc_user == 0;
		$isMinor = $row->rc_minor != 0;

		if ( $revId ) {
			$diffTitle = SpecialPage::getTitleFor( 'MobileDiff', $revId );
			$diffLink = $diffTitle->getLocalUrl();
		} else {
			// hack -- use full log entry display
			$diffLink = Title::makeTitle( $row->rc_namespace, $row->rc_title )->getLocalUrl();
		}

		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title, $isAnon, $bytes,
			$isMinor );
		wfProfileOut( __METHOD__ );
	}

	protected function showListResultRow( $row ) {
		wfProfileIn( __METHOD__ );

		$output = $this->getOutput();
		$title = Title::makeTitle( $row->wl_namespace, $row->wl_title );
		$titleText = $title->getPrefixedText();
		$ts = $row->rev_timestamp;
		if ( $ts ) {
			$ts = new MWTimestamp( $ts );
			$lastModified = wfMessage(
				'mobile-frontend-watchlist-modified',
				$ts->getHumanTimestamp()
			)->text();
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
			Html::element( 'h3', array(), $titleText ).
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

	protected function formatComment( $comment, $title ) {
		if ( $comment !== '' ) {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = Sanitizer::stripAllTags( $comment );
		}
		return $comment;
	}
}
