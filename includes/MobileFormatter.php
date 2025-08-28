<?php

use MobileFrontend\Transforms\IMobileTransform;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;
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
	 * @param array<IMobileTransform> $transforms lit of transforms to be sequentually applied
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

	/**
	 * Check whether the MobileFormatter can be applied to the text of a page.
	 *
	 * @param array $options with 'maxHeadings' and 'maxImages' keys that limit the MobileFormatter
	 *  to pages with less than or equal to that number of headings and images.
	 * @return bool
	 */
	public function canApply( array $options ): bool {
		$headings = DOMCompat::querySelectorAll( $this->body, 'h1,h2,h3,h4,h5,h6' );
		$images = DOMCompat::querySelectorAll( $this->body, 'img' );
		return count( $headings ) <= $options['maxHeadings'] && count( $images ) <= $options['maxImages'];
	}
}
