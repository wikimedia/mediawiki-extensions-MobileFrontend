<?php

/**
 * SpecialMobileEditWatchlist.php
 */

/**
 * The mobile version of the watchlist editing page.
 */
class SpecialMobileEditWatchlist extends SpecialEditWatchlist {
	/** @var string $offsetTitle The name of the title to begin listing the watchlist from */
	protected $offsetTitle;

	/**
	 * Construct function
	 */
	public function __construct() {
		$req = $this->getRequest();
		$this->offsetTitle = $req->getVal( 'from', '' );
		parent::__construct( 'EditWatchlist' );
	}

	/**
	 * Renders the subheader.
	 */
	protected function outputSubtitle() {
		$user = $this->getUser();
		$this->getOutput()->addHtml( SpecialMobileWatchlist::getWatchlistHeader( $user ) );
	}

	/**
	 * Gets the HTML fragment for a watched page.
	 *
	 * @param Title $title The title of the watched page
	 * @param int $ts When the page was last touched
	 * @param string $thumb An HTML fragment for the page's thumbnaiL
	 * @return string
	 */
	public static function getLineHtml( Title $title, $ts, $thumb ) {
		wfProfileIn( __METHOD__ );
		$titleText = $title->getPrefixedText();
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

		$html =
			Html::openElement( 'li', array(
				'class' => 'page-summary',
				'title' => $titleText,
				'data-id' => $title->getArticleId()
			) ) .
			Html::openElement( 'a', array( 'href' => $title->getLocalUrl(), 'class' => $className ) );
		$html .= $thumb;
		$html .=
			Html::element( 'h3', array(), $titleText ).
			Html::element( 'div', array( 'class' => 'info' ), $lastModified ) .
			Html::closeElement( 'a' ) .
			Html::closeElement( 'li' );

		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * The main entry point for the page.
	 *
	 * @param int $mode Whether the user is viewing, editing, or clearing their
	 *  watchlist
	 */
	public function execute( $mode ) {
		// Anons don't get a watchlist edit
		$this->requireLogin( 'watchlistanontext' );

		$out = $this->getOutput();
		// turn off #content element
		$out->setProperty( 'unstyledContent', true );
		parent::execute( $mode );
		$out->setPageTitle( $this->msg( 'watchlist' ) );
	}

	/**
	 * Renders the view/edit (normal) mode of the watchlist.
	 */
	protected function executeViewEditWatchlist() {
		$html = '';
		$total = 0;
		$images = array();
		$limit = SpecialMobileWatchlist::LIMIT;

		$watchlist = $this->getWatchlistInfo();
		if ( !MobileContext::singleton()->imagesDisabled() ) {
			wfRunHooks( 'SpecialMobileEditWatchlist::images', array(
					$this->getContext(),
					&$watchlist,
					&$images
				)
			);
		}

		foreach ( $watchlist as $ns => $pages ) {
			if ( $ns === NS_MAIN ) {
				$html .= '<ul class="watchlist page-list thumbs">';
				$total = count( $pages );

				// Make format more sensible. Sigh MediaWiki.
				$pages = array_keys( $pages );

				if ( $this->offsetTitle ) {
					$offset = array_search( $this->offsetTitle, $pages );
					// Deal with cases where invalid title given
					if ( $offset === false ) {
						$offset = 0;
					}
				} else {
					$offset = 0;
				}

				// Work out if we need a more button and where to start from
				if ( $total > $offset + $limit ) {
					$from = $pages[$offset + $limit + 1];
				} else {
					$from = false;
				}

				// Get the slice we are going to display and display it
				$pages = array_slice( $pages, $offset, $limit );
				foreach ( $pages as $dbkey ) {
					$title = Title::makeTitleSafe( $ns, $dbkey );
					$thumb = '';
					if ( isset( $images[$ns][$dbkey] ) ) {
						$mobilePage = new MobilePage( $title, wfFindFile( $images[$ns][$dbkey] ) );
						$thumb = $mobilePage->getSmallThumbnailHtml();
					}
					if ( !$thumb ) {
						$thumb = MobilePage::getPlaceHolderThumbnailHtml( 'list-thumb-none', 'list-thumb-x' );
					}
					$total += 1;
					$html .= self::getLineHtml( $title, $title->getTouched(), $thumb );
				}
				$html .= '</ul>';
			}
		}

		if ( $total === 0 ) {
			$html .= SpecialMobileWatchlist::getEmptyListHtml( false, $this->getLanguage() );
		} elseif ( $from ) {
			// show more link if there are more items to show
			$qs = array( 'from' => $from );
			$html .= Html::element( 'a',
				array(
					'class' => 'mw-ui-anchor mw-ui-progressive more',
					'href' => SpecialPage::getTitleFor( 'EditWatchlist' )->getLocalURL( $qs ),
				),
				$this->msg( 'mobile-frontend-watchlist-more' ) );
		}
		$out = $this->getOutput();
		$out->addHtml( $html );
		$out->addModules( 'skins.minerva.special.watchlist.scripts' );
		$out->addModuleStyles(
			array(
				'skins.minerva.special.styles',
				'mobile.pagelist.styles',
				'mobile.special.pagefeed.styles',
				'mobile.special.watchlist.styles'
			)
		);
	}
}
