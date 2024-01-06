<?php

use MediaWiki\Html\Html;
use MediaWiki\MediaWikiServices;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Specials\SpecialEditWatchlist;
use MediaWiki\Title\Title;
use MobileFrontend\Hooks\HookRunner;
use MobileFrontend\Models\MobileCollection;
use MobileFrontend\Models\MobilePage;

/**
 * The mobile version of the watchlist editing page.
 * @deprecated in future this should be the core SpecialEditWatchlist page (T109277)
 */
class SpecialMobileEditWatchlist extends SpecialEditWatchlist {
	/** @var string The name of the title to begin listing the watchlist from */
	protected $offsetTitle;

	public function __construct() {
		$req = $this->getRequest();
		$this->offsetTitle = $req->getVal( 'from', '' );
		$watchStoreItem = MediaWikiServices::getInstance()->getWatchedItemStore();
		parent::__construct( $watchStoreItem );
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
			$thumb = MobilePage::getPlaceHolderThumbnailHtml( 'list-thumb-none', 'list-thumb-x' );
		}
		$timestamp = $mp->getLatestTimestamp();
		$user = $this->getUser();
		$titleText = $title->getPrefixedText();
		if ( $timestamp ) {
			$lastModified = $this->msg(
				'mobile-frontend-last-modified-date',
				$this->getLanguage()->userDate( $timestamp, $user ),
				$this->getLanguage()->userTime( $timestamp, $user )
			)->text();
			$edit = $mp->getLatestEdit();
			$dataAttrs = [
				'data-timestamp' => $edit['timestamp'],
				'data-user-name' => $edit['name'],
				'data-user-gender' => $edit['gender'],
			];
			$className = 'title';
		} else {
			$className = 'title new';
			$lastModified = '';
			$dataAttrs = [];
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

		if ( $lastModified ) {
			$html .= Html::openElement( 'div', [ 'class' => 'info' ] ) .
				Html::element( 'span', array_merge( $dataAttrs, [ 'class' => 'modified-enhancement' ] ),
					$lastModified ) .
				Html::closeElement( 'div' );
		}
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
		$out->setPageTitle( $this->msg( 'watchlist' ) );
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
		return array_slice( $pages, $offset, SpecialMobileWatchlist::LIMIT, true );
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
		$limit = SpecialMobileWatchlist::LIMIT;

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
		$services = MediaWikiServices::getInstance();
		( new HookRunner( $services->getHookContainer() ) )
			->onSpecialMobileEditWatchlist__images(
				$this->getContext(), $watchlist, $images
			);

		// create list of pages
		$mobilePages = new MobileCollection();
		$pageKeys = array_keys( $watchlist[$ns] );
		$repoGroup = $services->getRepoGroup();
		foreach ( $pageKeys as $dbkey ) {
			if ( isset( $images[$ns][$dbkey] ) ) {
				$page = new MobilePage(
					Title::makeTitleSafe( $ns, $dbkey ),
					$repoGroup->findFile( $images[$ns][$dbkey] )
				);
			} else {
				$page = new MobilePage( Title::makeTitleSafe( $ns, $dbkey ) );
			}
			$mobilePages->add( $page );
		}

		if ( $mobilePages->isEmpty() ) {
			$html = SpecialMobileWatchlist::getEmptyListHtml( false, $this->getLanguage() );
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
		$out->addHTML( $html );
		$out->addModules( 'mobile.special.watchlist.scripts' );
		$out->addModuleStyles(
			[
				'mobile.pagelist.styles',
				'mobile.pagesummary.styles',
				// FIXME: This module should be removed when the following tickets are resolved:
				// * T305113
				// * T109277
				// * T117279
				'mobile.special.pagefeed.styles'
			]
		);
	}

	/**
	 * @param MobileCollection $collection Collection of pages to get view for
	 * @return string html representation of collection in watchlist view
	 */
	protected function getViewHtml( MobileCollection $collection ) {
		$html = Html::openElement( 'ul', [ 'class' => 'content-unstyled page-list thumbs'
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
		return SpecialMobileWatchlist::WATCHLIST_TAB_PATHS;
	}
}
