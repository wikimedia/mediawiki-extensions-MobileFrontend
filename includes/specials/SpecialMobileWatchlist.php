<?php
/**
 * SpecialMobileWatchlist.php
 */

/**
 * Implements the Watchlist special page
 */
class SpecialMobileWatchlist extends MobileSpecialPageFeed {
	const LIMIT = 50; // Performance-safe value with PageImages
	const THUMB_SIZE = MobilePage::SMALL_IMAGE_WIDTH;
	const VIEW_OPTION_NAME = 'mfWatchlistView';
	const FILTER_OPTION_NAME = 'mfWatchlistFilter';

	/** @var string $view Saves, how the watchlist is sorted: a-z or as a feed */
	private $view;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'Watchlist' );
	}
	/** @var string $filter Saves the actual used filter in feed view */
	private $filter;
	/** @var boolean $usePageImages Saves whether display images or not */
	private $usePageImages;
	/**
	 * @var boolean $optionsChanged Set true, when the user changed the
	 *	view or feed of watchlist to save the new settings
	 */
	private $optionsChanged = false;

	/** @var Title $fromPageTitle Saves the Title object of the page list starts from */
	private $fromPageTitle;


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

	/**
	 * Render the special page
	 * @param string $par parameter submitted as subpage
	 */
	function executeWhenAvailable( $par ) {
		// Anons don't get a watchlist
		$this->requireLogin( 'watchlistanontext' );

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

		// This needs to be done before calling getWatchlistHeader
		$this->updateStickyTabs();
		if ( $this->optionsChanged ) {
			$user->saveSettings();
		}

		if ( $this->view === 'feed' ) {
			$output->addHtml( $this->getWatchlistHeader( $user ) );
			$this->showRecentChangesHeader();
			$res = $this->doFeedQuery();

			if ( $res->numRows() ) {
				$this->showFeedResults( $res );
			} else {
				$this->showEmptyList( true );
			}
		} else {
			$output->redirect( SpecialPage::getTitleFor( 'EditWatchlist' )->getLocalURL() );
		}
	}

	/**
	 * Returns an array of conditions restricting namespace in queries
	 * @param string $column Namespace db key
	 *
	 * @return array
	 */
	protected function getNSConditions( $column ) {
		$conds = array();
		switch ( $this->filter ) {
			case 'all':
				// no-op
				break;
			case 'articles':
				// @fixme content namespaces
				$conds[] = "$column = 0"; // Has to be unquoted or MySQL will filesort for wl_namespace
				break;
			case 'talk':
				// check project talk, user talk and talk pages
				$conds[] = "$column IN (1, 3, 5)";
				break;
			case 'other':
				// @fixme
				$conds[] = "$column NOT IN (0, 1, 3, 5)";
				break;
		}
		return $conds;
	}

	/**
	 * Get the header for the watchlist page
	 * @param User user
	 * @return string Parsed HTML
	 */
	public static function getWatchlistHeader( User $user ) {
		$sp = SpecialPage::getTitleFor( 'Watchlist' );
		$attrsList = $attrsFeed = array();
		$view = $user->getOption( SpecialMobileWatchlist::VIEW_OPTION_NAME, 'a-z' );
		$filter = $user->getOption( SpecialMobileWatchlist::FILTER_OPTION_NAME, 'all' );
		if ( $view === 'feed' ) {
			$attrsList[ 'class' ] = MobileUI::buttonClass();
			// FIXME [MediaWiki UI] This probably be described as a different type of mediawiki ui element
			$attrsFeed[ 'class' ] = MobileUI::buttonClass( 'progressive', 'active' );
		} else {
			$attrsFeed[ 'class' ] = MobileUI::buttonClass();
			// FIXME [MediaWiki UI] This probably be described as a different type of mediawiki ui element
			$attrsList[ 'class' ] = MobileUI::buttonClass( 'progressive', 'active' );
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

		return '<div class="content-header">' . $html . '</div>';
	}

	/**
	 * Render "second" header for filter in feed view of watchlist
	 */
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

		foreach ( $filters as $filter => $msg ) {
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

	/**
	 * Get watchlist items for feed view
	 * @return ResultWrapper
	 *
	 * @see getNSConditions()
	 * @see doPageImages()
	 */
	protected function doFeedQuery() {
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
		Hooks::run(
			'SpecialWatchlistQuery',
			array( &$conds, &$tables, &$join_conds, &$fields, &$values )
		);

		$res = $dbr->select( $tables, $fields, $conds, __METHOD__, $options, $join_conds );

		return $res;
	}

	/**
	 * Show results of doFeedQuery
	 * @param ResultWrapper $res ResultWrapper returned from db
	 *
	 * @see showResults()
	 */
	protected function showFeedResults( ResultWrapper $res ) {
		$this->showResults( $res, true );
	}

	/**
	 * Render the Watchlist items.
	 * When ?from not set, adds a link "more" to see the other watchlist items.
	 * @param ResultWrapper $res ResultWrapper from db
	 * @param boolean $feed Render as feed (true) or list (false) view?
	 * @todo FIXME: use templates/PageList.html when server side templates
	 * are available to keep consistent with nearby view
	 */
	protected function showResults( ResultWrapper $res, $feed ) {
		$output = $this->getOutput();

		if ( $feed ) {
			foreach ( $res as $row ) {
				$this->showFeedResultRow( $row );
			}
		}

		$output->addHtml( '</ul>' );
	}

	/**
	 * If the user doesn't watch any page, show information how to watch some.
	 * @param boolean $feed Render as feed (true) or list (false) view?
	 */
	function showEmptyList( $feed ) {
		$this->getOutput()->addHtml( self::getEmptyListHtml( $feed, $this->getLanguage() ) );
	}

	/**
	 * Get the HTML needed to show if a user doesn't watch any page, show information
	 * how to watch pages where no pages have been watched.
	 * @param boolean $feed Render as feed (true) or list (false) view?
	 * @param Language $lang The language of the current mode
	 * @return string
	 */
	public static function getEmptyListHtml( $feed, $lang ) {
		$dir = $lang->isRTL() ? 'rtl' : 'ltr';

		$imgUrl = MobileContext::singleton()->getConfig()->get( 'ExtensionAssetsPath' ) .
			"/MobileFrontend/images/emptywatchlist-page-actions-$dir.png";

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

		return Html::openElement( 'div', array( 'class' => 'info empty-page' ) ) .
				$msg .
				Html::element( 'a',
					array( 'class' => 'button', 'href' => Title::newMainPage()->getLocalUrl() ),
					wfMessage( 'mobile-frontend-watchlist-back-home' )->plain()
				) .
				Html::closeElement( 'div' );
	}

	/**
	 * Render a result row in feed view
	 * @param object $row a row of db result
	 */
	protected function showFeedResultRow( $row ) {
		if ( $row->rc_deleted ) {
			return;
		}

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
	}

	/**
	 * Save the settings for the watchlist, so if the user comes back
	 * later he see the same filter and list view
	 * @param string $name The name of the option to set
	 * @param string|boolean $value The value for the option to set
	 */
	private function updatePreference( $name, $value ) {
		$user = $this->getUser();
		if ( $user->getOption( $name ) != $value ) {
			$user->setOption( $name, $value );
			$this->optionsChanged = true;
		}
	}

	/**
	 * Formats a comment of revision via Linker:formatComment and Sanitizer::stripAllTags
	 * @param string $comment the comment
	 * @param string $title the title object of comments page
	 * @return string formatted comment
	 */
	protected function formatComment( $comment, $title ) {
		if ( $comment !== '' ) {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = Sanitizer::stripAllTags( $comment );
		}
		return $comment;
	}
}
