<?php

class ExtractFormatter extends HtmlFormatter {
	const SECTION_MARKER_START = "\1\2";
	const SECTION_MARKER_END = "\2\1";

	private $plainText;

	public function __construct( $text, $plainText ) {
		global $wgMFRemovableClasses;

		wfProfileIn( __METHOD__ );
		parent::__construct( HtmlFormatter::wrapHTML( $text ) );
		$this->plainText = $plainText;

		$this->removeImages();
		$this->useImgAlt( false );
		// @fixme: use rules from MobileFormatter?
		$this->remove( array( 'table', 'div', '.editsection', '.mw-editsection', 'sup.reference', 'span.coordinates',
				'span.geo-multi-punct', 'span.geo-nondefault', '.noexcerpt', '.error' )
		);
		$this->remove( $wgMFRemovableClasses );
		if ( $plainText ) {
			$this->flattenAllTags();
		} else {
			$this->flatten( array( 'span', 'a' ) );
		}
		wfProfileOut( __METHOD__ );
	}

	public function getText( $dummy = null ) {
		wfProfileIn( __METHOD__ );
		$this->filterContent();
		$text = parent::getText();
		if ( $this->plainText ) {
			$text = html_entity_decode( $text );
			$text = str_replace( "\xC2\xA0", ' ', $text ); // replace nbsp with space
			$text = str_replace( "\r", "\n", $text ); // for Windows
			$text = preg_replace( "/\n{3,}/", "\n\n", $text ); // normalise newlines
		}
		wfProfileOut( __METHOD__ );
		return $text;
	}

	public function onHtmlReady( $html ) {
		wfProfileIn( __METHOD__ );
		if ( $this->plainText ) {
			$html = preg_replace( '/\s*(<h([1-6])\b)/i',
				"\n\n" . self::SECTION_MARKER_START . '$2' . self::SECTION_MARKER_END . '$1' ,
				$html
			);
		}
		wfProfileOut( __METHOD__ );
		return $html;
	}
}