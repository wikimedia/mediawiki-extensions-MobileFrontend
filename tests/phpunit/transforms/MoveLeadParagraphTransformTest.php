<?php

use MobileFrontend\Transforms\MoveLeadParagraphTransform;

/**
 * @group MobileFrontend
 */
class MoveLeadParagraphTransformTest extends MediaWikiTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}
	/**
	 * @dataProvider provideTransform
	 *
	 * @param string $html
	 * @param string $expected
	 */
	public function testTransform( $html, $expected ) {
		$transform = new MoveLeadParagraphTransform( 'A', 1 );
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ) );
	}

	public function provideTransform() {
		$infobox = '<table class="infobox"></table>';
		$paragraph = '<p>first paragraph</p>';

		return [
			[
				"$infobox$paragraph",
				"$paragraph$infobox",
			]
		];
	}
}
