<?php

use MediaWiki\Html\Html;
use MediaWiki\MediaWikiServices;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;
use MediaWiki\User\UserIdentity;
use MediaWiki\Utils\MWTimestamp;
use Wikimedia\IPUtils;
use Wikimedia\Rdbms\IConnectionProvider;
use Wikimedia\Rdbms\IResultWrapper;

/**
 * Implements the Watchlist special page
 * @deprecated in future this should use the core Watchlist page (T109277)
 */
class SpecialMobileWatchlist extends MobileSpecialPageFeed {
	// Performance-safe value with PageImages. Try to keep in sync with
	// WatchListGateway.
	public const LIMIT = 50;

	public const VIEW_OPTION_NAME = 'mfWatchlistView';
	public const FILTER_OPTION_NAME = 'mfWatchlistFilter';
	public const VIEW_FEED = 'feed';

	public const WATCHLIST_TAB_PATHS = [
		'Special:Watchlist',
		'Special:EditWatchlist'
	];

	private IConnectionProvider $connectionProvider;

	public function __construct( IConnectionProvider $connectionProvider ) {
		parent::__construct( 'Watchlist' );

		$this->connectionProvider = $connectionProvider;
	}

	/** @var string Saves the actual used filter in feed view */
	private $filter;
	/** @var bool Saves whether display images or not */
	private $usePageImages;

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
		$output->addBodyClasses( 'mw-mf-special-page' );
		$output->addModules( 'mobile.special.watchlist.scripts' );
		$output->addModuleStyles( [
			'mobile.pagelist.styles',
			'mobile.pagesummary.styles',
		] );
		$req = $this->getRequest();

		$userOption = $this->getUserOptionsLookup()->getOption(
			$user,
			self::FILTER_OPTION_NAME,
			'all'
		);
		$this->filter = $req->getVal( 'filter', $userOption );

		$output->setPageTitleMsg( $this->msg( 'watchlist' ) );

		$res = $this->doFeedQuery();
		$this->addWatchlistHTML( $res, $user );
	}

	/**
	 * Builds the watchlist HTML inside the associated OutputPage
	 * @param IResultWrapper $res
	 * @param UserIdentity $user
	 */
	public function addWatchlistHTML( IResultWrapper $res, UserIdentity $user ) {
		$output = $this->getOutput();
		$output->addHTML(
			Html::openElement( 'div', [ 'class' => 'content-unstyled' ] )
		);
		$this->showRecentChangesHeader();

		if ( $res->numRows() ) {
			$this->showFeedResults( $res );
		} else {
			$this->showEmptyList( true );
		}
		$output->addHTML(
			Html::closeElement( 'div' )
		);
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
		$dbr = $this->connectionProvider->getReplicaDatabase( false, 'watchlist' );

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
			// FIXME: Filter out wikidata changes which currently show as anonymous (see T51315)
			'rc_type!=' . $dbr->addQuotes( RC_EXTERNAL ),
		];
		// Filter out category membership changes if configured
		$userOption = $this->userOptionsLookup->getBoolOption( $user, 'hidecategorization' );
		if ( $userOption ) {
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

		$rollbacker = MediaWikiServices::getInstance()->getPermissionManager()
			->userHasRight( $user, 'rollback' );
		if ( $rollbacker ) {
			$tables[] = 'page';
			$join_conds['page'] = [ 'LEFT JOIN', 'rc_cur_id=page_id' ];
			$fields[] = 'page_latest';
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
	 */
	protected function showResults( IResultWrapper $res, $feed ) {
		$output = $this->getOutput();

		if ( $feed ) {
			foreach ( $res as $row ) {
				$this->showFeedResultRow( $row );
			}
		}
		// Close .side-list element opened in renderListHeaderWhereNeeded
		// inside showFeedResultRow function
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
			$msg = Html::element( 'p', [], wfMessage( 'mobile-frontend-watchlist-feed-empty' )->plain() );
		} else {
			$msg = Html::element( 'p', [],
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
	 * @param \stdClass $row a row of db result
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
			: IPUtils::prettifyIP( $row->rc_user_text );
		$revId = $row->rc_this_oldid;
		$bytes = $row->rc_new_len - $row->rc_old_len;
		$isAnon = $row->rc_user == 0;
		$isMinor = $row->rc_minor != 0;

		if ( $revId ) {
			$diffTitle = SpecialPage::getTitleFor( 'MobileDiff', (string)$revId );
			$diffLink = $diffTitle->getLocalURL();
		} else {
			// hack -- use full log entry display
			$diffLink = Title::makeTitle( $row->rc_namespace, $row->rc_title )->getLocalURL();
		}

		$options = [
			'ts' => $ts,
			'diffLink' => $diffLink,
			'username' => $username,
			'comment' => $comment,
			'title' => $title,
			'isAnon' => $isAnon,
			'bytes' => $bytes,
			'isMinor' => $isMinor,
		];
		$this->renderFeedItemHtml( $options );
	}

	/**
	 * @inheritDoc
	 */
	public function getShortDescription( string $path = '' ): string {
		return $this->msg( 'watchlisttools-view' )->text();
	}

	/**
	 * @inheritDoc
	 */
	public function getAssociatedNavigationLinks() {
		return self::WATCHLIST_TAB_PATHS;
	}
}
