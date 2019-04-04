<?php

use MobileFrontend\Transforms\LegacyMainPageTransform;

/**
 * @group MobileFrontend
 */
class LegacyMainPageTransformTest extends MediaWikiTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	/**
	 * @dataProvider provideTransform
	 * @covers \MobileFrontend\Transforms\LegacyMainPageTransform::apply
	 *
	 * @param string $html
	 * @param string $expected
	 */
	public function testTransform( $html, $expected, $explanation ) {
		$transform = new LegacyMainPageTransform();
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ), $explanation );
	}

	public function provideTransform() {
		return [
			// # Main page transformations
			[
				'fooo
				<div id="mp-itn">bar</div>
				<div id="mf-custom" title="custom">blah</div>',
				'<div id="mainpage">' .
				'<h2>In the news</h2><div id="mp-itn">bar</div>'
					. '<h2>custom</h2><div id="mf-custom">blah</div><br clear="all"></div>',
				'Anything prefixed mf- has a heading created. mp-itn is special cased',
			],
			[
				'<div id="foo">test</div>',
				'<div id="foo">test</div>',
				'If no elements with id mf- or mp- prefixes, then page undergoes no transforms'
			],
			[
				'<div id="mf-foo" title="A &amp; B">test</div>',
				'<div id="mainpage">' .
				'<h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all"></div>',
				'mf- prefixed ids are accompanied by headings',
			],
			[
				'<div id="foo">test</div><div id="central-auth-images">images</div>',
				'<div id="foo">test</div><div id="central-auth-images">images</div>',
				'unchanged when no special prefixed id attributes'
			],
			[
				'<div id="mf-foo" title="A &amp; B">test</div><div id="central-auth-images">images</div>',
				'<div id="mainpage">' .
				'<h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all">'
					. '<div id="central-auth-images">images</div></div>',
				'#central-auth-images element is always retained even if there are changes to DOM'
			],
		];
	}
}
