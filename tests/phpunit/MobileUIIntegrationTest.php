<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileUI
 */
class MobileUIIntegrationTest extends MediaWikiIntegrationTestCase {
	/**
	 * @see MobileUI::contentElement() for params doc
	 * @covers ::contentElement
	 * @dataProvider contentElementDataProvider
	 */
	public function testContentElement( $html, $className, $expected ) {
		$actual = MobileUI::contentElement( $html, $className );

		// Strip off new-lines, tabs and/or carriage return from .mustache for proper comparison
		$actual = preg_replace( "/\t|\n|\r/", "", $actual );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * Data provider for testing Mobile::contentElement
	 * @return array
	 */
	public function contentElementDataProvider() {
		return [
			[
				'<span>Test html</span>', 'test',
				'<div class="content test"><span>Test html</span></div>'
			],
			[
				'<span>Test html</span>', '',
				'<div class="content "><span>Test html</span></div>'
			],
			[
				'', 'test',
				'<div class="content test"></div>'
			],
			[
				'', '',
				'<div class="content "></div>'
			]
		];
	}
}
