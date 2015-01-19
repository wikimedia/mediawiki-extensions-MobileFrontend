<?php
/**
 * MobileSpecialPageFeed.php
 */

/**
 * This is an abstract class intended for use by special pages that consist primarily of
 * a list of pages, for example, Special:Watchlist or Special:History.
 */
abstract class MobileSpecialPageFeed extends MobileSpecialPage {
	/**  @var boolean $showUsername Whether to show the username in results or not */
	protected $showUsername = true;

	/**
	 * Render the special page content
	 * @param string $par parameters submitted as subpage
	 */
	public function execute( $par ) {
		$out = $this->getOutput();
		$out->addModuleStyles( 'mobile.special.pagefeed.styles' );
		$this->setHeaders();
		$out->setProperty( 'unstyledContent', true );
		parent::execute( $par );
	}

	/**
	 * Formats an edit comment
	 * @param string $comment The raw comment text
	 * @param Title $title The title of the page that was edited
	 * @fixme: Duplication with SpecialMobileWatchlist
	 *
	 * @return string HTML code
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
	 * Renders a date header when necessary.
	 * FIXME: Juliusz won't like this function.
	 * @param string $date The date of the current item
	 */
	protected function renderListHeaderWhereNeeded( $date ) {
		if ( !isset( $this->lastDate ) || $date !== $this->lastDate ) {
			$output = $this->getOutput();
			if ( isset( $this->lastDate ) ) {
				$output->addHtml(
					Html::closeElement( 'ul' )
				);
			}
			$output->addHtml(
				Html::element( 'h2', array( 'class' => 'list-header' ), $date ) .
				Html::openElement( 'ul', array( 'class' => 'page-list side-list' ) )
			);
		}
		$this->lastDate = $date;
	}

	/**
	 * Renders an item in the feed
	 * @param MWTimestamp $ts The time the edit occurred
	 * @param string $diffLink url to the diff for the edit
	 * @param string $username The username of the user that made the edit (absent if anonymous)
	 * @param string $comment The edit summary
	 * @param Title|null $title The title of the page that was edited
	 * @param bool $isAnon Is the edit anonymous?
	 * @param int|null $bytes Net number of bytes changed or null if not applicable
	 * @param bool $isMinor Is the edit minor?
	 * @return string HTML code
	 *
	 * @todo FIXME: use an array as an argument?
	 */
	protected function renderFeedItemHtml( $ts, $diffLink = '', $username = '', $comment = '',
		$title = null, $isAnon = false, $bytes = 0, $isMinor = false ) {

		$output = $this->getOutput();
		$user = $this->getUser();
		$lang = $this->getLanguage();

		if ( $isAnon ) {
			$usernameClass = MobileUI::iconClass( 'anonymous', 'before', 'icon-16px mw-mf-user mw-mf-anon' );
		} else {
			$usernameClass = MobileUI::iconClass( 'user', 'before', 'icon-16px mw-mf-user' );
		}

		$html = Html::openElement( 'li', array( 'class' => 'page-summary' ) );

		if ( $diffLink ) {
			$html .= Html::openElement( 'a', array( 'href' => $diffLink, 'class' => 'title' ) );
		} else {
			$html .= Html::openElement( 'div', array( 'class' => 'title' ) );
		}

		if ( $title ) {
			$html .= Html::element( 'h3', array(), $title->getPrefixedText() );
		}

		if ( $username && $this->showUsername ) {
			$html .= Html::element( 'p', array( 'class' => $usernameClass ), $username );
		}

		$html .= Html::element(
			'p', array( 'class' => 'edit-summary component truncated-text multi-line two-line' ), $comment
		);

		if ( $isMinor ) {
			$html .= ChangesList::flag( 'minor' );
		}

		$html .= Html::openElement( 'div', array( 'class' => 'list-thumb' ) ) .
			Html::element( 'p', array( 'class' => 'timestamp' ), $lang->userTime( $ts, $user ) );

		if ( $bytes ) {
			$formattedBytes = $lang->formatNum( $bytes );
			if ( $bytes > 0 ) {
				$formattedBytes = '+' . $formattedBytes;
				$bytesClass = 'mw-mf-bytesadded';
			} else {
				$bytesClass = 'mw-mf-bytesremoved';
			}
			$html .= Html::element(
				'p',
				array(
					'class' => $bytesClass,
					'dir' => 'ltr',
				),
				$formattedBytes
			);
		}

		$html .= Html::closeElement( 'div' );

		if ( $diffLink ) {
			$html .= Html::closeElement( 'a' );
		} else {
			$html .= Html::closeElement( 'div' );
		}
		$html .= Html::closeElement( 'li' );

		$output->addHtml( $html );
	}
}
