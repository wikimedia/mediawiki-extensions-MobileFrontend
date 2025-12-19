<?php

use MediaWiki\FileRepo\RepoGroup;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\Html\Html;
use MediaWiki\MainConfigNames;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Specials\SpecialEditWatchlist;
use MediaWiki\Title\Title;
use MediaWiki\Watchlist\WatchedItemStoreInterface;
use MobileFrontend\Hooks\HookRunner;
use MobileFrontend\Models\MobileCollection;
use MobileFrontend\Models\MobilePage;

/**
 * The mobile version of the watchlist editing page.
 * @deprecated in future this should be the core SpecialEditWatchlist page (T109277)
 */
class SpecialMobileEditWatchlist extends SpecialEditWatchlist {
	private const WATCHLIST_TAB_PATHS = [
		'Special:Watchlist',
		'Special:EditWatchlist'
	];
	private const LIMIT = 50;

	/** @var string The name of the title to begin listing the watchlist from */
	protected readonly string $offsetTitle;

	public function __construct(
		private readonly HookContainer $hookContainer,
		private readonly RepoGroup $repoGroup,
		WatchedItemStoreInterface $watchedItemStore,
	) {
		$req = $this->getRequest();
		$this->offsetTitle = $req->getVal( 'from', '' );
		parent::__construct( $watchedItemStore );
	}

	/**
	 * Get a paged list of titles on a user's watchlist, excluding talk pages,
	 * and return as a two-dimensional array with namespace and title.
	 *
	 * @return array
	 */
	protected function getWatchlistInfo(): array {
		$titles = [];
		$lb = $this->linkBatchFactory->newLinkBatch();

		$this->pager->doQuery();
		$watchedItems = $this->pager->getOrderedResult();

		foreach ( $watchedItems as $item ) {
			$titles[$item->wl_namespace][$item->wl_title] = $item->expiry;
			$lb->add( $item->wl_namespace, $item->wl_title );
		}

		$lb->execute();
		return $titles;
	}

	/**
	 * Renders the subheader.
	 */
	protected function outputSubtitle() {
		$user = $this->getUser();
	}

	/**
	 * Gets the HTML fragment for a watched page. The client uses a very different
	 * structure for client-rendered items in PageListItem.hogan.
	 *
	 * @param MobilePage $mp a definition of the page to be rendered.
	 * @return string
	 */
	protected function getLineHtml( MobilePage $mp ) {
		$thumb = $mp->getSmallThumbnailHtml( true );
		$title = $mp->getTitle();
		if ( !$thumb ) {
			$thumb = Html::rawElement( 'div', [
				'class' => 'list-thumb list-thumb-placeholder'
				], Html::element( 'span', [
					'class' => 'mf-icon-image'
				] )
			);
		}
		$timestamp = $mp->getLatestTimestamp();
		$user = $this->getUser();
		$titleText = $title->getPrefixedText();
		if ( $timestamp ) {
			$className = 'title';
		} else {
			$className = 'title new';
		}

		$html =
			Html::openElement( 'li', [
				'class' => 'page-summary',
				'title' => $titleText,
				'data-id' => $title->getArticleID()
			] ) .
			Html::openElement( 'a', [ 'href' => $title->getLocalURL(), 'class' => $className ] );
		$html .= $thumb;
		$html .=
			Html::element( 'h3', [], $titleText );

		$html .= Html::closeElement( 'a' ) .
			Html::closeElement( 'li' );

		return $html;
	}

	/**
	 * The main entry point for the page.
	 *
	 * @param string|null $mode Whether the user is viewing, editing, or clearing their
	 *  watchlist
	 */
	public function execute( $mode ) {
		// Anons don't get a watchlist edit
		$this->requireLogin( 'mobile-frontend-watchlist-purpose' );

		$out = $this->getOutput();
		$out->addBodyClasses( 'mw-mf-special-page' );
		parent::execute( $mode );
		$out->setPageTitleMsg( $this->msg( 'watchlist' ) );
	}

	/**
	 * Finds the offset of the page given in this->offsetTitle
	 * If doesn't exist returns 0 to show from beginning of array of pages.
	 *
	 * @param array $pages
	 * @return int where the index of the next page to be shown.
	 */
	private function getPageOffset( $pages ) {
		// Deal with messiness of mediawiki
		$pages = array_keys( $pages );

		if ( $this->offsetTitle ) {
			// PHP is stupid. strict test to avoid issues when page '0' is watched.
			$offset = array_search( $this->offsetTitle, $pages, true );
			// Deal with cases where invalid title given
			if ( $offset === false ) {
				$offset = 0;
			}
		} else {
			$offset = 0;
		}
		return $offset;
	}

	/**
	 * Create paginated view of entire watchlist
	 *
	 * @param array $pages
	 * @return array of pages that should be displayed in current view
	 */
	private function getPagesToDisplay( $pages ) {
		$offset = $this->getPageOffset( $pages );
		// Get the slice we are going to display and display it
		return array_slice( $pages, $offset, self::LIMIT, true );
	}

	/**
	 * Get the HTML needed to show if a user doesn't watch any page, show information
	 * how to watch pages where no pages have been watched.
	 * @return string
	 */
	private function getEmptyListHtml() {
		$dir = $this->getLanguage()->isRTL() ? 'rtl' : 'ltr';

		$imgUrl = $this->getConfig()->get( MainConfigNames::ExtensionAssetsPath ) .
			"/MobileFrontend/images/emptywatchlist-page-actions-$dir.png";

		$msg = Html::element( 'p', [],
			$this->msg( 'mobile-frontend-watchlist-a-z-empty-howto' )->plain()
		);
		$msg .= Html::element( 'img', [
			'src' => $imgUrl,
			'alt' => $this->msg( 'mobile-frontend-watchlist-a-z-empty-howto-alt' )->plain(),
		] );

		return Html::openElement( 'div', [ 'class' => 'info empty-page' ] ) .
			$msg .
			Html::element( 'a',
				[ 'class' => 'button', 'href' => Title::newMainPage()->getLocalURL() ],
				$this->msg( 'mobile-frontend-watchlist-back-home' )->plain()
			) .
			Html::closeElement( 'div' );
	}

	/**
	 * Identify the next page to be shown
	 *
	 * @param array $pages
	 * @return string|bool representing title of next page to show or
	 *  false if there isn't another page to show.
	 */
	private function getNextPage( $pages ) {
		$total = count( $pages );
		$offset = $this->getPageOffset( $pages );
		$limit = self::LIMIT;

		// Work out if we need a more button and where to start from
		if ( $total > $offset + $limit ) {
			$pageKeys = array_keys( $pages );
			$from = $pageKeys[$offset + $limit];
		} else {
			$from = false;
		}
		return $from;
	}

	/**
	 * Renders the view/edit (normal) mode of the watchlist.
	 */
	protected function executeViewEditWatchlist() {
		$ns = NS_MAIN;
		$images = [];

		$watchlist = $this->getWatchlistInfo();

		if ( isset( $watchlist[$ns] ) ) {
			$allPages = $watchlist[$ns];
			$from = $this->getNextPage( $allPages );
			$allPages = $this->getPagesToDisplay( $allPages );
		} else {
			$allPages = [];
			$from = false;
		}

		// Begin rendering of watchlist.
		$watchlist = [ $ns => $allPages ];
		( new HookRunner( $this->hookContainer ) )
			->onSpecialMobileEditWatchlist__images(
				$this->getContext(), $watchlist, $images
			);

		// create list of pages
		$mobilePages = new MobileCollection();
		$pageKeys = array_keys( $watchlist[$ns] );
		foreach ( $pageKeys as $dbkey ) {
			if ( isset( $images[$ns][$dbkey] ) ) {
				$page = new MobilePage(
					Title::makeTitleSafe( $ns, $dbkey ),
					$this->repoGroup->findFile( $images[$ns][$dbkey] )
				);
			} else {
				$page = new MobilePage( Title::makeTitleSafe( $ns, $dbkey ) );
			}
			$mobilePages->add( $page );
		}

		if ( $mobilePages->isEmpty() ) {
			$html = $this->getEmptyListHtml();
		} else {
			$html = $this->getViewHtml( $mobilePages );
		}
		if ( $from ) {
			// show more link if there are more items to show
			$qs = [ 'from' => $from ];
			$html .= Html::element( 'a',
				[
					'class' => 'mw-mf-watchlist-more',
					'href' => SpecialPage::getTitleFor( 'EditWatchlist' )->getLocalURL( $qs ),
				],
				$this->msg( 'mobile-frontend-watchlist-more' )->text() );
		}
		$out = $this->getOutput();

		$config = $out->getConfig();
		$searchParams = $config->get( 'MFSearchAPIParams' );
		$mfScriptPath = $config->get( 'MFScriptPath' );
		$pageProps = $config->get( 'MFQueryPropModules' );
		// Avoid API warnings and allow integration with optional extensions.
		if ( $mfScriptPath || ExtensionRegistry::getInstance()->isLoaded( 'PageImages' ) ) {
			$pageProps[] = 'pageimages';
			$searchParams = array_merge_recursive( $searchParams, [
				'piprop' => 'thumbnail',
				'pithumbsize' => MobilePage::SMALL_IMAGE_WIDTH,
				'pilimit' => 50,
			] );
		}

		$out->addJSConfigVars( [
			'wgMFScriptPath' => $mfScriptPath,
			'wgMFSearchAPIParams' => $searchParams,
			'wgMFQueryPropModules' => $pageProps,
		] );
		$out->addHTML( $html );
		$out->addModules( 'mobile.special.watchlist.scripts' );
	}

	/**
	 * @param MobileCollection $collection Collection of pages to get view for
	 * @return string html representation of collection in watchlist view
	 */
	protected function getViewHtml( MobileCollection $collection ) {
		$html = Html::openElement( 'ul', [ 'class' => 'content-unstyled mw-mf-page-list thumbs'
			. ' page-summary-list mw-mf-watchlist-page-list' ] );
		foreach ( $collection as $mobilePage ) {
			$html .= $this->getLineHtml( $mobilePage );
		}
		$html .= Html::closeElement( 'ul' );
		return $html;
	}

	/**
	 * @inheritDoc
	 */
	public function getAssociatedNavigationLinks() {
		return self::WATCHLIST_TAB_PATHS;
	}
}
