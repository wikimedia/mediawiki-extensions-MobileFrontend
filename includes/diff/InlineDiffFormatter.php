<?php

class InlineDiffFormatter extends TableDiffFormatter {
	/**
	 * @param $xbeg
	 * @param $xlen
	 * @param $ybeg
	 * @param $ylen
	 * @return string
	 */
	function blockHeader( $xbeg, $xlen, $ybeg, $ylen ) {
		return "<div class=\"mw-diff-inline-header\"><!-- LINES $xbeg,$ybeg --></div>\n";
	}

	/**
	 * @param $lines array
	 */
	function added( $lines ) {
		foreach ( $lines as $line ) {
			echo '<div class="mw-diff-inline-added"><ins>'
				. $this->lineOrNbsp( htmlspecialchars( $line ) )
				. "</ins></div>\n";
		}
	}

	/**
	 * @param $lines
	 */
	function deleted( $lines ) {
		foreach ( $lines as $line ) {
			echo '<div class="mw-diff-inline-deleted"><del>'
				. $this->lineOrNbsp( htmlspecialchars( $line ) )
				. "</del></div>\n";
		}
	}

	/**
	 * @param $lines
	 */
	function context( $lines ) {
		foreach ( $lines as $line ) {
			echo "<div class=\"mw-diff-inline-context\">" .
				"{$this->contextLine( htmlspecialchars( $line ) )}</div>\n";
		}
	}

	/**
	 * @param $marker
	 * @param $class
	 * @param $line
	 * @return string
	 */
	protected function wrapLine( $marker, $class, $line ) {
		// The <div> wrapper is needed for 'overflow: auto' style to scroll properly
		$this->escapeWhiteSpace( $this->lineOrNbsp( $line ) );

		return $line;
	}

	/**
	 * @param string $line
	 *
	 * @return string
	 */
	protected function lineOrNbsp( $line ) {
		if ( $line === '' ) {
			$line = '&#160;';
		}

		return $line;
	}

	/**
	 * @param $orig
	 * @param $closing
	 */
	function changed( $orig, $closing ) {
		wfProfileIn( __METHOD__ );

		echo '<div class="mw-diff-inline-changed">';
		$diff = new WordLevelDiff( $orig, $closing );
		$edits = $this->inlineWordDiff( $diff );

		# WordLevelDiff returns already HTML-escaped output.
		echo implode( '', $edits );

		echo "</div>\n";
		wfProfileOut( __METHOD__ );
	}

	private function inlineWordDiff( $diff ) {
		wfProfileIn( __METHOD__ );
		$inline = new HWLDFWordAccumulator;
		$inline->insClass = $inline->delClass = '';

		foreach ( $diff->edits as $edit ) {
			if ( $edit->type == 'copy' ) {
				$inline->addWords( $edit->orig );
			} elseif ( $edit->type == 'delete' ) {
				$inline->addWords( $edit->orig, 'del' );
			} elseif ( $edit->type == 'add' ) {
				$inline->addWords( $edit->closing, 'ins' );
			} else {
				$inline->addWords( $edit->orig, 'del' );
				$inline->addWords( $edit->closing, 'ins' );
			}
		}
		$lines = $inline->getLines();
		wfProfileOut( __METHOD__ );

		return $lines;
	}
}
