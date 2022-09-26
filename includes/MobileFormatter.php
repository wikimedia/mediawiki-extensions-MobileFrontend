<?php

use MobileFrontend\Transforms\IMobileTransform;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Ext\DOMUtils;
use Wikimedia\Parsoid\Wt2Html\XHtmlSerializer;

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter {

	/** @var Element */
	private $body;

	/**
	 * @inheritDoc
	 */
	public function __construct( string $html ) {
		$doc = DOMUtils::parseHTML( $html );
		$this->body = DOMCompat::getBody( $doc );
	}

	/**
	 * Performs various transformations to the content to make it appropriate for mobile devices.
	 *
	 * @param array<IMobileTransform> $transforms lit of transforms to be sequentially applied
	 *   to html DOM
	 */
	public function applyTransforms( array $transforms ): void {
		foreach ( $transforms as $transform ) {
			$transform->apply( $this->body );
		}
	}

	/**
	 * Get the serialized HTML
	 *
	 * @return string
	 */
	public function getHtml(): string {
		// Like DOMCompat::getInnerHTML(), but disable 'smartQuote' for compatibility with
		// ParserOutput::EDITSECTION_REGEX matching 'mw:editsection' tags (T274709)
		return XHtmlSerializer::serialize( $this->body, [ 'innerXML' => true, 'smartQuote' => false ] )['html'];
	}
}
