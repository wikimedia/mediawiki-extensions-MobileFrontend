<?php
/**
 * This is an abstract class intended for use by special pages that consist primarily of
 * a list of pages, for example, Special:Watchlist or Special:History.
 */

abstract class MobileSpecialPageFeed extends MobileSpecialPage {
	public function execute( $par ) {
		$out = $this->getOutput();
		$out->addModuleStyles( 'mobile.special.pagefeed.styles' );
		$this->setHeaders();
		$out->setProperty( 'unstyledContent', true );
		parent::execute( $par );
	}

	/**
	 * Formats an edit comment
	 * @param string $comment: The raw comment text
	 * @param Title $title: The title of the page that was edited
	 * @fixme: Duplication with SpecialMobileWatchlist
	 *
	 * @return string: HTML code
	 */
	protected function formatComment( $comment, $title ) {
		if ( $comment === '' ) {
			$comment = $this->msg( 'mobile-frontend-changeslist-nocomment' )->plain();
		} else {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = Sanitizer::stripAllTags( $comment );
		}
		return $comment;
	}

	/**
	 * Renders an item in the feed
	 * @param {MWTimestamp} ts: The time the edit occurred
	 * @param {string} diffLink: url to the diff for the edit
	 * @param {string} username: The username of the user that made the edit (absent if anonymous)
	 * @param {string} comment: The edit summary
	 * @param {Title} title: The title of the page that was edited
	 *
	 * @return String: HTML code
	 */
	protected function renderFeedItemHtml( $ts, $diffLink = '', $username = '', $comment = '',
		$title = false, $isAnon = false ) {

		$out = $this->getOutput();
		if ( $isAnon ) {
			$username = $this->msg( 'mobile-frontend-changeslist-ip' )->plain();
			$usernameClass = 'mw-mf-user mw-mf-anon';
		} else {
			$usernameClass = 'mw-mf-user';
		}

		$html = '<li>';
		if ( $diffLink ) {
			$html .= Html::openElement( 'a', array( 'href' => $diffLink, 'class' => 'title' ) );
		} else {
			$html .= Html::openElement( 'div', array( 'class' => 'title' ) );
		}
		if ( $title ) {
			$html .= Html::element( 'h3', array(), $title->getPrefixedText() );
		}
		if ( $username ) {
			$html .= Html::element( 'p', array( 'class' => $usernameClass ), $username );
		}
		$html .= Html::element( 'p', array( 'class' => 'mw-mf-comment truncated-text' ), $comment ) .
			Html::element( 'div', array( 'class' => 'info' ), $ts->getHumanTimestamp() );

		if ( $diffLink ) {
			$html .= Html::closeElement( 'a' );
		} else {
			$html .= Html::closeElement( 'div' );
		}
		$html .= '</li>';
		$out->addHtml( $html );
	}
}
