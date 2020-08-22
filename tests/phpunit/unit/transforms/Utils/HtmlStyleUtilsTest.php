<?php

use MobileFrontend\Transforms\Utils\HtmlStyleUtils;

/**
 * @coversDefaultClass MobileFrontend\Transforms\Utils\HtmlStyleUtils
 * @group MobileFrontend
 */
class HtmlStyleUtilsTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers ::parseStyleString
	 * @dataProvider parseStyleStringProvider
	 */
	public function testParseStyleString( string $style, array $expected ) {
		$this->assertEquals( $expected,  HtmlStyleUtils::parseStyleString( $style ) );
	}

	public function parseStyleStringProvider() {
		yield 'empty string should produce empty array' => [
			'',
			[]
		];
		yield 'whitespaced string should produce empty array' => [
			'   ',
			[]
		];
		yield 'bad formed string should work' => [
			' style1: 1234  ; style3 : 100cs; padding: 10 20 100% 02 ; enabled   ',
			[
				'style1' => '1234',
				'style3' => '100cs',
				'padding' => '10 20 100% 02',
				'enabled' => ''
			]
		];
		yield 'boolean style should be processed' => [
			'enabled',
			[
				'enabled' => ''
			]
		];
		yield 'duplication style should be deduped' => [
			'style: value1; style: value2',
			[
				'style' => 'value2'
			]
		];
	}

	/**
	 * @covers ::formStyleString
	 * @dataProvider formStyleStringProvider
	 */
	public function testFormStyleString( array $styles, string $expected ) {
		$this->assertEquals( $expected, HtmlStyleUtils::formStyleString( $styles ) );
	}

	public function formStyleStringProvider() {
		yield 'Empty array should return empty string' => [
			[],
			''
		];
		yield 'Common case' => [
			[
				'style1' => '1234',
				'style3' => '100cs',
				'padding' => '10 20 100% 02',
				'enabled' => ''
			],
			'style1: 1234;style3: 100cs;padding: 10 20 100% 02;enabled;'
		];
	}

	/**
	 * @covers ::filterAllowedStyles
	 * @dataProvider filterAllowedStylesProvider
	 */
	public function testFilterAllowedStyles(
		array $styles,
		array $allowedStyles,
		array $additional,
		array $expected
	) {
		$this->assertEquals(
			$expected,
			HtmlStyleUtils::filterAllowedStyles(
				$styles,
				$allowedStyles,
				$additional
			)
		);
	}

	public function filterAllowedStylesProvider() {
		yield [
			[ 'style1' => '', 'style2' => '10px' ],
			[ 'style2' , 'style1' ],
			[],
			[ 'style1' => '', 'style2' => '10px' ],
		];
		yield [
			[ 'style1' => '', 'style2' => '10px' ],
			[ 'style2' ],
			[],
			[ 'style2' => '10px' ],
		];
		yield [
			[ 'style1' => '', 'style2' => '10px' ],
			[ 'style2' ],
			[ 'style1' => '5px' ],
			[ 'style1' => '5px', 'style2' => '10px' ],
		];
	}
}
