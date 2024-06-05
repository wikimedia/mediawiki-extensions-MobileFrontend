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
	private const WATCHLIST_TAB_PATHS = [
		'Special:Watchlist',
		'Special:EditWatchlist'
	];
	private const LIMIT = 50;

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
			$msg .= Html::element( 'img', [
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
			$html = self::getEmptyListHtml( false, $this->getLanguage() );
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
				'mobile.pagesummary.styles'
			]
		);
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
