<?php

use HtmlFormatter\HtmlFormatter;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\SubHeadingTransform;

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter extends HtmlFormatter {
	/**
	 * Class name for collapsible section wrappers
	 */
	const STYLE_COLLAPSIBLE_SECTION_CLASS = 'collapsible-block';

	/**
	 * Whether scripts can be added in the output.
	 * @var bool
	 */
	private $scriptsEnabled = true;

	/**
	 * The current revision id of the Title being worked on
	 * @var int
	 */
	private $revId;

	/**
	 * @var string[] Array of strings with possible tags,
	 * can be recognized as top headings.
	 */
	public $topHeadingTags = [];

	/**
	 * @var Title
	 */
	protected $title;

	/**
	 * Are sections expandable?
	 * @var bool
	 */
	protected $expandableSections = false;

	/**
	 * @var Config
	 */
	private $config;

	/**
	 * @var MobileContext
	 */
	private $context;

	/**
	 * Name of the transformation option
	 */
	const SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX = 'showFirstParagraphBeforeInfobox';

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
		$this->revId = $title->getLatestRevID();
		$this->config = $config;
		$this->context = $context;
		$options = $config->get( 'MFMobileFormatterOptions' );
		$this->topHeadingTags = $options['headings'];
	}

	/**
	 * Disables the generation of script tags in output HTML.
	 * This will only be used by the MakeSectionsTransform.
	 */
	public function disableScripts() {
		$this->scriptsEnabled = false;
	}

	/**
	 * Creates and returns a MobileFormatter
	 *
	 * @param MobileContext $context in which the page is being rendered. Needed to access page title
	 *  and MobileFrontend configuration.
	 * @param IContentProvider $provider
	 * @param bool $enableSections whether to wrap the content of sections
	 * @param Config $config
	 *
	 * @return self
	 */
	public static function newFromContext(
		MobileContext $context,
		IContentProvider $provider,
		$enableSections,
		Config $config
	) {
		$title = $context->getTitle();
		$html = self::wrapHTML( $provider->getHTML() );
		$formatter = new self( $html, $title, $config, $context );
		$formatter->enableExpandableSections( $enableSections );

		return $formatter;
	}

	/**
	 * Set support of page for expandable sections to $flag (standard: true)
	 * @todo kill with fire when there will be minimum of pre-1.1 app users remaining
	 * @param bool $flag should expandable sections be supported?
	 */
	public function enableExpandableSections( $flag = true ) {
		$this->expandableSections = $flag;
	}

	/**
	 * Performs various transformations to the content to make it appropriate for mobile devices.
	 *
	 * @param bool $removeImages Whether to move images into noscript tags
	 * @param bool $showFirstParagraphBeforeInfobox Whether the first paragraph from the lead
	 *  section should be shown before all infoboxes that come earlier.
	 */
	public function applyTransforms(
		$removeImages = false,
		$showFirstParagraphBeforeInfobox = false
	) {
		$doc = $this->getDoc();
		$body = $doc->getElementsByTagName( 'body' )->item( 0 );
		// Apply all removals before continuing with transforms (see T185040 for example)
		$this->filterContent();
		// Sectionify the content and transform it if necessary per section
		if ( $this->expandableSections ) {
			$subHeadingTransform = new SubHeadingTransform( $this->topHeadingTags );
			/** @phan-suppress-next-line PhanTypeMismatchArgument DOMNode vs. DOMElement */
			$subHeadingTransform->apply( $body );
			$makeSectionsTransform = new MakeSectionsTransform(
				$this->topHeadingTags,
				$showFirstParagraphBeforeInfobox,
				$this->title,
				$this->revId,
				$this->scriptsEnabled,
				$removeImages,
				$this->config->get( 'MFLazyLoadSkipSmallImages' )
			);
			/** @phan-suppress-next-line PhanTypeMismatchArgument DOMNode vs. DOMElement */
			$makeSectionsTransform->apply( $body );
		}
	}

	/**
	 * @inheritDoc
	 */
	protected function parseItemsToRemove() {
		$removals = parent::parseItemsToRemove();

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
