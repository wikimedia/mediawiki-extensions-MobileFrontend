<?php

use MobileFrontend\Transforms\MakeSectionsTransform;
use Wikimedia\Parsoid\Utils\DOMCompat;

/**
 * @coversDefaultClass MobileFrontend\Transforms\MakeSectionsTransform
 *
 * @group MobileFrontend
 */
class MakeSectionsTransformTest extends MediaWikiIntegrationTestCase {
	private const SECTION_INDICATOR = '<span class="indicator mf-icon mf-icon-expand mf-icon--small"></span>';

	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @covers ::apply
	 * @covers ::makeSections
	 * @covers ::createSectionBodyElement
	 * @covers ::getTopHeadings
	 * @covers ::prepareHeading
	 * @covers ::__construct
	 *
	 * @dataProvider provideTransform
	 *
	 * @param string $html
	 * @param bool $scriptsEnabled
	 * @param string $expected
	 * @param string $reason this is being asserted
	 */
	public function testTransform(
		string $html,
		bool $scriptsEnabled,
		string $expected,
		string $reason
	) {
		$transform = new MakeSectionsTransform(
			[ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
			$scriptsEnabled
		);
		libxml_use_internal_errors( true );
		$doc = new DOMDocument();
		$wrapped = self::wrap( $html );
		$doc->loadHTML( $wrapped );
		$transform->apply( DOMCompat::querySelector( $doc, 'body' ) );
		$this->assertEquals( self::wrap( $expected ), $doc->saveHTML(), $reason );
		libxml_clear_errors();
	}

	public static function provideTransform() {
		// Test section:
		// Test common based functionality

		yield [
			'',
			true,
			self::makeSectionHtml( 0, '', false ),
			'First section should be added if no content provided'
		];

		yield [
			'<div>Body</div><h2>SHeading</h2><div>SBody</div>',
			true,
			self::makeSectionHtml( 0, '<div>Body</div>', false )
			. self::makeSectionHeading( 'h2', 'SHeading', 1 )
			. self::makeSectionHtml( 1, '<div>SBody</div>', true ),
			'Process heading, section and section body'
		];

		yield [
			'<div>Body</div><h2>SHeading</h2><div>SBody</div>',
			false,
			self::makeSectionHtml( 0, '<div>Body</div>', false )
			. self::makeSectionHeading( 'h2', 'SHeading', false )
			. self::makeSectionHtml( 1, '<div>SBody</div>', false ),
			'No script shouldn`t use collapsible blocks '
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
	private static function makeSectionHeading( $heading, $innerHtml, $sectionNumber = 1 ) {
		return "<$heading class=\"section-heading\""
			. ( $sectionNumber === false ? '' : " onclick=\"mfTempOpenSection($sectionNumber)\"" )
			. ">"
			. self::SECTION_INDICATOR
			. "$innerHtml</$heading>";
	}

	/**
	 * Helper function that creates sections from section number and content HTML.
	 *
	 * @param string $sectionNumber
	 * @param string $contentHtml
	 * @param bool $isCollapsible whether the section is collapsible
	 * @return string
	 */
	private static function makeSectionHtml(
		$sectionNumber,
		$contentHtml,
		$isCollapsible
	) {
		$className = "mf-section-$sectionNumber";

		if ( $isCollapsible ) {
			$className .= ' ' . MobileFormatter::STYLE_COLLAPSIBLE_SECTION_CLASS;
		}

		return "<section class=\"$className\" id=\"mf-section-$sectionNumber\""
			. ">$contentHtml</section>";
	}

	/**
	 * @covers ::interimTogglingSupport
	 */
	public function testInterimTogglingSupport() {
		$js = MakeSectionsTransform::interimTogglingSupport();

		$this->assertStringContainsString(
			'function mfTempOpenSection(',
			$js,
			'creates global function called from MobileFormatter::prepareHeading'
		);
		$this->assertStringContainsString(
			'mf-section-',
			$js,
			'uses (partial) ID set in MobileFormatter::createSectionBodyElement'
		);
		$this->assertStringContainsString(
			'open-block',
			$js,
			'contains class name to be toggled'
		);
	}
}
