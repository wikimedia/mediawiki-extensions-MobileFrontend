<?php

/**
 * @group MobileFrontend
 */
class MobileFormatterTest extends MediaWikiTestCase {
	const TOC = '<div id="toc" class="toc-mobile"><h2>Contents</h2></div>';
	const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator"></div>';
	const HATNOTE_CLASSNAME = 'hatnote';
	const INFOBOX_CLASSNAME = 'infobox';

	/**
	 * Helper function that creates section headings from a heading and title
	 *
	 * @param string $heading
	 * @param string $title
	 * @return string
	 */
	private function makeSectionHeading( $heading, $title ) {
		return "<$heading class=\"section-heading\">" . self::SECTION_INDICATOR .
			"$title</$heading>";
	}

	/**
	 * Helper function that creates sections from section number and content HTML.
	 *
	 * @param string $sectionNumber
	 * @param string $contentHtml
	 * @return string
	 */
	private function makeSectionHtml( $sectionNumber, $contentHtml='' ) {
		return "<div class=\"mf-section-$sectionNumber\">$contentHtml</div>";
	}

	/**
	 * @dataProvider provideHtmlTransform
	 *
	 * @param $input
	 * @param $expected
	 * @param callable|bool $callback
	 * @param bool $removeDefaults
	 * @param bool $lazyLoadReferences
	 * @param bool $lazyLoadImages
	 * @param bool $showFirstParagraphBeforeInfobox
	 * @covers MobileFormatter::filterContent
	 * @covers MobileFormatter::doRewriteReferencesForLazyLoading
	 * @covers MobileFormatter::doRemoveImages
	 */
	public function testHtmlTransform( $input, $expected, $callback = false,
		$removeDefaults = false, $lazyLoadReferences = false, $lazyLoadImages = false,
		$showFirstParagraphBeforeInfobox = false
	) {
		$t = Title::newFromText( 'Mobile' );
		$input = str_replace( "\r", '', $input ); // "yay" to Windows!
		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $input ), $t );
		if ( $callback ) {
			$callback( $mf );
		}
		$mf->topHeadingTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
		$mf->filterContent( $removeDefaults, $lazyLoadReferences, $lazyLoadImages,
			$showFirstParagraphBeforeInfobox );
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
		$citeUrl = SpecialPage::getTitleFor( 'MobileCite', '0' )->getLocalUrl();
		$imageStyles = '<img src="math.jpg" style="vertical-align: -3.505ex; '
			. 'width: 24.412ex; height:7.343ex; background:none;">';
		$placeholderStyles = '<span class="lazy-image-placeholder" '
			. 'style="width: 24.412ex;height: 7.343ex;" '
			. 'data-src="math.jpg">'
			. ' '
			. '</span>';
		$noscriptStyles = '<noscript>' . $imageStyles . '</noscript>';
		$originalImage = '<img alt="foo" src="foo.jpg" width="100" '
			. 'height="100" srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">';
		$placeholder = '<span class="lazy-image-placeholder" '
			. 'style="width: 100px;height: 100px;" '
			. 'data-src="foo.jpg" data-alt="foo" data-width="100" data-height="100" '
			. 'data-srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">'
			. ' '
			. '</span>';
		$noscript = '<noscript><img alt="foo" src="foo.jpg" width="100" height="100"></noscript>';
		$refText = '<p>They saved the world with one single unit test'
			. '<sup class="reference"><a href="#cite-note-1">[1]</a></sup></p>';
		$expectedReftext = '<p>They saved the world with one single unit test'
			. '<sup class="reference"><a href="' . $citeUrl . '#cite-note-1">[1]</a></sup></p>';
		$refhtml = '<ol class="references"><li>link 1</li><li>link 2</li></ol>';
		$refplaceholder = Html::element( 'a',
			[
				'class' => 'mf-lazy-references-placeholder',
				'href' => $citeUrl,
			],
			wfMessage( 'mobile-frontend-references-list' )
		);
		$refSectionHtml = '<h2 class="section-heading">' . self::SECTION_INDICATOR
			. 'references</h2>'
			. '<div class="mf-section-1" data-is-reference-section="1">'
			. $refplaceholder . '</div>';

		return [
			// # Lazy loading images
			// Main page not impacted
			[
				'<div>a</div><h2>Today</h2>' . $originalImage . '<h2>Tomorrow</h2>Test.',
				'<div>a</div><h2>Today</h2>' . $originalImage . '<h2>Tomorrow</h2>Test.',
				$mainPage,
				false, false, true,
			],
			// Lead section images not impacted
			[
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
			],
			// Test lazy loading of images outside the lead section
			[
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
			],
			// Test lazy loading of images with style attributes
			[
				'<p>text</p><h2>heading 1</h2><p>text</p>' . $imageStyles
					. '<h2>heading 2</h2>abc',
				'<div class="mf-section-0"><p>text</p></div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'heading 1</h2>'
					. '<div class="mf-section-1"><p>text</p>'
					. $noscriptStyles
					. $placeholderStyles
					. '</div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'heading 2</h2><div class="mf-section-2">abc</div>',
				$enableSections,
				false, false, true,
			],
			// https://phabricator.wikimedia.org/T130025, last section filtered
			[
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
			],

			// # Lazy loading references
			[
				$refText
					. '<h2>references</h2>' . $refhtml,
				'<div class="mf-section-0">' . $expectedReftext . '</div>'
					. $refSectionHtml,
				$enableSections,
				false, true, false
			],

			// T135923: Note the whitespace immediately inside the `sup` element.
			[
				'<p>T135923 <sup class="reference">    <a href="#cite-note-1">[1]</a></sup></p>'
					. '<h2>references</h2>' . $refhtml,
				'<div class="mf-section-0">'
					. '<p>T135923 <sup class="reference">    <a href="' . $citeUrl
					. '#cite-note-1">[1]</a></sup></p></div>'
					. $refSectionHtml,
				$enableSections,
				false, true, false
			],
			// Empty reference class
			[
				'<p>T135923 <sup class="reference"></sup></p>'
					. '<h2>references</h2>' . $refhtml,
				'<div class="mf-section-0">'
					. '<p>T135923 <sup class="reference"></sup></p></div>'
					. $refSectionHtml,
				$enableSections,
				false, true, false
			],

			// # Removal of images
			[
				'<img src="/foo/bar.jpg" alt="Blah"/>',
				'<span class="mw-mf-image-replacement">[Blah]</span>',
				$removeImages,
			],
			[
				'<img alt="picture of kitty" src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">' .
				'[picture of kitty]</span>',
				$removeImages,
			],
			[
				'<img src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			],
			[
				'<img alt src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			],
			[
				'<img alt src="kitty.jpg">look at the cute kitty!' .
					'<img alt="picture of angry dog" src="dog.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>look at the cute kitty!' .
					'<span class="mw-mf-image-replacement">[picture of angry dog]</span>',
				$removeImages,
			],

			// # Section wrapping
			// \n</h2> in headers
			[
				'<h2><span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				'<div class="mf-section-0"></div>'
					. '<h2 class="section-heading">' . self::SECTION_INDICATOR
					. '<span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. '<div class="mf-section-1">' . $longLine . '</div>',
				$enableSections
			],
			// \n</h3> in headers
			[
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
			],
			// \n</h6> in headers
			[
				'<h6><span>h6</span></h6>'
					. $longLine,
				'<div class="mf-section-0"></div>'
					. '<h6 class="section-heading">' . self::SECTION_INDICATOR
				  . '<span>h6</span></h6>'
					. '<div class="mf-section-1">' . $longLine . '</div>',
				$enableSections
			],
			// Bug 36670
			[
				'<h2><span class="mw-headline" id="History"><span id="Overview"></span>'
					. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				'<div class="mf-section-0"></div><h2 class="section-heading">'
				. self::SECTION_INDICATOR
				. '<span class="mw-headline" id="History"><span id="Overview"></span>'
				. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
				. '<div class="mf-section-1">' . $longLine . '</div>',
				$enableSections
			],

			// # Main page transformations
			[
				'fooo
				<div id="mp-itn">bar</div>
				<div id="mf-custom" title="custom">blah</div>',
				'<div id="mainpage">' .
				'<h2>In the news</h2><div id="mp-itn">bar</div>'
					. '<h2>custom</h2><div id="mf-custom">blah</div><br clear="all"></div>',
				$mainPage,
			],
			[
				'<div id="foo">test</div>',
				'<div id="foo">test</div>',
				$mainPage,
			],
			[
				'<div id="mf-foo" title="A &amp; B">test</div>',
				'<div id="mainpage">' .
				'<h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all"></div>',
				$mainPage,
			],
			[
				'<div id="foo">test</div><div id="central-auth-images">images</div>',
				'<div id="foo">test' .
				'</div><div id="central-auth-images">images</div>',
				$mainPage,
			],
			[
				'<div id="mf-foo" title="A &amp; B">test</div><div id="central-auth-images">images</div>',
				'<div id="mainpage">' .
				'<h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all">'
					. '<div id="central-auth-images">images</div></div>',
				$mainPage,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
			],
			[
				// first paragraph (which has coordinates and is hidden on mobile),
				// infobox, lead section
				'<p><span><span id="coordinates">Coordinates</span></span></p>'.
				'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>' .
				'<p>paragraph 2</p>',

				$this->makeSectionHtml(
					0,
					'<p><span><span id="coordinates">Coordinates</span></span></p>'.
					'<p>paragraph 2</p>' .
					'<table class="' . self::INFOBOX_CLASSNAME . '"><tr><td>infobox</td></tr></table>'
				),

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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

				$enableSections, false, false, false, true,
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
					'<p>paragraph 2</p>'
				) .
				$this->makeSectionHeading( 'h2', 'Heading 1' ) .
				$this->makeSectionHtml(
					1,
					'<p>paragraph 3</p>'
				),

				$enableSections, false, false, false, true,
			],
		];
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
		return [

			// The "in-block" class is added to a subheading.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
				  . 'Foo</h1>'
					. '<div class="mf-section-1"><h2 class="in-block">Bar</h2></div>',
			],

			// The "in-block" class is added to a subheading
			// without overwriting the existing attribute.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2 class="baz">Bar</h2>',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="baz in-block">Bar</h2></div>',
			],

			// The "in-block" class is added to all subheadings.
			[
				[ 'h1', 'h2', 'h3' ],
				'<h1>Foo</h1><h2>Bar</h2><h3>Qux</h3>',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2><h3 class="in-block">Qux</h3></div>',
			],

			// The first heading found is the highest ranked
			// subheading.
			[
				[ 'h1', 'h2', 'h3' ],
				'<h2>Bar</h2><h3>Qux</h3>',
				'<div class="mf-section-0"></div><h2 class="section-heading">' . self::SECTION_INDICATOR
					. 'Bar</h2><div class="mf-section-1">'
					. '<h3 class="in-block">Qux</h3></div>',
			],

			// Unenclosed text is appended to the expandable container.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>A',
				'<div class="mf-section-0"></div><h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2>A</div>',
			],

			// Unencloded text that appears before the first
			// heading is appended to a container.
			// FIXME: This behaviour was included for backwards
			// compatibility but mightn't be necessary.
			[
				[ 'h1', 'h2' ],
				'A<h1>Foo</h1><h2>Bar</h2>',
				'<div class="mf-section-0"><p>A</p></div>'
					. '<h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2></div>',
			],

			// Multiple headings are handled identically.
			[
				[ 'h1', 'h2' ],
				'<h1>Foo</h1><h2>Bar</h2>Baz<h1>Qux</h1>Quux',
				'<div class="mf-section-0"></div>'
					. '<h1 class="section-heading">' . self::SECTION_INDICATOR
					.'Foo</h1><div class="mf-section-1">'
					. '<h2 class="in-block">Bar</h2>Baz</div>'
					. '<h1 class="section-heading">' . self::SECTION_INDICATOR
					. 'Qux</h1><div class="mf-section-2">Quux</div>',
			],
		];
	}

	/**
	 * @dataProvider provideGetImageDimensions
	 *
	 * @param array $expected what we expect the dimensions to be.
	 * @param string $w value of width attribute (if any)
	 * @param stirng $h value of height attribute (if any)
	 * @param string $style value of style attribute (if any)
	 * @covers MobileFormatter::getImageDimensions
	 */
	public function testGetImageDimensions( $expected, $w, $h, $style ) {
		$mf = new MobileFormatter( '', Title::newFromText( 'Mobile' ) );
		$doc = new DOMDocument();
		$img = $doc->createElement( 'img' );
		if ( $style ) {
			$img->setAttribute( 'style', $style );
		}
		if ( $w ) {
			$img->setAttribute( 'width', $w );
		}
		if ( $h ) {
			$img->setAttribute( 'height', $h );
		}
		$this->assertEquals( $expected, $mf->getImageDimensions( $img ) );
	}

	public function provideGetImageDimensions() {
		return [
			[
				[ 'width' => '500px', 'height' => '500px' ],
				'500',
				'500',
				''
			],
			[
				[ 'width' => '200px', 'height' => 'auto' ],
				'500',
				'500',
				'width: 200px; height: auto;'
			],
			[
				[ 'width' => '24.412ex', 'height' => '7.343ex' ],
				'500',
				'500',
				'width: 24.412ex; height: 7.343ex'
			],
			[
				[ 'width' => '24.412ex', 'height' => '7.343ex' ],
				'500',
				'500',
				'height: 7.343ex; width: 24.412ex'
			],
			[
				[ 'width' => '24.412ex', 'height' => '7.343ex' ],
				'500',
				'500',
				'height: 7.343ex; background-image: url(foo.jpg); width:    24.412ex   ; '
					. 'font-family: "Comic Sans";'
			],

			// <img src="..." alt="..." />
			[
				[],
				'',
				'',
				''
			]
		];
	}

	/**
	 * @covers MobileFormatter::insertTOCPlaceholder
	 */
	public function testInsertTOCPlaceholder() {
		$input = '<p>Hello world.</p><h2>Heading</h2>Text.';
		$mf = new MobileFormatter( $input, Title::newFromText( 'Mobile' ) );
		$mf->enableTOCPlaceholder();
		$mf->enableExpandableSections();
		$mf->topHeadingTags = [ 'h2' ];
		$mf->filterContent( false, false, false );
		$expected = '<div class="mf-section-0"><p>Hello world.</p>'
			. self::TOC . '</div><h2 class="section-heading">'
			. self::SECTION_INDICATOR . 'Heading</h2><div class="mf-section-1">Text.</div>';
		$this->assertEquals( $expected, $mf->getText() );
	}

	/**
	 * @see https://phabricator.wikimedia.org/T137375
	 */
	public function testT137375() {
		$input = '<p>Hello, world!</p><h2>Section heading</h2><ol class="references"></ol>';
		$formatter = new MobileFormatter( $input, Title::newFromText( 'Special:Foo' ) );
		$formatter->filterContent( false, true, false );
	}
}
