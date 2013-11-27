<?php

class InlineDifferenceEngine extends DifferenceEngine {
	function generateTextDiffBody( $otext, $ntext ) {
		global $wgContLang;

		wfProfileIn( __METHOD__ );
		# First try wikidiff2
		if ( function_exists( 'wikidiff2_inline_diff' ) ) {
			wfProfileIn( 'wikidiff2_inline_diff' );
			$text = wikidiff2_inline_diff( $otext, $ntext, 2 );
			$text .= $this->debug( 'wikidiff2-inline' );
			wfProfileOut( 'wikidiff2_inline_diff' );
			wfProfileOut( __METHOD__ );

			return $text;
		}

		# Else slow native PHP diff
		$ota = explode( "\n", $wgContLang->segmentForDiff( $otext ) );
		$nta = explode( "\n", $wgContLang->segmentForDiff( $ntext ) );
		$diffs = new Diff( $ota, $nta );
		$formatter = new InlineDiffFormatter();
		$difftext = $wgContLang->unsegmentForDiff( $formatter->format( $diffs ) ) .
		wfProfileOut( __METHOD__ );

		return $difftext;
	}

	protected function getDiffBodyCacheKey() {
		if ( !$this->mOldid || !$this->mNewid ) {
			throw new MWException( 'mOldid and mNewid must be set to get diff cache key.' );
		}

		return wfMemcKey( 'diff', 'inline', MW_DIFF_VERSION,
			'oldid', $this->mOldid, 'newid', $this->mNewid );
	}
}
