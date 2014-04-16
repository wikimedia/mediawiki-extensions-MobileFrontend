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
		$this->renderListHeaderWhereNeeded( $date );

		$title = Title::makeTitle( $row->rc_namespace, $row->rc_title );
		$comment = $this->formatComment( $row->rc_comment, $title );
		$ts = new MWTimestamp( $row->rc_timestamp );
		$username = $row->rc_user != 0
			? htmlspecialchars( $row->rc_user_text )
			: IP::prettifyIP( $row->rc_user_text );
		$revId = $row->rc_this_oldid;
		$bytes = $row->rc_new_len - $row->rc_old_len;
		$isAnon = $row->rc_user == 0;
		$isMinor = $row->rc_minor != 0;

		if ( $revId ) {
			$diffTitle = SpecialPage::getTitleFor( 'MobileDiff', $revId );
			$diffLink = $diffTitle->getLocalUrl();
		} else {
			// hack -- use full log entry display
			$diffLink = Title::makeTitle( $row->rc_namespace, $row->rc_title )->getLocalUrl();
		}

		$this->renderFeedItemHtml( $ts, $diffLink, $username, $comment, $title, $isAnon, $bytes,
			$isMinor );
		wfProfileOut( __METHOD__ );
	}

	protected function renderFeedItemHtml( $ts, $diffLink = '', $username = '', $comment = '',
		$title = false, $isAnon = false, $bytes = 0, $isMinor = false ) {
			$this->renderFeedItemHtmlBeta( $ts, $diffLink, $username, $comment,
				$title, $isAnon, $bytes, $isMinor );
	}
}
