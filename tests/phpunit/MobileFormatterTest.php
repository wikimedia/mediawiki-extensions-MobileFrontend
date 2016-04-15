<?php

/**
 * @group MobileFrontend
 */
class MobileFormatterTest extends MediaWikiTestCase {
	const TOC = '<div id="toc" class="toc-mobile"><h2>Contents</h2></div>';
	const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator"></div>';

	/**
	 * @dataProvider provideHtmlTransform
	 *
	 * @param $input
	 * @param $expected
	 * @param callable|bool $callback
	 * @covers MobileFormatter::filterContent
	 * @covers MobileFormatter::doRewriteReferencesForLazyLoading
	 * @covers MobileFormatter::doRemoveImages
	 */
	public function testHtmlTransform( $input, $expected, $callback = false,
		$removeDefaults = false, $lazyLoadReferences = false, $lazyLoadImages = false
	) {
		$t = Title::newFromText( 'Mobile' );
		$input = str_replace( "\r", '', $input ); // "yay" to Windows!
		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $input ), $t );
		if ( $callback ) {
			$callback( $mf );
		}
		$mf->topHeadingTags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
		$mf->filterContent( $removeDefaults, $lazyLoadReferences, $lazyLoadImages );
		$html = $mf->getText();
		$this->assertEquals( str_replace( "\n", '', $expected ), str_replace( "\n", '', $html ) );
	}

	public function provideHtmlTransform() {
		$enableSections = function ( MobileFormatter $mf ) {
			$mf->enableExpandableSections();
		};
		$longLine = "\n" . str_repeat( 'A', 5000 );
		$removeImages = function( MobileFormatter $f ) {
			$f->setRemoveMedia();
		};
		$mainPage = function( MobileFormatter $f ) {
			$f->setIsMainPage( true );
		};

		$originalImage = '<img alt="foo" src="foo.jpg" width="100" '
			. 'height="100" srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">';
		$placeholder = '<span class="lazy-image-placeholder" '
			. 'style="width: 100px;height: 100px;" '
			. 'data-src="foo.jpg" data-alt="foo" data-width="100" data-height="100" '
			. 'data-srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">'
			. '</span>';
		$noscript = '<noscript><img alt="foo" src="foo.jpg" width="100" height="100"></noscript>';

		return array(
			// # Lazy loading images
			// Lead section images not impacted
			array(
				'<p>' . $originalImage . '</p><h2>heading 1</h2><p>text</p>'
					. '<h2>heading 2</h2>abc',
				'<div class="mf-section-0"><p>' . $originalImage . '</p></div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'heading 1</h2>'
					. '<div class="mf-section-1"><p>text</p>'
					. '</div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'heading 2</h2><div class="mf-section-2">abc</div>',
				$enableSections,
				false, false, true,
			),
			// Test lazy loading of images outside the lead section
			array(
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $originalImage
					. '<h2>heading 2</h2>abc',
				'<div class="mf-section-0"><p>text</p></div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'heading 1</h2>'
					. '<div class="mf-section-1"><p>text</p>'
					. $noscript
					. $placeholder
					. '</div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'heading 2</h2><div class="mf-section-2">abc</div>',
				$enableSections,
				false, false, true,
			),
			// https://phabricator.wikimedia.org/T130025, last section filtered
			array(
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $originalImage
				.'<h2>heading 2</h2>' . $originalImage,
				'<div class="mf-section-0"><p>text</p></div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR . 'heading 1</h2>'
					. '<div class="mf-section-1"><p>text</p>'
					. $noscript
					. $placeholder
					. '</div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR . 'heading 2</h2>'
					. '<div class="mf-section-2">'
					. $noscript
					. $placeholder
					. '</div>',
				$enableSections,
				false, false, true,
			),

			// # Removal of images
			array(
				'<img src="/foo/bar.jpg" alt="Blah"/>',
				'<span class="mw-mf-image-replacement">[Blah]</span>',
				$removeImages,
			),
			array(
				'<img alt="picture of kitty" src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">' .
				'[picture of kitty]</span>',
				$removeImages,
			),
			array(
				'<img src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			),
			array(
				'<img alt src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			),
			array(
				'<img alt src="kitty.jpg">look at the cute kitty!' .
					'<img alt="picture of angry dog" src="dog.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>look at the cute kitty!' .
					'<span class="mw-mf-image-replacement">[picture of angry dog]</span>',
				$removeImages,
			),

			// # Section wrapping
			// \n</h2> in headers
			array(
				'<h2><span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				'<div class="mf-section-0"></div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. '<span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. '<div class="mf-section-1">' . $longLine . '</div>',
				$enableSections
			),
			// \n</h3> in headers
			array(
				'<h3><span>h3</span></h3>'
					. $longLine
					. '<h4><span>h4</span></h4>'
					. 'h4 text.',
				'<div class="mf-section-0"></div>'
					. '<h3 class="section-heading">' . self::SECTION_INDICATOR
					 . '<span>h3</span></h3>'
					. '<div class="mf-section-1">'
					. $longLine
					. '<h4 class="in-block"><span>h4</span></h4>'
					. 'h4 text.'
					. '</div>',
				$enableSections
			),
			// \n</h6> in headers
			array(
				'<h6><span>h6</span></h6>'
					. $longLine,
				'<div class="mf-section-0"></div>'
					. '<h6 class="section-heading">' . self::SECTION_INDICATOR
				  . '<span>h6</span></h6>'
					. '<div class="mf-section-1">' . $longLine . '</div>',
				$enableSections
			),
			// Bug 36670
			array(
				'<h2><span class="mw-headline" id="History"><span id="Overview"></span>'
					. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				'<div class="mf-section-0"></div><h2 class="section-heading">'
				. self::SECTION_INDICATOR
				. '<span class="mw-headline" id="History"><span id="Overview"></span>'
				. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
				. '<div class="mf-section-1">' . $longLine . '</div>',
				$enableSections
			),

			// # Main page transformations
			array(
				'fooo
				<div id="mp-itn">bar</div>
				<div id="mf-custom" title="custom">blah</div>',
				'<div id="mainpage">' .
				'<h2>In the news</h2><div id="mp-itn">bar</div>'
					. '<h2>custom</h2><div id="mf-custom">blah</div><br clear="all"></div>',
				$mainPage,
			),
			array(
				'<div id="foo">test</div>',
				'<div id="foo">test</div>',
				$mainPage,
			),
			array(
				'<div id="mf-foo" title="A &amp; B">test</div>',
				'<div id="mainpage">' .
				'<h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all"></div>',
				$mainPage,
			),
			array(
				'<div id="foo">test</div><div id="central-auth-images">images</div>',
				'<div id="foo">test' .
				'</div><div id="central-auth-images">images</div>',
				$mainPage,
			),
			array(
				'<div id="mf-foo" title="A &amp; B">test</div><div id="central-auth-images">images</div>',
				'<div id="mainpage">' .
				'<h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all">'
					. '<div id="central-auth-images">images</div></div>',
				$mainPage,
			),
		);
	}

	/**
	 * @dataProvider provideHeadingTransform
	 * @covers MobileFormatter::makeSections
	 * @covers MobileFormatter::enableExpandableSections
	 * @covers MobileFormatter::setTopHeadingTags
	 * @covers MobileFormatter::filterContent
	 */
	public function testHeadingTransform( array $topHeadingTags, $input, $expectedOutput ) {
		$t = Title::newFromText( 'Mobile' );
		$formatter = new MobileFormatter( $input, $t );

		// If MobileFormatter#enableExpandableSections isn't called, then headings
		// won't be transformed.
		$formatter->enableExpandableSections( true );

		$formatter->topHeadingTags = $topHeadingTags;
		$formatter->filterContent();

		$this->assertEquals( $expectedOutput, $formatter->getText() );
	}

	public function provideHeadingTransform() {
		return array(

			// The "in-block" class is added to a subheading.
			array(
				array( 'h1', 'h2' ),
				'<h1>Foo</h1><h2>Bar</h2>',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
				  . 'Foo</h1>'
					. '<div class="mf-section-1"><h2 class="in-block">Bar</h2></div>',
			),

			// The "in-block" class is added to a subheading
			// without overwriting the existing attribute.
			array(
				array( 'h1', 'h2' ),
				'<h1>Foo</h1><h2 class="baz">Bar</h2>',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="baz in-block">Bar</h2></div>',
			),

			// The "in-block" class is added to all subheadings.
			array(
				array( 'h1', 'h2', 'h3' ),
				'<h1>Foo</h1><h2>Bar</h2><h3>Qux</h3>',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2><h3 class="in-block">Qux</h3></div>',
			),

			// The first heading found is the highest ranked
			// subheading.
			array(
				array( 'h1', 'h2', 'h3' ),
				'<h2>Bar</h2><h3>Qux</h3>',
				'<div class="mf-section-0"></div><h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'Bar</h2><div class="mf-section-1">'
					. '<h3 class="in-block">Qux</h3></div>',
			),

			// Unenclosed text is appended to the expandable container.
			array(
				array( 'h1', 'h2' ),
				'<h1>Foo</h1><h2>Bar</h2>A',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2>A</div>',
			),

			// Unencloded text that appears before the first
			// heading is appended to a container.
			// FIXME: This behaviour was included for backwards
			// compatibility but mightn't be necessary.
			array(
				array( 'h1', 'h2' ),
				'A<h1>Foo</h1><h2>Bar</h2>',
				'<div class="mf-section-0"><p>A</p></div>'
					. '<h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2></div>',
			),

			// Multiple headings are handled identically.
			array(
				array( 'h1', 'h2' ),
				'<h1>Foo</h1><h2>Bar</h2>Baz<h1>Qux</h1>Quux',
				'<div class="mf-section-0"></div>'
					. '<h1 class="section-heading">' . self::SECTION_INDICATOR
					.'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2>Baz</div>'
					. '<h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Qux</h1><div class="mf-section-2">Quux</div>',
			),
		);
	}

	/**
	 * @covers MobileFormatter::insertTOCPlaceholder
	 */
	public function testInsertTOCPlaceholder() {
		$input = '<p>Hello world.</p><h2>Heading</h2>Text.';
		$mf = new MobileFormatter( $input, Title::newFromText( 'Mobile' ) );
		$mf->enableTOCPlaceholder();
		$mf->enableExpandableSections();
		$mf->topHeadingTags = array( 'h2' );
		$mf->filterContent( false, false, false );
		$expected = '<div class="mf-section-0"><p>Hello world.</p>'
			. self::TOC . '</div><h2 class="section-heading">'
			. self::SECTION_INDICATOR . 'Heading</h2><div class="mf-section-1">Text.</div>';
		$this->assertEquals( $expected, $mf->getText() );
	}
}
