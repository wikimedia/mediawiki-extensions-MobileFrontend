<?php

use HtmlFormatter\HtmlFormatter;
use MobileFrontend\Transforms\IMobileTransform;

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter extends HtmlFormatter {
	/**
	 * Class name for collapsible section wrappers
	 */
	public const STYLE_COLLAPSIBLE_SECTION_CLASS = 'collapsible-block';

	/**
	 * @var Title
	 */
	protected $title;

	/**
	 * @var Config
	 */
	private $config;

	/**
	 * @var MobileContext
	 */
	private $context;

	/**
	 * @param string $html Text to process
	 * @param Title $title Title to which $html belongs
	 * @param Config $config
	 * @param MobileContext $context
	 */
	public function __construct(
		$html, Title $title, Config $config, MobileContext $context
	) {
		parent::__construct( $html );

		$this->title = $title;
		$this->context = $context;
		$this->config = $config;
	}

	/**
	 * Performs various transformations to the content to make it appropriate for mobile devices.
	 * @param array<IMobileTransform> $transforms lit of transforms to be sequentually applied
	 *   to html DOM
	 */
	public function applyTransforms( array $transforms ) {
		// Apply all removals before continuing with transforms (see T185040 for example)
		$this->filterContent();

		$doc = $this->getDoc();
		$body = $doc->getElementsByTagName( 'body' )->item( 0 );

		foreach ( $transforms as $transform ) {
			$transform->apply( $body );
		}
	}

	/**
	 * @inheritDoc
	 */
	protected function parseItemsToRemove() {
		$removals = parent::parseItemsToRemove();

		// Don't remove elements in special pages
		if ( !$this->title->isSpecialPage() ) {
			$mfRemovableClasses = $this->config->get( 'MFRemovableClasses' );
			$removableClasses = $mfRemovableClasses['base'];
			if ( $this->context->isBetaGroupMember() ) {
				$removableClasses = array_merge( $removableClasses, $mfRemovableClasses['beta'] );
			}

			foreach ( $removableClasses as $itemToRemove ) {
				if ( $this->parseSelector( $itemToRemove, $type, $rawName ) ) {
					$removals[$type][] = $rawName;
				}
			}
		}

		return $removals;
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
