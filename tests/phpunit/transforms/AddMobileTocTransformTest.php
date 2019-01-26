<?php

use MobileFrontend\Transforms\AddMobileTocTransform;

/**
 * @group MobileFrontend
 */
class AddMobileTocTransformTest extends MediaWikiTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @dataProvider provideTransform
	 * @covers MobileFrontend\Transforms\AddMobileTocTransform::apply
	 *
	 * @param string $html
	 * @param string $expected
	 */
	public function testTransform( $html, $expected, $explanation ) {
		$transform = new AddMobileTocTransform();
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ), $explanation );
	}

	public function provideTransform() {
		$tocList = '<ul>' .
		'<li class="toclevel-1 tocsection-1"><a href="#History">' .
		'<span class="tocnumber">1</span> <span class="toctext">History</span></a></li>' .
		'<li class="toclevel-1 tocsection-2"><a href="#Geography"><span class="tocnumber">2</span>' .
		'<span class="toctext">Geography</span></a></li>' .
		'</ul>';

		return [
			// # Substitute table of contents with placeholder
			[
				'<div id="toc"><div class="toctitle"><h2>OldTOC</h2></div>' . $tocList . '</div>',
				'<div id="toc" class="toc-mobile"><h2>Contents</h2></div>',
				'Desktop toc substituted for a placeholder box',
			],
			[
				'<div id="tocy"><div class="toctitle"><h2>OldTOC</h2></div>' . $tocList . '</div>',
				'<div id="tocy"><div class="toctitle"><h2>OldTOC</h2></div>' . $tocList . '</div>',
				'If table of contents id changes this will break',
			],
			[
				'No table of contents',
				'No table of contents',
				'No change if no toc present'
			],

		];
	}
}
