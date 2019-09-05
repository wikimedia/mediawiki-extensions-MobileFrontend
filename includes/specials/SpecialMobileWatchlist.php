<?php

use MediaWiki\MediaWikiServices;
use Wikimedia\Rdbms\IResultWrapper;

/**
 * Implements the Watchlist special page
 */
class SpecialMobileWatchlist extends MobileSpecialPageFeed {
	// Performance-safe value with PageImages. Try to keep in sync with
	// WatchListGateway.
	const LIMIT = 50;

	const THUMB_SIZE = MobilePage::SMALL_IMAGE_WIDTH;
	const VIEW_OPTION_NAME = 'mfWatchlistView';
	const FILTER_OPTION_NAME = 'mfWatchlistFilter';
	const VIEW_LIST = 'a-z';
	const VIEW_FEED = 'feed';

	/** @var string $view Saves, how the watchlist is sorted: a-z or as a feed */
	private $view;

	public function __construct() {
		parent::__construct( 'Watchlist' );
	}

	/** @var string $filter Saves the actual used filter in feed view */
	private $filter;
	/** @var boolean $usePageImages Saves whether display images or not */
	private $usePageImages;

	/** @var Title $fromPageTitle Saves the Title object of the page list starts from */
	private $fromPageTitle;

	/**
	 * Render the special page
	 * @param string|null $par parameter submitted as subpage
	 */
	public function executeWhenAvailable( $par ) {
		// Anons don't get a watchlist
		$this->requireLogin( 'mobile-frontend-watchlist-purpose' );
		$this->usePageImages = ExtensionRegistry::getInstance()->isLoaded( 'PageImages' );

		$user = $this->getUser();
		$output = $this->getOutput();
		$output->addModules( 'mobile.special.watchlist.scripts' );
		$output->addModuleStyles( [
			'mobile.pagelist.styles',
			"mobile.placeholder.images",
			'mobile.pagesummary.styles',
		] );
		$req = $this->getRequest();

		# Show watchlist feed if that person is an editor
		$watchlistEditCountThreshold = $this->getConfig()->get( 'MFWatchlistEditCountThreshold' );
		$defaultView = $this->getUser()->getEditCount() > $watchlistEditCountThreshold ?
			self::VIEW_FEED : self::VIEW_LIST;
		$this->view = $req->getVal( 'watchlistview', $defaultView );

		$this->filter = $req->getVal( 'filter', $user->getOption( self::FILTER_OPTION_NAME, 'all' ) );
		$this->fromPageTitle = Title::newFromText( $req->getVal( 'from', false ) );

		$output->setPageTitle( $this->msg( 'watchlist' ) );

		if ( $this->view === self::VIEW_FEED ) {
			$output->addHTML( self::getWatchlistHeader( $user, $this->view, $this->filter ) );
			$output->addHTML(
				Html::openElement( 'div', [ 'class' => 'content-unstyled' ] )
			);
			$this->showRecentChangesHeader();
			$res = $this->doFeedQuery();

			if ( $res->numRows() ) {
				$this->showFeedResults( $res );
			} else {
				$this->showEmptyList( true );
			}
			$output->addHTML(
				Html::closeElement( 'div' )
			);
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
		$conds = [];
		switch ( $this->filter ) {
			case 'all':
				// no-op
				break;
			case 'articles':
				// @fixme content namespaces
				// Has to be unquoted or MySQL will filesort for wl_namespace
				$conds[] = "$column = 0";
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
	 * @param User $user the current user for obtaining default view and filter preferences
	 * @param string $view the name of the view to show (optional)
	 *  If absent a-z will be used.
	 * @param string|null $filter the name of the filter to show (optional)
	 *  If absent user preferences will be consulted, defaulting to `all` if no preference
	 * @return string Parsed HTML
	 */
	public static function getWatchlistHeader( User $user, $view = self::VIEW_LIST, $filter = null ) {
		$sp = SpecialPage::getTitleFor( 'Watchlist' );
		$attrsList = $attrsFeed = [];
		if ( $filter === null ) {
			$filter = $user->getOption( self::FILTER_OPTION_NAME, 'all' );
		}

		if ( $view === self::VIEW_FEED ) {
			$attrsList[ 'class' ] = MobileUI::buttonClass();
			// FIXME [MediaWiki UI] This probably be described as a different type of mediawiki ui element
			$attrsFeed[ 'class' ] = MobileUI::buttonClass( 'progressive', 'is-on' );
		} else {
			$attrsFeed[ 'class' ] = MobileUI::buttonClass();
			// FIXME [MediaWiki UI] This probably be described as a different type of mediawiki ui element
			$attrsList[ 'class' ] = MobileUI::buttonClass( 'progressive', 'is-on' );
		}

		$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();
		$html =
		Html::openElement( 'ul', [ 'class' => 'button-bar mw-ui-button-group' ] ) .
			Html::openElement( 'li', $attrsList ) .
			$linkRenderer->makeLink( $sp,
				wfMessage( 'mobile-frontend-watchlist-a-z' )->text(),
				[
					'class' => 'button',
					'data-view' => self::VIEW_LIST,
				],
				[ 'watchlistview' => self::VIEW_LIST ]
			) .
			Html::closeElement( 'li' ) .
			Html::openElement( 'li', $attrsFeed ) .
			$linkRenderer->makeLink( $sp,
				wfMessage( 'mobile-frontend-watchlist-feed' )->text(),
				[
					'class' => 'button',
					'data-view' => self::VIEW_FEED,
				],
				[ 'watchlistview' => self::VIEW_FEED, 'filter' => $filter ]
			) .
			Html::closeElement( 'li' ) .
			Html::closeElement( 'ul' );

		return '<div class="content-header">' . $html . '</div>';
	}

	/**
	 * Render "second" header for filter in feed view of watchlist
	 */
	private function showRecentChangesHeader() {
		$filters = [
			'all' => 'mobile-frontend-watchlist-filter-all',
			'articles' => 'mobile-frontend-watchlist-filter-articles',
			'talk' => 'mobile-frontend-watchlist-filter-talk',
			'other' => 'mobile-frontend-watchlist-filter-other',
		];
		$output = $this->getOutput();

		$output->addHTML(
			Html::openElement( 'ul', [ 'class' => 'mw-mf-watchlist-selector page-header-bar' ] )
		);

		foreach ( $filters as $filter => $msg ) {
			$itemAttrs = [];
			if ( $filter === $this->filter ) {
				$itemAttrs['class'] = 'selected';
			}
			$linkAttrs = [
				'data-filter' => $filter,
				'href' => $this->getPageTitle()->getLocalURL(
					[
						'filter' => $filter,
						'watchlistview' => self::VIEW_FEED,
					]
				)
			];
			$output->addHTML(
				Html::openElement( 'li', $itemAttrs ) .
				Html::element( 'a', $linkAttrs, $this->msg( $msg )->plain() ) .
				Html::closeElement( 'li' )
			);
		}

		$output->addHTML(
			Html::closeElement( 'ul' )
		);
	}

	/**
	 * Get watchlist items for feed view
	 * @return IResultWrapper
	 *
	 * @see getNSConditions()
	 * @see doPageImages()
	 */
	protected function doFeedQuery() {
		$user = $this->getUser();
		$dbr = wfGetDB( DB_REPLICA, 'watchlist' );

		// Possible where conditions
		$conds = $this->getNSConditions( 'rc_namespace' );

		// snip....

		// @todo This should be changed to use WatchedItemQuerySerivce

		$rcQuery = RecentChange::getQueryInfo();
		$tables = array_merge( $rcQuery['tables'], [ 'watchlist' ] );
		$fields = $rcQuery['fields'];
		$innerConds = [
			'wl_user' => $user->getId(),
			'wl_namespace=rc_namespace',
			'wl_title=rc_title',
			// FIXME: Filter out wikidata changes which currently show as anonymous (see bug 49315)
			'rc_type!=' . $dbr->addQuotes( RC_EXTERNAL ),
		];
		// Filter out category membership changes if configured
		if ( $user->getBoolOption( 'hidecategorization' ) ) {
			$innerConds[] = 'rc_type!=' . $dbr->addQuotes( RC_CATEGORIZE );
		}
		$join_conds = [
			'watchlist' => [
				'INNER JOIN',
				$innerConds,
			],
		] + $rcQuery['joins'];
		$query_options = [
			'ORDER BY' => 'rc_timestamp DESC',
			'LIMIT' => self::LIMIT
		];

		$rollbacker = $user->isAllowed( 'rollback' );
		if ( $rollbacker ) {
			$tables[] = 'page';
			$join_conds['page'] = [ 'LEFT JOIN', 'rc_cur_id=page_id' ];
			if ( $rollbacker ) {
				$fields[] = 'page_latest';
			}
		}

		ChangeTags::modifyDisplayQuery( $tables, $fields, $conds, $join_conds, $query_options, '' );

		return $dbr->select( $tables, $fields, $conds, __METHOD__, $query_options, $join_conds );
	}

	/**
	 * Show results of doFeedQuery
	 * @param IResultWrapper $res Result wrapper returned from db
	 *
	 * @see showResults()
	 */
	protected function showFeedResults( IResultWrapper $res ) {
		$this->showResults( $res, true );
	}

	/**
	 * Render the Watchlist items.
	 * When ?from not set, adds a link "more" to see the other watchlist items.
	 * @param IResultWrapper $res Result wrapper from db
	 * @param bool $feed Render as feed (true) or list (false) view?
	 * @todo FIXME: use templates/PageList.html when server side templates
	 * are available to keep consistent with nearby view
	 */
	protected function showResults( IResultWrapper $res, $feed ) {
		$output = $this->getOutput();

		if ( $feed ) {
			foreach ( $res as $row ) {
				$this->showFeedResultRow( $row );
			}
		}

		$output->addHTML( '</ul>' );
	}

	/**
	 * If the user doesn't watch any page, show information how to watch some.
	 * @param bool $feed Render as feed (true) or list (false) view?
	 */
	private function showEmptyList( $feed ) {
		$this->getOutput()->addHTML( self::getEmptyListHtml( $feed, $this->getLanguage() ) );
	}

	/**
	 * Get the HTML needed to show if a user doesn't watch any page, show information
	 * how to watch pages where no pages have been watched.
	 * @param bool $feed Render as feed (true) or list (false) view?
	 * @param Language $lang The language of the current mode
	 * @return string
	 */
	public static function getEmptyListHtml( $feed, $lang ) {
		$dir = $lang->isRTL() ? 'rtl' : 'ltr';

		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$imgUrl = $config->get( 'ExtensionAssetsPath' ) .
			"/MobileFrontend/images/emptywatchlist-page-actions-$dir.png";

		if ( $feed ) {
			$msg = Html::element( 'p', null, wfMessage( 'mobile-frontend-watchlist-feed-empty' )->plain() );
		} else {
			$msg = Html::element( 'p', null,
				wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto' )->plain()
			);
			$msg .=	Html::element( 'img', [
				'src' => $imgUrl,
				'alt' => wfMessage( 'mobile-frontend-watchlist-a-z-empty-howto-alt' )->plain(),
			] );
		}

		return Html::openElement( 'div', [ 'class' => 'info empty-page' ] ) .
				$msg .
				Html::element( 'a',
					[ 'class' => 'button', 'href' => Title::newMainPage()->getLocalURL() ],
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
		$store = MediaWikiServices::getInstance()->getCommentStore();
		$comment = $this->formatComment(
			$store->getComment( 'rc_comment', $row )->text, $title
		);
		$ts = new MWTimestamp( $row->rc_timestamp );
		$username = $row->rc_user != 0
			? $row->rc_user_text
			: IP::prettifyIP( $row->rc_user_text );
		$revId = $row->rc_this_oldid;
		$bytes = $row->rc_new_len - $row->rc_old_len;
		$isAnon = $row->rc_user == 0;
		$isMinor = $row->rc_minor != 0;

		if ( $revId ) {
			$diffTitle = SpecialPage::getTitleFor( 'MobileDiff', $revId );
			$diffLink = $diffTitle->getLocalURL();
		} else {
			// hack -- use full log entry display
			$diffLink = Title::makeTitle( $row->rc_namespace, $row->rc_title )->getLocalURL();
		}

		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title, $isAnon, $bytes,
			$isMinor );
	}

	/**
	 * Formats a comment of revision via Linker:formatComment and Sanitizer::stripAllTags
	 * @param string $comment
	 * @param Title $title the title object of comments page
	 * @return string formatted comment
	 */
	protected function formatComment( $comment, $title ) {
		if ( $comment !== '' ) {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = htmlspecialchars( Sanitizer::stripAllTags( $comment ) );
		}
		return $comment;
	}
}
