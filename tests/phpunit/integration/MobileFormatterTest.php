<?php

use MediaWiki\Config\Config;
use MediaWiki\Title\Title;
use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;
use MobileFrontend\Transforms\MoveLeadParagraphTransform;
use MobileFrontend\Transforms\RemovableClassesTransform;

/**
 * @group MobileFrontend
 * @covers MobileFormatter
 * @covers \MobileFrontend\Transforms\MakeSectionsTransform
 * @covers \MobileFrontend\Transforms\MoveLeadParagraphTransform
 * @covers \MobileFrontend\Transforms\RemovableClassesTransform
 */
class MobileFormatterTest extends MediaWikiIntegrationTestCase {
	private const TOC = '<div id="toc" class="toc-mobile"><h2>Contents</h2></div>';
	private const SECTION_INDICATOR = '<span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>';
	private const HATNOTE_CLASSNAME = 'hatnote';
	private const INFOBOX_CLASSNAME = 'infobox';
	private const TITLE_REV_ID = 42;

	/**
	 * @var Config
	 */
	private $mfConfig;

	/**
	 * @var MobileContext
	 */
	private $mfContext;

	protected function setUp(): void {
		parent::setUp();

		$services = $this->getServiceContainer();
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
	private static function makeSectionHeading( $heading, $innerHtml, $sectionNumber = 1 ) {
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
	 * @return string
	 */
	private static function makeSectionHtml( $sectionNumber, $contentHtml = '' ) {
		$className = "mf-section-$sectionNumber";

		if ( $sectionNumber > 0 ) {
			$className .= ' ' . MakeSectionsTransform::STYLE_COLLAPSIBLE_SECTION_CLASS;
		}

		return "<section class=\"$className\" id=\"mf-section-$sectionNumber\""
			. ">$contentHtml</section>";
	}

	/**
	 * @param string $input
	 * @param string $expected
	 * @param bool $skipSmallImages
	 * @covers \MobileFrontend\Transforms\LazyImageTransform
	 * @dataProvider provideHtmlTransform
	 */
	public function testHtmlTransform( $input, $expected, $skipSmallImages = false ) {
		$title = Title::makeTitle( NS_MAIN, __METHOD__ );

		$mf = new MobileFormatter( $input );

		$transforms = self::buildTransforms( $title, $skipSmallImages );
		$mf->applyTransforms( $transforms );

		$html = $mf->getText();
		$this->assertEquals( str_replace( "\n", '', $expected ), str_replace( "\n", '', $html ) );
	}

	public static function provideHtmlTransform() {
		$longLine = "\n" . str_repeat( 'A', 5000 );
		$originalImage = '<img alt="foo" src="foo.jpg" width="100" '
			. 'height="100" srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">';
		$placeholder = '<span class="lazy-image-placeholder" '
			. 'style="width: 100px;height: 100px;" '
			. 'data-mw-src="foo.jpg" data-alt="foo" data-width="100" data-height="100" '
			. 'data-mw-srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">'
			. '&nbsp;'
			. '</span>';
		$noscript = '<noscript><img alt="foo" src="foo.jpg" width="100" height="100"></noscript>';
		$smallPic = '<img src="smallPicture.jpg" style="width: 4.4ex; height:3.34ex;">';

		return [
			// Nested headings are not wrapped
			[
				'<div class="wrapper"><p>Text goes here i think 2testestestestest</p>'
					. '<h2>Heading</h2>I am awesome</div>'
					. 'Text<h2>test</h2><p>more text</p>',
				self::makeSectionHtml( 0,
					'<div class="wrapper"><p>Text goes here i think 2testestestestest</p>'
						. '<h2>Heading</h2>I am awesome</div>Text' )
					. self::makeSectionHeading( 'h2', 'test' )
					. self::makeSectionHtml( 1, '<p>more text</p>' ),
			],
			// # Lazy loading images
			// Lead section images not impacted
			[
				'<p>' . $originalImage . '</p><h2>heading 1</h2><p>text</p>'
					. '<h2>heading 2</h2>abc',
				self::makeSectionHtml( 0, '<p>' . $originalImage . '</p>' )
					. self::makeSectionHeading( 'h2', 'heading 1' )
					. self::makeSectionHtml( 1, '<p>text</p>' )
					. self::makeSectionHeading( 'h2', 'heading 2', 2 )
					. self::makeSectionHtml( 2, 'abc' ),
			],
			// Small images not impacted when configured
			[
				'<p>text</p><h2>heading 1</h2>' . $smallPic,
				self::makeSectionHtml( 0, '<p>text</p>' )
					. self::makeSectionHeading( 'h2', 'heading 1' )
					. self::makeSectionHtml( 1, $smallPic ),
				// Skip small images
				true
			],
			// Test lazy loading of images outside the lead section
			[
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $originalImage
					. '<h2>heading 2</h2>abc',
					self::makeSectionHtml( 0, '<p>text</p>' )
					. self::makeSectionHeading( 'h2', 'heading 1' )
					. self::makeSectionHtml( 1,
						'<p>text</p>' . $noscript . $placeholder
					)
					. self::makeSectionHeading( 'h2', 'heading 2', 2 )
					. self::makeSectionHtml( 2, 'abc' ),
			],
			// https://phabricator.wikimedia.org/T130025, last section filtered
			[
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $originalImage
				. '<h2>heading 2</h2>' . $originalImage,
				self::makeSectionHtml( 0, '<p>text</p>' )
					. self::makeSectionHeading( 'h2', 'heading 1' )
					. self::makeSectionHtml( 1,
						'<p>text</p>' . $noscript . $placeholder
					)
					. self::makeSectionHeading( 'h2', 'heading 2', 2 )
					. self::makeSectionHtml( 2, $noscript . $placeholder ),
			],

			// # Section wrapping
			// \n</h2> in headers
			[
				'<h2><span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				self::makeSectionHtml( 0, '' )
					. self::makeSectionHeading( 'h2',
						'<span class="mw-headline" id="Forty-niners">Forty-niners</span>'
						. '<a class="edit-page" href="#editor/2">Edit</a>'
					)
					. self::makeSectionHtml( 1, $longLine ),
			],
			// \n</h3> in headers
			[
				'<h3><span>h3</span></h3>'
					. $longLine
					. '<h4><span>h4</span></h4>'
					. 'h4 text.',
				self::makeSectionHtml( 0, '' )
					. self::makeSectionHeading( 'h3', '<span>h3</span>' )
					. self::makeSectionHtml( 1, $longLine
						. '<h4><span>h4</span></h4>'
						. 'h4 text.'
					),
			],
			// \n</h6> in headers
			[
				'<h6><span>h6</span></h6>'
					. $longLine,
				self::makeSectionHtml( 0, '' )
					. self::makeSectionHeading( 'h6', '<span>h6</span>' )
					. self::makeSectionHtml( 1, $longLine ),
			],
			// T38670
			[
				'<h2><span class="mw-headline" id="History"><span id="Overview"></span>'
					. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				self::makeSectionHtml( 0, '' )
				. self::makeSectionHeading( 'h2',
					'<span class="mw-headline" id="History"><span id="Overview"></span>'
						. 'History</span><a class="edit-page" href="#editor/2">Edit</a>'
					)
				. self::makeSectionHtml( 1, $longLine ),
			],

			// Infobox and the first paragraph in lead section transformations
			[
				// no lead section, no infobox, a section
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				self::makeSectionHtml( 0, '' ) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],
			[
				// hat-note, lead section, no infobox, another section
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<p>paragraph 1</p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				self::makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<p>paragraph 1</p>' .
					'<p>paragraph 2</p>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],
			[
				// hat-note, lead section, infobox, another section
				'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 1</p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				self::makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<p>paragraph 2</p>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],
			[
				// first paragraph is already before the lead section
				'<p>paragraph 1</p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				self::makeSectionHtml(
					0,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<p>paragraph 2</p>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],
			[
				// infobox, but no paragraphs in the lead section
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 1</p>',

				self::makeSectionHtml(
					0,
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 1</p>'
				),
			],
			[
				// no lead section, infobox after the first section
				'<h2>Heading 1</h2>' .
				'<p>paragraph 1</p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>',

				self::makeSectionHtml( 0, '' ) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),
			],
			[
				// two infoboxes, lead section, another section
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>' .
				'<p>paragraph 1</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 1</p>',

				self::makeSectionHtml(
					0,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 1</p>'
				),
			],
			[
				// first paragraph (which has coordinates and is hidden on mobile),
				// infobox, lead section
				'<body>' .
				'<p><span><span id="coordinates">Coordinates</span></span></p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>' .
				'</body>',

				self::makeSectionHtml(
					0,
					'<p><span><span id="coordinates">Coordinates</span></span></p>' .
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),
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

				self::makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<div class="thumb">Thumbnail</div>' .
					'<p>paragraph 2</p>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],

			[
				// empty first paragraph, infobox, second paragraph, another section
				'<p></p>' .
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				self::makeSectionHtml(
					0,
					'<p></p>' .
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],

			[
				// infobox, empty first paragraph, second paragraph, another section
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p></p>' .
				'<p>paragraph 2</p>' .
				'<h2>Heading 1</h2>' .
				'<p>paragraph 3</p>',

				self::makeSectionHtml(
					0,
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
					'<p></p>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],
			[
				// infobox, a paragraph, list element
				// @see https://phabricator.wikimedia.org/T149852
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph</p>' .
				'<ol><li>item 1</li><li>item 2</li></ol>',

				self::makeSectionHtml(
					0,
					'<p>paragraph</p><ol><li>item 1</li><li>item 2</li></ol>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),
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

				self::makeSectionHtml(
					0,
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<div class="' . self::HATNOTE_CLASSNAME . '">hatnote</div>' .
					'<table class="ambox"><tr><td>ambox</td></tr></table>' .
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 1</td></tr></table>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox 2</td></tr></table>' .
					'<p>paragraph 2</p><ul><li>item</li></ul>'
				) .
				self::makeSectionHeading( 'h2', 'Heading 1' ) .
				self::makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),
			],

			[
				// Minimal test case for T149561: `p` elements should be immediate
				// descendants of the section container element (`div`, currently).

				'<table class="' . self::INFOBOX_CLASSNAME . '">' .
				'<tr><td><p>SURPRISE PARAGRAPH</p></td></tr></table>' .
				'<p>paragraph 1</p>',

				self::makeSectionHtml(
					0,
					'<p>paragraph 1</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '">' .
					'<tr><td><p>SURPRISE PARAGRAPH</p></td></tr></table>'
				),
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

				self::makeSectionHtml(
					0,
					'<div><table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table></div>' .
					'<p>paragraph 1</p>'
				),
			],

			// Remove non-mobile elements
			[
				'<div class="nomobile some-other-class">Foo</div><div class="not-nomobile">Bar</div>' .
					'<div class="not-navbox">Foo</div><div class="navbox">Foo</div>',
				self::makeSectionHtml(
					0, '<div class="not-nomobile">Bar</div><div class="not-navbox">Foo</div>'
				)
			]
		];
	}

	public static function buildTransforms(
		$title,
		bool $lazyLoadSkipSmallImages = false,
		$topHeadingTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
		bool $shouldLazyTransformImages = true,
		bool $showFirstParagraphBeforeInfobox = true
	) {
		// Sectionify the content and transform it if necessary per section

		$transforms = [];

		// List some selectors for example
		$transforms[] = new RemovableClassesTransform( [ '.nomobile', '.navbox' ] );

		$transforms[] = new MakeSectionsTransform( $topHeadingTags, true );

		if ( $shouldLazyTransformImages ) {
			$transforms[] = new LazyImageTransform( $lazyLoadSkipSmallImages );
		}

		if ( $showFirstParagraphBeforeInfobox ) {
			$transforms[] = new MoveLeadParagraphTransform(
				$title,
				self::TITLE_REV_ID
			);
		}
		return $transforms;
	}

	/**
	 * @dataProvider provideSectionTransform
	 */
	public function testSectionTransform( array $topHeadingTags, $input, $expectedOutput ) {
		$title = Title::makeTitle( NS_MAIN, __METHOD__ );
		$formatter = new MobileFormatter( $input );

		$formatter->applyTransforms(
			self::buildTransforms( $title, false, $topHeadingTags )
		);

		$this->assertEquals( $expectedOutput, $formatter->getText() );
	}

	public static function provideSectionTransform() {
		return [

			// The first heading found is the highest ranked
			// subheading.
			[
				[ 'h1', 'h2', 'h3' ],
				'<h2>Bar</h2><h3>Qux</h3>',
				self::makeSectionHtml( 0, '' )
					. self::makeSectionHeading( 'h2', 'Bar' )
					. self::makeSectionHtml( 1, '<h3>Qux</h3>' ),
			],

			// Unenclosed text is appended to the expandable container.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>A',
				self::makeSectionHtml( 0, '' )
					. self::makeSectionHeading( 'h1', 'Foo' )
					. self::makeSectionHtml( 1, '<h2>Bar</h2>A' )
			],

			// Unencloded text that appears before the first
			// heading is appended to a container.
			// FIXME: This behaviour was included for backwards
			// compatibility but mightn't be necessary.
			[
				[ 'h1', 'h2' ],
				'A<h1>Foo</h1><h2>Bar</h2>',
				self::makeSectionHtml( 0, 'A' )
					. self::makeSectionHeading( 'h1', 'Foo' )
					. self::makeSectionHtml( 1, '<h2>Bar</h2>' ),
			],

			// Multiple headings are handled identically.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>Baz<h1>Qux</h1>Quux',
				self::makeSectionHtml( 0, '' )
					. self::makeSectionHeading( 'h1', 'Foo' )
					. self::makeSectionHtml( 1, '<h2>Bar</h2>Baz' )
					. self::makeSectionHeading( 'h1', 'Qux', 2 )
					. self::makeSectionHtml( 2, 'Quux' ),
			],
		];
	}

	/**
	 * @see https://phabricator.wikimedia.org/T137375
	 */
	public function testT137375() {
		$input = '<p>Hello, world!</p><h2>Section heading</h2><ol class="references"></ol>';
		$formatter = new MobileFormatter( $input );
		$formatter->applyTransforms( [] );
		// Success is not crashing when the input is not a DOMElement.
		$this->assertTrue( true );
	}

	/**
	 * @see https://phabricator.wikimedia.org/T149884
	 * @param string $input
	 * @dataProvider provideLoggingOfInfoboxesBeingWrappedInContainersWhenWrapped
	 */
	public function testLoggingOfInfoboxesBeingWrappedInContainersWhenWrapped( $input ) {
		$this->overrideConfigValue( 'MFLogWrappedInfoboxes', true );

		$formatter = new MobileFormatter( $input );

		$titleText = 'T149884';
		$title = Title::makeTitle( NS_MAIN, $titleText );
		$loggerMock = $this->createMock( \Psr\Log\LoggerInterface::class );
		$loggerMock->expects( $this->once() )
			->method( 'info' )
			->willReturnCallback( function ( $message ) use ( $titleText ) {
				// Debug message contains Page title
				$this->assertStringContainsString( $titleText, $message );
				// and contains revision id
				$this->assertStringContainsString( self::TITLE_REV_ID, $message );
			} );
		$this->setLogger( 'mobile', $loggerMock );

		$formatter->applyTransforms( self::buildTransforms( $title ) );
	}

	public static function provideLoggingOfInfoboxesBeingWrappedInContainersWhenWrapped() {
		$box = self::buildInfoboxHTML( 'infobox' );
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
	 * @dataProvider provideLoggingOfInfoboxesBeingWrappedInContainersWhenNotWrapped
	 */
	public function testLoggingOfInfoboxesBeingWrappedInContainersWhenNotWrapped( $input ) {
		$this->overrideConfigValue( 'MFLogWrappedInfoboxes', true );

		$formatter = new MobileFormatter( $input );

		$loggerMock = $this->createMock( \Psr\Log\LoggerInterface::class );
		$loggerMock->expects( $this->never() )
			->method( 'info' );
		$this->setLogger( 'mobile', $loggerMock );

		$title = Title::makeTitle( NS_MAIN, 'T149884' );
		$formatter->applyTransforms( self::buildTransforms( $title ) );
	}

	public static function provideLoggingOfInfoboxesBeingWrappedInContainersWhenNotWrapped() {
		$box = self::buildInfoboxHTML( 'infobox' );
		return [
			// no wrapping
			[ $box ],
			// Although the box is wrapped, it comes over the first paragraph so isn't a problem (T196767)
			[ "<p>First para</p><div>$box</div>" ],
			// Although the box is wrapped, it comes over the first paragraph so isn't a problem (T196767)
			[ "<p>First para</p><div><div><div>$box</div></div></div>" ],
			// if wrapped inside mw-stack no logging occurs
			[ "<div class=\"mw-stack\">$box</div>" ],
			// if wrapped inside navbox, which should be removed before this transform (T185040)
			[ "<div class=\"navbox\">$box</div>" ],
		];
	}

	/**
	 * @see https://phabricator.wikimedia.org/T163805
	 */
	public function testLoggingOfInfoboxesSkipsInfoBoxInsideInfobox() {
		$this->overrideConfigValue( 'MFLogWrappedInfoboxes', true );

		// wrapped inside different infobox
		$input = self::buildInfoboxHTML( self::buildInfoboxHTML( 'test' ) );
		$formatter = new MobileFormatter( $input );

		$loggerMock = $this->createMock( \Psr\Log\LoggerInterface::class );
		$loggerMock->expects( $this->never() )
			->method( 'info' );
		$this->setLogger( 'mobile', $loggerMock );

		$title = Title::makeTitle( NS_MAIN, 'T163805' );
		$formatter->applyTransforms( self::buildTransforms( $title ) );
	}

	/**
	 * Helper function to create an infobox with given content
	 *
	 * @param string $content
	 * @return string built HTML
	 */
	private static function buildInfoboxHTML( $content ) {
		return "<table class=\"" . self::INFOBOX_CLASSNAME . "\"><tr><td>" .
			$content . "</td></tr></table>";
	}
}
