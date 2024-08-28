<?php

use HtmlFormatter\HtmlFormatter;
use MobileFrontend\Transforms\IMobileTransform;
use Wikimedia\Parsoid\Utils\DOMCompat;

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter extends HtmlFormatter {

	/**
	 * @inheritDoc
	 */
	public function __construct( $html ) {
		// This is specific to HtmlFormatter, decouple it from callers.
		parent::__construct( self::wrapHTML( $html ) );
	}

	/**
	 * Performs various transformations to the content to make it appropriate for mobile devices.
	 * @param array<IMobileTransform> $transforms lit of transforms to be sequentually applied
	 *   to html DOM
	 */
	public function applyTransforms( array $transforms ) {
		$doc = $this->getDoc();
		$body = DOMCompat::querySelector( $doc, 'body' );

		foreach ( $transforms as $transform ) {
			$transform->apply( $body );
		}
	}

	/**
	 * Check whether the MobileFormatter can be applied to the text of a page.
	 * @param string $text
	 * @param array $options with 'maxHeadings' and 'maxImages' keys that limit the MobileFormatter
	 *  to pages with less than or equal to that number of headings and images.
	 * @return bool
	 */
	public static function canApply( $text, $options ) {
		$headings = preg_match_all( '/<[hH][1-6]/', $text );
		$imgs = preg_match_all( '/<img/', $text );
		return $headings <= $options['maxHeadings'] && $imgs <= $options['maxImages'];
	}
}
