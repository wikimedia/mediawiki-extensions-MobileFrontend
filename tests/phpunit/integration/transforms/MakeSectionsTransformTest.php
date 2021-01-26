<?php

use MobileFrontend\Transforms\MakeSectionsTransform;

/**
 * @coversDefaultClass MobileFrontend\Transforms\MakeSectionsTransform
 *
 * @group MobileFrontend
 */
class MakeSectionsTransformTest extends MediaWikiTestCase {
	private const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator '
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
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( self::wrap( $expected ), $doc->saveHTML(), $reason );
		libxml_clear_errors();
	}

	public function provideTransform() {
		// Test section:
		// Test common based functionality

		yield [
			'',
			true,
			$this->makeSectionHtml( 0, '', false, false ),
			'First section should be added if no content provided'
		];

		yield [
			'<div>Body</div><h2>SHeading</h2><div>SBody</div>',
			true,
			$this->makeSectionHtml( 0, '<div>Body</div>', false, false )
			. $this->makeSectionHeading( 'h2', 'SHeading', 1 )
			. $this->makeSectionHtml( 1, '<div>SBody</div>', false, true ),
			'Process heading, section and section body'
		];

		yield [
			'<div>Body</div><h2>SHeading</h2><div>SBody</div>',
			false,
			$this->makeSectionHtml( 0, '<div>Body</div>', false, false )
			. $this->makeSectionHeading( 'h2', 'SHeading', false )
			. $this->makeSectionHtml( 1, '<div>SBody</div>', false, false ),
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
	private function makeSectionHeading( $heading, $innerHtml, $sectionNumber = 1 ) {
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

	/**
	 * @covers ::interimTogglingSupport
	 */
	public function testInterimTogglingSupport() {
		$nonce = RequestContext::getMain()->getOutput()->getCSP()->getNonce();
		$js = MakeSectionsTransform::interimTogglingSupport( $nonce );

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
