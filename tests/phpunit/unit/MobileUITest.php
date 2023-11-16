<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileUI
 */
class MobileUITest extends \MediaWikiUnitTestCase {
	/**
	 * @see MobileUI::icon for params doc
	 * @covers ::icon
	 * @dataProvider iconDataProvider
	 */
	public function testIcon(
		$iconName, $additionalClassNames, $expected
	) {
		$actual = MobileUI::icon( $iconName, $additionalClassNames );

		$this->assertSame( '<span class="' . $expected . '"></span>', $actual );
	}

	/**
	 * Data provider for testing MobileUI::icon().
	 * Format (e.g.);
	 * [
	 *     'testicon', 'additionalclassnames', // expected
	 *     '<icon classes> additionalclassnames'  // actual
	 * ]
	 * @return array
	 */
	public static function iconDataProvider() {
		return [
			[
				'testicon',
				'additionalclassnames',
				'mw-mf-icon mf-icon-testicon additionalclassnames'
			],
			[
				'testicon',
				'',
				'mw-mf-icon mf-icon-testicon'
			]
		];
	}
}
