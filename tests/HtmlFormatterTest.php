<?php

/**
 * @group MobileFrontend
 */
class HtmlFormatterTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getHtmlData
	 */
	public function testXhtmlTransform( $input, $expected, $callback = false ) {
		$t = Title::newFromText( 'Mobile' );
		$input = str_replace( "\r", '', $input ); // "yay" to Windows!
		$formatter = new HtmlFormatter( HtmlFormatter::wrapHTML( $input ), $t, 'XHTML' );
		if ( $callback ) {
			$callback( $formatter );
		}
		$formatter->filterContent();
		$html = $formatter->getText();
		$this->assertEquals( str_replace( "\n", '', $expected ), str_replace( "\n", '', $html ) );
	}

	private static function normalize( $s ) {
		
	}

	public function getHtmlData() {
		$disableImages = function( HtmlFormatter $f ) {
			$f->removeImages();
		};
		$removeTags = function( HtmlFormatter $f ) {
			$f->remove( array( 'table', '.foo', '#bar', 'div.baz' ) );
			$f->whitelistIds( 'jedi' );
		};
		$flattenSomeStuff = function( HtmlFormatter $f ) {
			$f->flatten( array( 's', 'div' ) );
		};
		$flattenEverything = function( HtmlFormatter $f ) {
			$f->flattenAllTags();
		};
		return array(
			// remove images if asked
			array(
				'<img src="/foo/bar.jpg">Blah</img>',
				'Blah',
				$disableImages,
			),
			// basic tag removal
			array(
				'<table><tr><td>foo</td></tr></table><div class="foo">foo</div><span id="bar">bar</span>
<strong class="foo" id="bar">foobar</strong><div class="notfoo">test</div> <div class="baz"/>
<span class="baz">baz</span><span class="foo" id="jedi">jedi</span>',

				'<div class="notfoo">test</div>
<span class="baz">baz</span><span class="foo" id="jedi">jedi</span>',
				$removeTags,
			),
			// don't flatten tags that start like chosen ones
			array(
				'<div><s>foo</s> <span>bar</span></div>',
				'foo <span>bar</span>',
				$flattenSomeStuff,
			),
			// total flattening 
			array(
				'<div style="foo">bar<sup>2</sup></div>',
				'bar2',
				$flattenEverything,
			),
		);
	}
}
