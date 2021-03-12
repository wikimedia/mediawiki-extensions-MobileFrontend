<?php

use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\MoveLeadParagraphTransform;
use MobileFrontend\Transforms\SubHeadingTransform;

/**
 * @group MobileFrontend
 */
class MobileFormatterTest extends MediaWikiTestCase {
	private const TOC = '<div id="toc" class="toc-mobile"><h2>Contents</h2></div>';
	// phpcs:ignore Generic.Files.LineLength.TooLong
	private const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator mw-ui-icon-small mw-ui-icon-flush-left"></div>';
	private const HATNOTE_CLASSNAME = 'hatnote';
	private const INFOBOX_CLASSNAME = 'infobox';

	/**
	 * @var Config
	 */
	private $mfConfig;

	/**
	 * @var MobileContext
	 */
	private $mfContext;

	protected function setUp() : void {
		parent::setUp();

		$services = \MediaWiki\MediaWikiServices::getInstance();
		$this->mfConfig = $services->getService( 'MobileFrontend.Config' );
		$this->mfContext = $services->getService( 'MobileFrontend.Context' );
	}

	/**
	 * Helper function that creates section headings from a heading and title
	 *
	 * @param string $heading
	 * @param string $innerHtml of the heading element
	 * @param int $sectionNumber heading corresponds to
	 * @return string
	 */
	private function makeSectionHeading( $heading, $innerHtml, $sectionNumber = 1 ) {
		return "<$heading class=\"section-heading\""
			. " onclick=\"mfTempOpenSection($sectionNumber)\">"
			. self::SECTION_INDICATOR
			. "$innerHtml</$heading>";
	}

	/**
	 * Helper function that creates sections from section number and content HTML.
	 *
	 * @param string $sectionNumber
	 * @param string $contentHtml
	 * @param bool $isReferenceSection whether the section contains references
	 * @return string
	 */
	private function makeSectionHtml( $sectionNumber, $contentHtml = '',
		$isReferenceSection = false
	) {
		$attrs = $isReferenceSection ? ' data-is-reference-section="1"' : '';
		$className = "mf-section-$sectionNumber";

		if ( $sectionNumber > 0 ) {
			$className .= ' ' . MobileFormatter::STYLE_COLLAPSIBLE_SECTION_CLASS;
		}

		return "<section class=\"$className\" id=\"mf-section-$sectionNumber\""
			. "$attrs>$contentHtml</section>";
	}

	/**
	 * @param string $input
	 * @param string $expected
	 * @param callable|bool $callback
	 * @covers MobileFormatter::applyTransforms
	 * @covers MobileFormatter::parseItemsToRemove
	 * @dataProvider provideHtmlTransform
	 */
	public function testHtmlTransform( $input, $expected, $callback = false ) {
		$t = Title::newFromText( 'Mobile' );

		// "yay" to Windows!
		$input = str_replace( "\r", '', $input );

		$mf = new MobileFormatter(
			MobileFormatter::wrapHTML( $input ), $t, $this->mfConfig, $this->mfContext
		);

		$transforms = $callback ? $callback( $t ) : [];
		$mf->applyTransforms( $transforms );

		$html = $mf->getText();
		$this->assertEquals( str_replace( "\n", '', $expected ), str_replace( "\n", '', $html ) );
	}

	/**
	 * @covers MobileFormatter::applyTransforms
	 */
	public function testHtmlTransformWhenSkippingLazyLoadingSmallImages() {
		$smallPic = '<img src="smallPicture.jpg" style="width: 4.4ex; height:3.34ex;">';
		$enableSections = function ( Title $t ) {
			return $this->buildTransforms( [ 'h1', 'h2' ], true, $t, true, false, false );
		};

		$this->testHtmlTransform(
			'<p>text</p><h2>heading 1</h2>' . $smallPic,
			$this->makeSectionHtml( 0, '<p>text</p>' )
			. $this->makeSectionHeading( 'h2', 'heading 1' )
			. $this->makeSectionHtml( 1, $smallPic ),
			$enableSections
		);
	}

	public function provideHtmlTransform() {
		$enableSections = function ( Title $t ) {
			return $this->buildTransforms( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ], false, $t, true, true, true );
		};
		$longLine = "\n" . str_repeat( 'A', 5000 );
		$originalImage = '<img alt="foo" src="foo.jpg" width="100" '
			. 'height="100" srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">';
		$placeholder = '<span class="lazy-image-placeholder" '
			. 'style="width: 100px;height: 100px;" '
			. 'data-src="foo.jpg" data-alt="foo" data-width="100" data-height="100" '
			. 'data-srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">'
			. ' '
			. '</span>';
		$noscript = '<noscript><img alt="foo" src="foo.jpg" width="100" height="100"></noscript>';

		return [
			// Nested headings are not wrapped
			[
				'<div class="wrapper"><p>Text goes here i think 2testestestestest</p>'
					. '<h2>Heading</h2>I am awesome</div>'
					. 'Text<h2>test</h2><p>more text</p>',
				$this->makeSectionHtml( 0,
					'<div class="wrapper"><p>Text goes here i think 2testestestestest</p>'
						. '<h2>Heading</h2>I am awesome</div>Text' )
					. $this->makeSectionHeading( 'h2', 'test' )
					. $this->makeSectionHtml( 1, '<p>more text</p>' ),
				$enableSections,
				false
			],
			// # Lazy loading images
			// Main page not impacted
			[
				'<div>a</div><h2>Today</h2>' . $originalImage . '<h2>Tomorrow</h2>Test.',
				'<div>a</div><h2>Today</h2>' . $originalImage . '<h2>Tomorrow</h2>Test.',
				// use default formatter
				false,
				true,
			],
			// Lead section images not impacted
			[
				'<p>' . $originalImage . '</p><h2>heading 1</h2><p>text</p>'
					. '<h2>heading 2</h2>abc',
				$this->makeSectionHtml( 0, '<p>' . $originalImage . '</p>' )
					. $this->makeSectionHeading( 'h2', 'heading 1' )
					. $this->makeSectionHtml( 1, '<p>text</p>' )
					. $this->makeSectionHeading( 'h2', 'heading 2', 2 )
					. $this->makeSectionHtml( 2, 'abc' ),
				$enableSections,
				true,
			],
			// Test lazy loading of images outside the lead section
			[
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $originalImage
					. '<h2>heading 2</h2>abc',
					$this->makeSectionHtml( 0, '<p>text</p>' )
					. $this->makeSectionHeading( 'h2', 'heading 1' )
					. $this->makeSectionHtml( 1,
						'<p>text</p>' . $noscript . $placeholder
					)
					. $this->makeSectionHeading( 'h2', 'heading 2', 2 )
					. $this->makeSectionHtml( 2, 'abc' ),
				$enableSections,
				true,
			],
			// https://phabricator.wikimedia.org/T130025, last section filtered
			[
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $originalImage
				. '<h2>heading 2</h2>' . $originalImage,
				$this->makeSectionHtml( 0, '<p>text</p>' )
					. $this->makeSectionHeading( 'h2', 'heading 1' )
					. $this->makeSectionHtml( 1,
						'<p>text</p>' . $noscript . $placeholder
					)
					. $this->makeSectionHeading( 'h2', 'heading 2', 2 )
					. $this->makeSectionHtml( 2, $noscript . $placeholder ),
				$enableSections,
				true,
			],

			// # Section wrapping
			// \n</h2> in headers
			[
				'<h2><span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h2',
						'<span class="mw-headline" id="Forty-niners">Forty-niners</span>'
						. '<a class="edit-page" href="#editor/2">Edit</a>'
					)
					. $this->makeSectionHtml( 1, $longLine ),
				$enableSections
			],
			// \n</h3> in headers
			[
				'<h3><span>h3</span></h3>'
					. $longLine
					. '<h4><span>h4</span></h4>'
					. 'h4 text.',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h3', '<span>h3</span>' )
					. $this->makeSectionHtml( 1, $longLine
						. '<h4 class="in-block"><span>h4</span></h4>'
						. 'h4 text.'
					),
				$enableSections
			],
			// \n</h6> in headers
			[
				'<h6><span>h6</span></h6>'
					. $longLine,
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h6', '<span>h6</span>' )
					. $this->makeSectionHtml( 1, $longLine ),
				$enableSections
			],
			// Bug 36670
			[
				'<h2><span class="mw-headline" id="History"><span id="Overview"></span>'
					. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				$this->makeSectionHtml( 0, '' )
				. $this->makeSectionHeading( 'h2',
					'<span class="mw-headline" id="History"><span id="Overview"></span>'
						. 'History</span><a class="edit-page" href="#editor/2">Edit</a>'
					)
				. $this->makeSectionHtml( 1, $longLine ),
				$enableSections
			],

			// Infobox and the first paragraph in lead section transformations
			[
				// no lead section, no infobox, a section
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml( 0, '' ) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],
			[
				// hat-note, lead section, no infobox, another section
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<p>paragraph 1</p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<p>paragraph 1</p>' .
					'<p>paragraph 2</p>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],
			[
				// hat-note, lead section, infobox, another section
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 1</p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<p>paragraph 2</p>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],
			[
				// first paragraph is already before the lead section
				'<p>paragraph 1</p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<p>paragraph 2</p>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],
			[
				// infobox, but no paragraphs in the lead section
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 1</p>',

				$this->makeSectionHtml(
					0,
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 1</p>'
				),

				$enableSections, false, true,
			],
			[
				// no lead section, infobox after the first section
				'<h2>Heading 1</h2>' .
				'<p>paragraph 1</p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>',

				$this->makeSectionHtml( 0, '' ) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),

				$enableSections, false, true,
			],
			[
				// two infoboxes, lead section, another section
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>' .
				'<p>paragraph 1</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 1</p>',

				$this->makeSectionHtml(
					0,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 1</p>'
				),

				$enableSections, false, true,
			],
			[
				// first paragraph (which has coordinates and is hidden on mobile),
				// infobox, lead section
				'<body>' .
				'<p><span><span id="coordinates">Coordinates</span></span></p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>' .
				'</body>',

				$this->makeSectionHtml(
					0,
					'<p><span><span id="coordinates">Coordinates</span></span></p>' .
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),

				$enableSections, false, true,
			],
			[
				// hatnote, infobox, thumbnail, lead section, another section
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<div class="thumb">Thumbnail</div>' .
				'<p>paragraph 1</p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<div class="thumb">Thumbnail</div>' .
					'<p>paragraph 2</p>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],

			[
				// empty first paragraph, infobox, second paragraph, another section
				'<p></p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<p></p>' .
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],

			[
				// infobox, empty first paragraph, second paragraph, another section
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p></p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<p></p>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],
			[
				// infobox, a paragraph, list element
				// @see https://phabricator.wikimedia.org/T149852
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph</p>' .
				'<ol><li>item 1</li><li>item 2</li></ol>',

				$this->makeSectionHtml(
					0,
					'<p>paragraph</p><ol><li>item 1</li><li>item 2</li></ol>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),
				$enableSections, false, true,
			],
			[
				// 2 hat-notes, ambox, 2 infoboxes, 2 paragraphs, another section
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<table class="ambox"><tr><td>ambox</td></tr></table>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>' .
				'<p>paragraph 1</p>' .
				'<p>paragraph 2</p>' .
				'<ul><li>item</li></ul>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				$this->makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<table class="ambox"><tr><td>ambox</td></tr></table>' .
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>' .
					'<p>paragraph 2</p><ul><li>item</li></ul>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, true,
			],

			[
				// Minimal test case for T149561: `p` elements should be immediate
				// descendants of the section container element (`div`, currently).

				'<table class="' . self::INFOBOX_CLASSNAME . '">' .
				'<tr><td><p>SURPRISE PARAGRAPH</p></td></tr></table>' .
				'<p>paragraph 1</p>',

				$this->makeSectionHtml(
					0,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '">' .
					'<tr><td><p>SURPRISE PARAGRAPH</p></td></tr></table>'
				),

				$enableSections, false, true,
			],

			[
				// T149389: If the infobox is inside one or more containers, i.e. not an
				// immediate child of the section container element, then
				// MobileFormatter#moveFirstParagraphBeforeInfobox will trigger a "Not
				// Found Error" warning.
				// Do not touch infoboxes that are not immediate children of the lead section
				// unless... (see next test T170006)
				'<div><table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table></div>' .
				'<p>paragraph 1</p>',

				$this->makeSectionHtml(
					0,
					'<div><table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table></div>' .
					'<p>paragraph 1</p>'
				),

				$enableSections,  false, true,
			],
		];
	}

	public function buildTransforms(
		$topHeadingTags,
		$lazyLoadSkipImages,
		$title,
		bool $scriptsEnabled,
		bool $shouldLazyTransformImages,
		bool $showFirstParagraphBeforeInfobox
	) {
		// Sectionify the content and transform it if necessary per section

		$transforms = [];
		$transforms[] = new SubHeadingTransform( $topHeadingTags );

		$transforms[] = new MakeSectionsTransform(
			$topHeadingTags,
			$scriptsEnabled
		);

		if ( $shouldLazyTransformImages ) {
			$transforms[] = new LazyImageTransform( $lazyLoadSkipImages );
		}

		if ( $showFirstParagraphBeforeInfobox ) {
			$transforms[] = new MoveLeadParagraphTransform(
				$title,
				$title->getLatestRevID()
			);
		}
		return $transforms;
	}

	/**
	 * @covers MobileFormatter::applyTransforms
	 * @dataProvider provideHeadingTransform
	 */
	public function testHeadingTransform( array $topHeadingTags, $input, $expectedOutput ) {
		$t = Title::newFromText( 'Mobile' );
		$formatter = new MobileFormatter( $input, $t, $this->mfConfig, $this->mfContext );

		$formatter->applyTransforms(
			$this->buildTransforms( $topHeadingTags, false, $t, true, false, false )
 );

		$this->assertEquals( $expectedOutput, $formatter->getText() );
	}

	public function provideHeadingTransform() {
		return [

			// The "in-block" class is added to a subheading.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h1', 'Foo' )
					. $this->makeSectionHtml( 1, '<h2 class="in-block">Bar</h2>' )
			],

			// The "in-block" class is added to a subheading
			// without overwriting the existing attribute.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2 class="baz">Bar</h2>',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h1', 'Foo' )
					. $this->makeSectionHtml( 1, '<h2 class="baz in-block">Bar</h2>' ),
			],

			// The "in-block" class is added to all subheadings.
			[
				[ 'h1', 'h2', 'h3' ],
				'<h1>Foo</h1><h2>Bar</h2><h3>Qux</h3>',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h1', 'Foo' )
					. $this->makeSectionHtml( 1, '<h2 class="in-block">Bar</h2><h3 class="in-block">Qux</h3>' )
			],

			// The first heading found is the highest ranked
			// subheading.
			[
				[ 'h1', 'h2', 'h3' ],
				'<h2>Bar</h2><h3>Qux</h3>',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h2', 'Bar' )
					. $this->makeSectionHtml( 1, '<h3 class="in-block">Qux</h3>' ),
			],

			// Unenclosed text is appended to the expandable container.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>A',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h1', 'Foo' )
					. $this->makeSectionHtml( 1, '<h2 class="in-block">Bar</h2>A' )
			],

			// Unencloded text that appears before the first
			// heading is appended to a container.
			// FIXME: This behaviour was included for backwards
			// compatibility but mightn't be necessary.
			[
				[ 'h1', 'h2' ],
				'A<h1>Foo</h1><h2>Bar</h2>',
				$this->makeSectionHtml( 0, '<p>A</p>' )
					. $this->makeSectionHeading( 'h1', 'Foo' )
					. $this->makeSectionHtml( 1, '<h2 class="in-block">Bar</h2>' ),
			],

			// Multiple headings are handled identically.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>Baz<h1>Qux</h1>Quux',
				$this->makeSectionHtml( 0, '' )
					. $this->makeSectionHeading( 'h1', 'Foo' )
					. $this->makeSectionHtml( 1, '<h2 class="in-block">Bar</h2>Baz' )
					. $this->makeSectionHeading( 'h1', 'Qux', 2 )
					. $this->makeSectionHtml( 2, 'Quux' ),
			],
		];
	}

	/**
	 * @see https://phabricator.wikimedia.org/T137375
	 * @covers MobileFormatter::applyTransforms
	 * @covers MobileFormatter::parseItemsToRemove
	 */
	public function testT137375() {
		$input = '<p>Hello, world!</p><h2>Section heading</h2><ol class="references"></ol>';
		$formatter = new MobileFormatter(
			$input, Title::newFromText( 'Special:Foo' ), $this->mfConfig, $this->mfContext
		);
		$formatter->applyTransforms( [] );
		// Success is not crashing when the input is not a DOMElement.
		$this->assertTrue( true );
	}

	/**
	 * @see https://phabricator.wikimedia.org/T149884
	 * @param string $input
	 * @covers MobileFormatter::applyTransforms
	 * @dataProvider provideLoggingOfInfoboxesBeingWrappedInContainersWhenWrapped
	 */
	public function testLoggingOfInfoboxesBeingWrappedInContainersWhenWrapped( $input ) {
		$this->setMwGlobals( [
			'wgMFLogWrappedInfoboxes' => true
		] );
		$title = 'T149884';
		$t = Title::newFromText( $title, NS_MAIN );
		$formatter = new MobileFormatter(
			MobileFormatter::wrapHTML( $input ),
			$t,
			$this->mfConfig,
			$this->mfContext
		);

		$loggerMock = $this->createMock( \Psr\Log\LoggerInterface::class );
		$loggerMock->expects( $this->once() )
			->method( 'info' )
			->will( $this->returnCallback( function ( $message ) use ( $title ) {
				// Debug message contains Page title
				$this->assertStringContainsString( $title, $message );
				// and contains revision id which is 0 by default
				$this->assertStringContainsString( '0', $message );
			} ) );

		$this->setLogger( 'mobile', $loggerMock );
		$formatter->applyTransforms(
			$this->buildTransforms( [], false, $t, false, false, true )
		);
	}

	public function provideLoggingOfInfoboxesBeingWrappedInContainersWhenWrapped() {
		$box = $this->buildInfoboxHTML( 'infobox' );
		return [
			// wrapped once
			[ "<div>$box</div>" ],
			// wrapped twice
			[ "<div><p>$box</p></div>" ],
			// wrapped multiple times
			[ "<div><div><p><span><div><p>Test</p>$box</div></span></p></div></div>" ]
		];
	}

	/**
	 * @see https://phabricator.wikimedia.org/T149884
	 * @covers MobileFormatter::applyTransforms
	 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform::logInfoboxesWrappedInContainers
	 * @dataProvider provideLoggingOfInfoboxesBeingWrappedInContainersWhenNotWrapped
	 */
	public function testLoggingOfInfoboxesBeingWrappedInContainersWhenNotWrapped( $input ) {
		$this->setMwGlobals( [
			'wgMFLogWrappedInfoboxes' => true
		] );
		$title = 'T149884';

		$t = Title::newFromText( $title );
		$formatter = new MobileFormatter(
			MobileFormatter::wrapHTML( $input ),
			$t,
			$this->mfConfig,
			$this->mfContext
		);

		$loggerMock = $this->createMock( \Psr\Log\LoggerInterface::class );
		$loggerMock->expects( $this->never() )
			->method( 'info' );

		$this->setLogger( 'mobile', $loggerMock );
		$formatter->applyTransforms(
			$this->buildTransforms( [], false, $t, false, false, true )
		);
	}

	public function provideLoggingOfInfoboxesBeingWrappedInContainersWhenNotWrapped() {
		$box = $this->buildInfoboxHTML( 'infobox' );
		return [
			// no wrapping
			[ $box ],
			// Although the box is wrapped, it comes over the first paragraph so isn't a problem (T196767)
			[ "<p>First para</p><div>$box</div>" ],
			// Although the box is wrapped, it comes over the first paragraph so isn't a problem (T196767)
			[ "<p>First para</p><div><div><div>$box</div></div></div>" ],
			// if wrapped inside mw-stack no logging occurs
			[ "<div class=\"mw-stack\">$box</div>" ],
		];
	}

	/**
	 * @see https://phabricator.wikimedia.org/T163805
	 * @covers MobileFormatter::applyTransforms
	 */
	public function testLoggingOfInfoboxesSkipsInfoBoxInsideInfobox() {
		$this->setMwGlobals( [
			'wgMFLogWrappedInfoboxes' => true
		] );

		// wrapped inside different infobox
		$input = $this->buildInfoboxHTML( $this->buildInfoboxHTML( 'test' ) );
		$title = 'T163805';
		$t = Title::newFromText( $title, NS_MAIN );
		$formatter = new MobileFormatter(
			MobileFormatter::wrapHTML( $input ),
			Title::newFromText( $title, NS_MAIN ),
			$this->mfConfig,
			$this->mfContext
		);

		$loggerMock = $this->createMock( \Psr\Log\LoggerInterface::class );
		$loggerMock->expects( $this->never() )
			->method( 'info' );

		$this->setLogger( 'mobile', $loggerMock );
		$formatter->applyTransforms(
			$this->buildTransforms( [], false, $t, true, false, true )
		);
	}

	/**
	 * Helper function to create an infobox with given content
	 *
	 * @param string $content
	 * @return string built HTML
	 */
	private function buildInfoboxHTML( $content ) {
		return "<table class=\"" . self::INFOBOX_CLASSNAME . "\"><tr><td>" .
			$content . "</td></tr></table>";
	}
}
