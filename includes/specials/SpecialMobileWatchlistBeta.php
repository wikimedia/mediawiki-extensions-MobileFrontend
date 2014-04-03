<?php

class SpecialMobileWatchlistBeta extends SpecialMobileWatchlist {
	protected $lastRow;

	protected function showFeedResults( ResultWrapper $res ) {
		$this->showResults( $res, true );
	}

	protected function formatComment( $comment, $title ) {
		if ( $comment !== '' ) {
			$comment = Linker::formatComment( $comment, $title );
			// flatten back to text
			$comment = Sanitizer::stripAllTags( $comment );
		}
		return $comment;
	}

	protected function showFeedResultRow( $row ) {
		wfProfileIn( __METHOD__ );

		if ( $row->rc_deleted ) {
			wfProfileOut( __METHOD__ );
			return;
		}

		$output = $this->getOutput();
		$user = $this->getUser();
		$lang = $this->getLanguage();

		$date = $lang->userDate( $row->rc_timestamp, $user );

		if ( !isset( $this->lastDate ) || $date !== $this->lastDate ) {
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

		$title = Title::makeTitle( $row->rc_namespace, $row->rc_title );
		$comment = $this->formatComment( $row->rc_comment, $title );
		$ts = new MWTimestamp( $row->rc_timestamp );
		$username = $row->rc_user != 0
			? htmlspecialchars( $row->rc_user_text )
			: IP::prettifyIP( $row->rc_user_text );
		$revId = $row->rc_this_oldid;
		$bytes = $row->rc_new_len - $row->rc_old_len;
		$isAnon = $row->rc_user == 0;

		if ( $revId ) {
			$diffTitle = SpecialPage::getTitleFor( 'MobileDiff', $revId );
			$diffLink = $diffTitle->getLocalUrl();
		} else {
			// hack -- use full log entry display
			$diffLink = Title::makeTitle( $row->rc_namespace, $row->rc_title )->getLocalUrl();
		}

		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title, $isAnon, $bytes );

		$this->lastDate = $date;
		wfProfileOut( __METHOD__ );
	}

	protected function renderFeedItemHtml( $ts, $diffLink = '', $username = '', $comment = '',
		$title = false, $isAnon = false, $bytes = 0 ) {

		wfProfileIn( __METHOD__ );
		$output = $this->getOutput();
		$user = $this->getUser();
		$lang = $this->getLanguage();

		if ( $isAnon ) {
			$usernameClass = 'mw-mf-user mw-mf-anon';
		} else {
			$usernameClass = 'mw-mf-user';
		}

		$formattedBytes = $lang->formatNum( $bytes );
		if ( $bytes > 0 ) {
			$formattedBytes = '+' . $formattedBytes;
			$bytesClass = 'mw-mf-bytesadded';
		} else {
			$bytesClass = 'mw-mf-bytesremoved';
		}

		$html = Html::openElement( 'li' );

		if ( $diffLink ) {
			$html .= Html::openElement( 'a', array( 'href' => $diffLink, 'class' => 'title' ) );
		} else {
			$html .= Html::openElement( 'div', array( 'class' => 'title' ) );
		}

		if ( $title ) {
			$html .= Html::element( 'h3', array(), $title->getPrefixedText() );
		}

		$html .= Html::element( 'p', array( 'class' => $usernameClass ), $username ) .
			Html::element(
				'p', array( 'class' => 'component truncated-text multi-line two-line' ), $comment
			) .
			Html::openElement( 'div', array( 'class' => 'listThumb' ) ) .
			Html::element( 'p', null, $lang->userTime( $ts, $user ) );

		if ( $bytes !== 0 ) {
			$html .= Html::element( 'p', array( 'class' => $bytesClass ), $formattedBytes );
		}

		$html .= Html::closeElement( 'div' );

		if ( $diffLink ) {
			$html .= Html::closeElement( 'a' );
		} else {
			$html .= Html::closeElement( 'div' );
		}
		$html .= Html::closeElement( 'li' );

		$output->addHtml( $html );
		wfProfileOut( __METHOD__ );
	}
}
