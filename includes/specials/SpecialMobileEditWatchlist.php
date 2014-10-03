<?php
/**
 * Represents a mobile version of Special:EditWatchlist
 */

class SpecialMobileEditWatchlist extends SpecialEditWatchlist {
	protected function outputSubtitle() {
		$user = $this->getUser();
		$this->getOutput()->addHtml( SpecialMobileWatchlist::getWatchlistHeader( $user ) );
	}

	/**
	 * @param Title $title
	 * @param int $ts
	 * @param string $thumb
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

	public function execute( $par ) {
		// Anons don't get a watchlist edit
		$this->requireLogin( 'watchlistanontext' );

		$out = $this->getOutput();
		// turn off #content element
		$out->setProperty( 'unstyledContent', true );
		parent::execute( $par );
		$out->setPageTitle( $this->msg( 'watchlist' ) );
	}

	protected function executeViewEditWatchlist() {
		$html = '';
		$total = 0;
		$images = array();
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
				foreach ( array_keys( $pages ) as $dbkey ) {
					$title = Title::makeTitleSafe( $ns, $dbkey );
					$thumb = '';
					if ( isset( $images[$ns][$dbkey] ) ) {
						$mobilePage = new MobilePage( $title, wfFindFile( $images[$ns][$dbkey] ) );
						$thumb = $mobilePage->getSmallThumbnailHtml();
					}
					if ( !$thumb ) {
						$thumb = MobilePage::getPlaceHolderThumbnailHtml( 'needsPhoto', 'icon-max-x' );
					}
					$total += 1;
					$html .= self::getLineHtml( $title, $title->getTouched(), $thumb );
				}
				$html .= '</ul>';
			}
		}
		if ( $total === 0 ) {
			$html .= SpecialMobileWatchlist::getEmptyListHtml( false, $this->getLanguage() );
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
