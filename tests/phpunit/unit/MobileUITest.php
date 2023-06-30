<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileUI
 */
class MobileUITest extends \MediaWikiUnitTestCase {
	/**
	 * @see MobileUI::iconClass() for params doc
	 * @covers ::iconClass
	 * @dataProvider iconClassDataProvider
	 */
	public function testIconClass(
		$iconName, $iconType, $additionalClassNames, $expected
	) {
		$actual = MobileUI::iconClass( $iconName, $iconType, $additionalClassNames );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * Data provider for testing MobileUI::iconClass().
	 * Format (e.g.);
	 * [
	 *     'testicon', 'element', 'additionalclassnames', // expected
	 *     'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-testicon additionalclassnames'  // actual
	 * ]
	 * @return array
	 */
	public static function iconClassDataProvider() {
		return [
			[
				'testicon', 'element', 'additionalclassnames',
				'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-testicon additionalclassnames mw-ui-button mw-ui-quiet'
			],
			[
				'testicon', 'element', '',
				'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-testicon  mw-ui-button mw-ui-quiet'
			],
			[
				null, 'element', 'additionalclassnames',
				'mw-ui-icon mw-ui-icon-element additionalclassnames mw-ui-button mw-ui-quiet'
			],
			[
				null, 'element', '',
				'mw-ui-icon mw-ui-icon-element  mw-ui-button mw-ui-quiet'
			],
			[
				'testicon', 'before', 'additionalclassnames',
				'mw-ui-icon mw-ui-icon-before mw-ui-icon-mf-testicon additionalclassnames'
			],
			[
				'testicon', 'before', '',
				'mw-ui-icon mw-ui-icon-before mw-ui-icon-mf-testicon '
			],
			[
				null, 'before', 'additionalclassnames',
				'mw-ui-icon mw-ui-icon-before additionalclassnames'
			],
			[
				null, 'before', '',
				'mw-ui-icon mw-ui-icon-before '
			]
		];
	}
}
