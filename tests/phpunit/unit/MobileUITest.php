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
	 * @see MobileUI::buttonClass() for params doc
	 * @covers ::semanticClass
	 * @covers ::buttonClass
	 * @dataProvider buttonClassDataProvider
	 */
	public function testButtonClass( $modifier, $additionalClassNames, $expected ) {
		$actual = MobileUI::buttonClass( $modifier, $additionalClassNames );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * @see MobileUI::anchorClass() for params doc
	 * @covers ::semanticClass
	 * @covers ::anchorClass
	 * @dataProvider anchorClassDataProvider
	 */
	public function testAnchorClass( $modifier, $additionalClassNames, $expected ) {
		$actual = MobileUI::anchorClass( $modifier, $additionalClassNames );

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
	public function iconClassDataProvider() {
		return [
			[
				'testicon', 'element', 'additionalclassnames',
				'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-testicon additionalclassnames'
			],
			[
				'testicon', 'element', '',
				'mw-ui-icon mw-ui-icon-element mw-ui-icon-mf-testicon '
			],
			[
				null, 'element', 'additionalclassnames',
				'mw-ui-icon mw-ui-icon-element additionalclassnames'
			],
			[
				null, 'element', '',
				'mw-ui-icon mw-ui-icon-element '
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

	/**
	 * Data provider for testing Mobile::buttonClass().
	 * @return array
	 */
	public function buttonClassDataProvider() {
		return [
			[
				'progressive', 'additionalclassnames',
				'mw-ui-button mw-ui-progressive additionalclassnames'
			],
			[
				null, 'additionalclassnames',
				'mw-ui-button  additionalclassnames'
			],
			[
				'destructive', 'additionalclassnames',
				'mw-ui-button mw-ui-destructive additionalclassnames'
			],
			[
				'progressive', '',
				'mw-ui-button mw-ui-progressive '
			],
			[
				'destructive', '',
				'mw-ui-button mw-ui-destructive '
			],
			[
				null, '',
				'mw-ui-button  '
			]
		];
	}

	/**
	 * Data provider for testing Mobile::anchorClass().
	 * @return array
	 */
	public function anchorClassDataProvider() {
		return [
			[
				'progressive', 'additionalclassnames',
				'mw-ui-anchor mw-ui-progressive additionalclassnames'
			],
			[
				null, 'additionalclassnames',
				'mw-ui-anchor  additionalclassnames'
			],
			[
				'destructive', 'additionalclassnames',
				'mw-ui-anchor mw-ui-destructive additionalclassnames'
			],
			[
				'progressive', '',
				'mw-ui-anchor mw-ui-progressive '
			],
			[
				'destructive', '',
				'mw-ui-anchor mw-ui-destructive '
			],
			[
				null, '',
				'mw-ui-anchor  '
			]
		];
	}

}
