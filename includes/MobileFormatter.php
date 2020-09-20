<?php

use HtmlFormatter\HtmlFormatter;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Transforms\IMobileTransform;
use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\MoveLeadParagraphTransform;
use MobileFrontend\Transforms\SubHeadingTransform;

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
	 * @var array<IMobileTransform>
	 */
	private $transforms = [];

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
	 * Creates and returns a MobileFormatter
	 *
	 * @param MobileContext $context in which the page is being rendered. Needed to access page title
	 *  and MobileFrontend configuration.
	 * @param IContentProvider $provider
	 * @param Config $config
	 *
	 * @return self
	 */
	public static function newFromContext(
		MobileContext $context,
		IContentProvider $provider,
		Config $config
	) {
		$title = $context->getTitle();
		$html = self::wrapHTML( $provider->getHTML() );
		$formatter = new self( $html, $title, $config, $context );
		return $formatter;
	}

	/**
	 * Enables support of page for expandable sections
	 * NOTE: this function isn't idempotent and second call might lead to unexpected
	 * results.
	 *
	 * @todo refactor it in a way to pass array of transforms in contructor, to make
	 *   class immutable
	 *
	 * @todo kill with fire when there will be minimum of pre-1.1 app users remaining
	 *
	 * @param bool $scriptsEnabled should scripts in sections be enabled?
	 * @param bool $shouldLazyTransformImages whether to enable lazyTransformImages feature
	 * @param bool $showFirstParagraphBeforeInfobox Whether the first paragraph from the lead
	 *  section should be shown before all infoboxes that come earlier.
	 */
	public function enableExpandableSections(
		bool $scriptsEnabled,
		bool $shouldLazyTransformImages,
		bool $showFirstParagraphBeforeInfobox
	) {
		// Sectionify the content and transform it if necessary per section

		$options = $this->config->get( 'MFMobileFormatterOptions' );
		$topHeadingTags = $options['headings'];

		$this->transforms[] = new SubHeadingTransform( $topHeadingTags );

		$this->transforms[] = new MakeSectionsTransform(
			$topHeadingTags,
			$scriptsEnabled
		);

		if ( $shouldLazyTransformImages ) {
			$this->transforms[] = new LazyImageTransform(
				$this->config->get( 'MFLazyLoadSkipSmallImages' )
			);
		}

		if ( $showFirstParagraphBeforeInfobox ) {
			$this->transforms[] = new MoveLeadParagraphTransform(
				$this->title,
				$this->title->getLatestRevID()
			);
		}
	}

	/**
	 * Performs various transformations to the content to make it appropriate for mobile devices.
	 */
	public function applyTransforms() {
		// Apply all removals before continuing with transforms (see T185040 for example)
		$this->filterContent();

		$doc = $this->getDoc();
		$body = $doc->getElementsByTagName( 'body' )->item( 0 );

		foreach ( $this->transforms as $transform ) {
			/** @phan-suppress-next-line PhanTypeMismatchArgument DOMNode vs. DOMElement */
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
