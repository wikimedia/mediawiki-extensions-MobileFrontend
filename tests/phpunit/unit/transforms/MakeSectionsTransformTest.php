<?php

use MobileFrontend\Transforms\MakeSectionsTransform;

/**
 * @coversDefaultClass MobileFrontend\Transforms\MakeSectionsTransform
 *
 * @group MobileFrontend
 */
class MakeSectionsTransformTest extends \MediaWikiUnitTestCase {
	const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator '
		. 'mw-ui-icon-small mw-ui-icon-flush-left"></div>';

	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @covers ::apply
	 * @covers ::makeSections
	 * @covers ::createSectionBodyElement
	 * @covers ::filterContentInSection
	 * @covers ::getTopHeadings
	 * @covers ::prepareHeading
	 * @covers ::__construct
	 *
	 * @dataProvider provideTransform
	 *
	 * @param string $html
	 * @param bool $showFirstParagraphBeforeInfobox
	 * @param bool $scriptsEnabled
	 * @param bool $shouldLazyTransformImages
	 * @param string $expected
	 * @param string $reason this is being asserted
	 */
	public function testTransform(
		string $html,
		bool $showFirstParagraphBeforeInfobox,
		bool $scriptsEnabled,
		bool $shouldLazyTransformImages,
		string $expected,
		string $reason
	) {
		$transform = new MakeSectionsTransform(
			[ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
			$showFirstParagraphBeforeInfobox,
			Title::makeTitle( 'A', NS_MAIN ),
			1,
			$scriptsEnabled,
			$shouldLazyTransformImages,
			false
		);
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();
		$wrapped = self::wrap( $html );
		$doc->loadHTML( $wrapped );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ), $reason );
		libxml_clear_errors();
	}

	public function provideTransform() {
		// Test section:
		// Test common based functionality
		$hatnote = '<div role="note" class="hatnote navigation-not-searchable">hatnote.</div>';
		$infobox = '<table class="infobox">1</table>';
		$wrappedCoordsWithTrailingWhitespace = '<p><span><span id="coordinates">not empty</span>'
		  . '</span>    </p>';
		$emptypelt = '<p class="mw-empty-elt"></p>';

		yield [
			'',
			true,
			true,
			true,
			$this->makeSectionHtml( 0, '', false, false ),
			'First section should be added if no content provided'
		];

		yield [
			"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace$infobox<p>one</p>",
			true,
			true,
			true,
			$this->makeSectionHtml(
				0,
				"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace<p>one</p>$infobox",
				false,
				false
			),
			'Infobox should be placed after fist section'
		];
		yield [
			"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace$infobox<p>one</p>",
			false,
			true,
			true,
			$this->makeSectionHtml(
				0,
				"$hatnote$hatnote$emptypelt $wrappedCoordsWithTrailingWhitespace$infobox<p>one</p>",
				false,
				false
			),
			'Infobox shouldn`t be changed'
		];

		yield [
			'<div>Body</div><h2>SHeading</h2><div>SBody</div>',
			true,
			true,
			true,
			$this->makeSectionHtml( 0, '<div>Body</div>', false, false )
			. $this->makeSectionHeading( 'h2', 'SHeading', 1 )
			. $this->makeSectionHtml( 1, '<div>SBody</div>', false, true ),
			'Process heading, section and section body'
		];

		yield [
			'<div>Body</div><h2>SHeading</h2><div>SBody</div>',
			true,
			false,
			true,
			$this->makeSectionHtml( 0, '<div>Body</div>', false, false )
			. $this->makeSectionHeading( 'h2', 'SHeading', false )
			. $this->makeSectionHtml( 1, '<div>SBody</div>', false, false ),
			'No script shouldn`t use collapsible blocks '
		];

		// Test section:
		// Test lazy load images functionality
		$originalImage = '<img alt="foo" src="foo.jpg" width="100" '
			. 'height="100" srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">';
		$placeholder = '<span class="lazy-image-placeholder" '
			. 'style="width: 100px;height: 100px;" '
			. 'data-src="foo.jpg" data-alt="foo" data-width="100" data-height="100" '
			. 'data-srcset="foo-1.5x.jpg 1.5x, foo-2x.jpg 2x">'
			. '&nbsp;'
			. '</span>';
		$noscript = '<noscript><img alt="foo" src="foo.jpg" width="100" height="100"></noscript>';
		yield [
			'<div>Body</div><h2>SHeading</h2><div>' . $originalImage . '</div>',
			true,
			true,
			true,
			$this->makeSectionHtml( 0, '<div>Body</div>', false, false )
			. $this->makeSectionHeading( 'h2', 'SHeading', 1 )
			. $this->makeSectionHtml( 1, '<div>' . $noscript . $placeholder . '</div>', false, true ),
			'Image should be replaced in second section'
		];
		yield [
			'<div>Body</div><h2>SHeading</h2><div>' . $originalImage . '</div>',
			true,
			true,
			false,
			$this->makeSectionHtml( 0, '<div>Body</div>', false, false )
			. $this->makeSectionHeading( 'h2', 'SHeading', 1 )
			. $this->makeSectionHtml( 1, '<div>' . $originalImage . '</div>', false, true ),
			'Image should be replaced in second section'
		];
	}

	/**
	 * Helper function that creates section headings from a heading and title
	 *
	 * @param string $heading
	 * @param string $innerHtml of the heading element
	 * @param int|bool $sectionNumber heading corresponds to or false if noscript
	 * @return string
	 */
	private function makeSectionHeading( $heading, $innerHtml, $sectionNumber = 1 ) {
		return "<$heading class=\"section-heading\""
			. ( $sectionNumber === false ? '' : " onclick=\"javascript:mfTempOpenSection($sectionNumber)\"" )
			. ">"
			. self::SECTION_INDICATOR
			. "$innerHtml</$heading>";
	}

	/**
	 * Helper function that creates sections from section number and content HTML.
	 *
	 * @param string $sectionNumber
	 * @param string $contentHtml
	 * @param bool $isReferenceSection whether the section contains references
	 * @param bool $isCollapsible whether the section contains references
	 * @return string
	 */
	private function makeSectionHtml(
		$sectionNumber,
		$contentHtml,
		$isReferenceSection,
		$isCollapsible
	) {
		$attrs = $isReferenceSection ? ' data-is-reference-section="1"' : '';
		$className = "mf-section-$sectionNumber";

		if ( $isCollapsible ) {
			$className .= ' ' . MobileFormatter::STYLE_COLLAPSIBLE_SECTION_CLASS;
		}

		return "<section class=\"$className\" id=\"mf-section-$sectionNumber\""
			. "$attrs>$contentHtml</section>";
	}
}
