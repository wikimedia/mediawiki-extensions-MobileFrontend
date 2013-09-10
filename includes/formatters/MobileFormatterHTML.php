<?php

class MobileFormatterHTML extends MobileFormatter {
	/**
	 * Constructor
	 *
	 * @param string $html: Text to process
	 * @param Title $title: Title to which $html belongs
	 */
	public function __construct( $html, $title ) {
		parent::__construct( $html, $title );
	}

	public function getFormat() {
		return 'HTML';
	}

	protected function onHtmlReady( $html ) {
		wfProfileIn( __METHOD__ );
		if ( $this->expandableSections ) {
			$html = $this->headingTransform( $html );
		}
		wfProfileOut( __METHOD__ );
		return $html;
	}

	protected function headingTransformCallback( $matches ) {
		wfProfileIn( __METHOD__ );
		if ( isset( $matches[0] ) ) {
			preg_match( '/id="([^"]*)"/', $matches[0], $headlineMatches );
		}

		$headlineId = ( isset( $headlineMatches[1] ) ) ? $headlineMatches[1] : '';

		$this->headings++;
		// Back to top link
		if ( $this->backToTopLink ) {
			$backToTop = $this->backToTopLink( intval( $this->headings - 1 ) );
		} else {
			$backToTop = '';
		}

		// generate the HTML we are going to inject
		if ( $this->headings === 1 ) {
			$base = '</div>'; // close up content_0 section
		} else {
			$base = '';
		}
		$base .= Html::openElement( 'div', array( 'class' => 'section' ) );
		$base .= Html::openElement( 'h2',
			array( 'class' => 'section_heading', 'id' => 'section_' . $this->headings )
		);
		$base .=
			Html::rawElement( 'span',
				array( 'id' => $headlineId ),
				$matches[2]
			)
			. $matches[3]
			. Html::closeElement( 'h2' )
			. Html::openElement( 'div',
				array( 'class' => 'content_block', 'id' => 'content_' . $this->headings )
			);

		if ( $this->headings > 1 ) {
			// Close it up here
			$base = '</div>' // <div class="content_block">
				. $backToTop
				. "</div>" // <div class="section">
				. $base;
		}

		wfProfileOut( __METHOD__ );
		return $base;
	}
}
