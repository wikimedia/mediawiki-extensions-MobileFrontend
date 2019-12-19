<?php

use MediaWiki\Diff\WordAccumulator;

/**
 * Extends standard Table-formatted DiffFormatter of core to enable Inline-Diff
 * format of MF with only one column.
 * @deprecated 1.35.0
 */
class InlineDiffFormatter extends TableDiffFormatter {
	/**
	 * Get the header of diff block. Remember: Given line numbers will not be visible,
	 * it's a one column diff style.
	 * @inheritDoc
	 * @param int $xbeg line number of left side to compare with
	 * @param int $xlen Number of trailing lines after the changed line on left side
	 * @param int $ybeg right side line number to compare with
	 * @param int $ylen Number of trailing lines after the changed line on right side
	 * @return string
	 */
	protected function blockHeader( $xbeg, $xlen, $ybeg, $ylen ) {
		return "<div class=\"mw-diff-inline-header\"><!-- LINES $xbeg,$ybeg --></div>\n";
	}

	/**
	 * Get a div element with a complete new added line as content.
	 * Complete line will be appear with green background.
	 * @inheritDoc
	 * @param array $lines With changed lines
	 */
	protected function added( $lines ) {
		foreach ( $lines as $line ) {
			$this->writeOutput( '<div class="mw-diff-inline-added"><ins>'
				. $this->lineOrNbsp( htmlspecialchars( $line ) )
				. "</ins></div>\n" );
		}
	}

	/**
	 * Get a div with a line which is deleted completly.
	 * This line will be appear with complete red background.
	 * @inheritDoc
	 * @param array $lines With deleted lines
	 */
	protected function deleted( $lines ) {
		foreach ( $lines as $line ) {
			$this->writeOutput( '<div class="mw-diff-inline-deleted"><del>'
				. $this->lineOrNbsp( htmlspecialchars( $line ) )
				. "</del></div>\n" );
		}
	}

	/**
	 * Get a div with some changed content.
	 * Line will appear with white and the changed context in
	 * red (for deleted chars) and green (for added chars) background.
	 * @inheritDoc
	 * @param array $lines With edited lines
	 */
	protected function context( $lines ) {
		foreach ( $lines as $line ) {
			$this->writeOutput( "<div class=\"mw-diff-inline-context\">" .
				"{$this->contextLine( htmlspecialchars( $line ) )}</div>\n" );
		}
	}

	/**
	 * Convert all spaces to a forced blank. If line is empty creates at least one
	 * forced space.
	 * @param string $marker Unused
	 * @param string $class Unused
	 * @param string $line Content of the line
	 * @return string
	 */
	protected function wrapLine( $marker, $class, $line ) {
		// The <div> wrapper is needed for 'overflow: auto' style to scroll properly
		$this->escapeWhiteSpace( $this->lineOrNbsp( $line ) );

		return $line;
	}

	/**
	 * Adds a forced blank to line, if the line is empty.
	 * @param string $line Line to edit
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
	 * Get a div with changed content (not complete added or deleted line)
	 * @inheritDoc
	 * @param string[] $orig Old content to compare with
	 * @param string[] $closing New content to compare with
	 */
	protected function changed( $orig, $closing ) {
		$this->writeOutput( '<div class="mw-diff-inline-changed">' );
		$diff = new WordLevelDiff( $orig, $closing );
		$edits = $this->inlineWordDiff( $diff );

		// WordLevelDiff returns already HTML-escaped output.
		$this->writeOutput( implode( '', $edits ) );

		$this->writeOutput( "</div>\n" );
	}

	/**
	 * Builds the string of deleted and added words from the given diff.
	 * @param WordLevelDiff $diff
	 * @return array Array of changed lines
	 */
	private function inlineWordDiff( $diff ) {
		$inline = new WordAccumulator;
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

		return $inline->getLines();
	}
}
