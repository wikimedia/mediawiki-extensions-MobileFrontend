<?php

use MobileFrontend\Transforms\Utils\HtmlClassUtils;

/**
 * @coversDefaultClass MobileFrontend\Transforms\Utils\HtmlClassUtils
 * @group MobileFrontend
 */
class HtmlClassUtilsTest extends \MediaWikiUnitTestCase {

	/**
	 * @dataProvider parseClassStringProvider
	 *
	 * @covers ::parseClassString
	 */
	public function testParseClassString( $classes, $expected ) {
		$this->assertEquals( [],  HtmlClassUtils::parseClassString( '    ' ) );
		$expected = [
			'class1' => true,
			'class2' => true,
		];
		$this->assertEquals( $expected,  HtmlClassUtils::parseClassString( ' class1   class2  ' ) );
	}

	public function parseClassStringProvider() {
		yield 'Empty string should return empty array' => [
			'',
			[]
		];

		yield 'Whitespaced string should return empty array' => [
			'     \t ',
			[]
		];

		yield 'Common case' => [
			'class1 class2',
			[
				'class1' => true,
				'class2' => true,
			]
		];

		yield ' Bad formed class string' => [
			'   class1   class2   ',
			[
				'class1' => true,
				'class2' => true,
			]
		];

		yield 'Duplicated classes should be deduped' => [
			'class1   class1',
			[
				'class1' => true,
			]
		];
	}

	/**
	 * @dataProvider formClassStringProvider
	 *
	 * @covers ::formClassString
	 */
	public function testFormClassString( array $classes, string $expected ) {
		$this->assertEquals( $expected,  HtmlClassUtils::formClassString( $classes ) );
	}

	public function formClassStringProvider() {
		yield [
			[
				'class1' => true,
				'class2' => true,
			],
			'class1 class2'
		];
		yield [
			[
				'class2' => true,
				'class1' => true,
			],
			'class2 class1'
		];
		yield [
			[
				'class1' => true,
				'class2' => false,
			],
			'class1'
		];
	}

	 /**
	  * @dataProvider filterAllowedClassesProvider
	  *
	  * @covers ::filterAllowedClasses
	  */
	public function testFilterAllowedClasses(
		 array $classes,
		 array $allowedClasses,
		 array $additional,
		 array $expected
 ) {
		$this->assertEquals(
			$expected,
			HtmlClassUtils::filterAllowedClasses(
				$classes,
				$allowedClasses,
				$additional
 )
 );
	}

	public function filterAllowedClassesProvider() {
		yield [
			[ 'class1' => true, 'class2' => false ],
			[ 'class2' , 'class1' ],
			[],
			[ 'class1' => true, 'class2' => false ],
		];
		yield [
			[ 'class1' => true, 'class2' => false ],
			[ 'class2' ],
			[],
			[ 'class2' => false ],
		];

		yield [
			[ 'class1' => true, 'class2' => false ],
			[ 'class1' ],
			[ 'class2' ],
			[ 'class1' => true, 'class2' => true ],
		];
	}
}
