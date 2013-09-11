<?php

class MobileFormatterWML extends MobileFormatter {
	protected $headingTransformStart = '***************************************************************************';

	/**
	 * @var WmlContext
	 */
	protected $wmlContext;

	/**
	 * Constructor
	 *
	 * @param string $html: Text to process
	 * @param Title $title: Title to which $html belongs
	 * @param WmlContext $wmlContext: Context for creation of WML cards, can be omitted if $format == 'HTML'
	 * @throws MWException
	 */
	public function __construct( $html, $title, WmlContext $wmlContext = null ) {
		parent::__construct( $html, $title );

		if ( !$wmlContext ) {
			throw new MWException( __METHOD__ . '(): WML context not set' );
		}
		$this->wmlContext = $wmlContext;
	}

	public function getFormat() {
		return 'WML';
	}

	protected function onHtmlReady( $html ) {
		wfProfileIn( __METHOD__ );
		$html = $this->headingTransform( $html );
		// Content removal for WML rendering
		$this->flatten( array( 'span', 'div', 'sup', 'h[1-6]', 'sup', 'sub' ) );
		// Content wrapping
		$html = $this->createWMLCard( $html );
		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * Creates a WML card from input
	 * @param string $s: Raw WML
	 * @return string: WML card
	 */
	private function createWMLCard( $s ) {
		wfProfileIn( __METHOD__ );
		$segments = explode( $this->headingTransformStart, $s );
		$card = '';
		$idx = 0;
		$requestedSegment = htmlspecialchars( $this->wmlContext->getRequestedSegment() );
		$title = htmlspecialchars( $this->title->getText() );
		$segmentText = $this->wmlContext->getOnlyThisSegment()
			? str_replace( $this->headingTransformStart, '', $s )
			: $segments[$requestedSegment];

		$card .= "<card id='s{$idx}' title='{$title}'><p>{$segmentText}</p>";
		$idx = intval( $requestedSegment ) + 1;
		$segmentsCount = $this->wmlContext->getOnlyThisSegment()
			? $idx + 1 // @todo: when using from API we don't have the total section count
			: count( $segments );
		$card .= "<p>" . $idx . "/" . $segmentsCount . "</p>";

		$useFormatParam = ( $this->wmlContext->getUseFormat() )
			? '&amp;useformat=' . $this->wmlContext->getUseFormat()
			: '';

		// Title::getLocalUrl doesn't work at this point since PHP 5.1.x, all objects have their destructors called
		// before the output buffer callback function executes.
		// Thus, globalized objects will not be available as expected in the function.
		// This is stated to be intended behavior, as per the following: [https://bugs.php.net/bug.php?id=40104]
		$defaultQuery = wfCgiToArray( preg_replace( '/^.*?(\?|$)/', '', $this->wmlContext->getCurrentUrl() ) );
		unset( $defaultQuery['seg'] );
		unset( $defaultQuery['useformat'] );

		$qs = wfArrayToCgi( $defaultQuery );
		$delimiter = ( !empty( $qs ) ) ? '?' : '';
		$basePageParts = wfParseUrl( $this->wmlContext->getCurrentUrl() );
		$basePage = $basePageParts['scheme'] . $basePageParts['delimiter'] . $basePageParts['host'] . $basePageParts['path'] . $delimiter . $qs;
		$appendDelimiter = ( $delimiter === '?' ) ? '&amp;' : '?';

		if ( $idx < $segmentsCount ) {
			$card .= "<p><a href=\"{$basePage}{$appendDelimiter}seg={$idx}{$useFormatParam}\">"
				. $this->msg( 'mobile-frontend-wml-continue' ) . "</a></p>";
		}

		if ( $idx > 1 ) {
			$back_idx = $requestedSegment - 1;
			$card .= "<p><a href=\"{$basePage}{$appendDelimiter}seg={$back_idx}{$useFormatParam}\">"
				. $this->msg( 'mobile-frontend-wml-back' ) . "</a></p>";
		}

		$card .= '</card>';
		wfProfileOut( __METHOD__ );
		return $card;
	}
}
