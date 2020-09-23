<?php

use MobileFrontend\Transforms\SubHeadingTransform;

/**
 * @coversDefaultClass MobileFrontend\Transforms\SubHeadingTransform
 * @group MobileFrontend
 */
class SubHeadingTransformTest extends \MediaWikiUnitTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @dataProvider provideTransform
	 *
	 * @covers ::apply
	 * @covers ::makeHeadingsEditable
	 * @covers ::getSubHeadings
	 * @covers ::__construct
	 *
	 * @param string $html
	 * @param string $expected
	 * @param string $explanation
	 */
	public function testTransform( $html, $expected, $explanation ) {
		$transform = new SubHeadingTransform( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] );
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( self::wrap( $expected ), $doc->saveHTML(), $explanation );
	}

	public function provideTransform() {
		yield [
			'<h1></h1><h2></h2>',
			'<h1></h1><h2 class="in-block"></h2>',
			'Heading tag h1 should be ignored'
		];

		yield [
			'<h2></h2><h5></h5>',
			'<h2></h2><h5 class="in-block"></h5>',
			'Heading tag h2 should be ignored'
		];

		yield [
			'<h2></h2>',
			'<h2></h2>',
			'Only one section should be ignored'
		];
	}
}
