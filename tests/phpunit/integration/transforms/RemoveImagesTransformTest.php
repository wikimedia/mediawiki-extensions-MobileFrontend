<?php

use MobileFrontend\Transforms\RemoveImagesTransform;

/**
 * @coversDefaultClass MobileFrontend\Transforms\RemoveImagesTransform
 * @group MobileFrontend
 */
class RemoveImagesTransformTest extends \MediaWikiTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @covers ::apply
	 *
	 * @dataProvider provideTransform
	 *
	 * @param string $html
	 * @param string $expected
	 */
	public function testTransform(
		string $html,
		string $expected,
		string $reason
	) {
		$transform = new RemoveImagesTransform();
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ), $reason );
	}

	public function provideTransform() {
		yield [
			'',
			'',
			'No image should simply change nothing'
		];
		yield [
			'<img src="kitty.jpg" width="500" height="400">',
			'<span class="mw-mf-image-replacement">[Image]</span>',
			'Image without alt should be replaced with `[Image]`'
		];
		yield [
			'<img src="kitty.jpg" alt=\'alt\' width="500" height="400">',
			'<span class="mw-mf-image-replacement">[alt]</span>',
			'Image with `alt` should be replaced with `[alt]`'
		];
	}
}
