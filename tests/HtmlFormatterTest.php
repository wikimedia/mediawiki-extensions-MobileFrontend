<?php

/**
 * @group MobileFrontend
 */
class MF_HtmlFormatterTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getHtmlData
	 */
	public function testTransform( $input, $expected, $callback = false ) {
		$input = self::normalize( $input );
		$formatter = new HtmlFormatter( HtmlFormatter::wrapHTML( $input ) );
		if ( $callback ) {
			$callback( $formatter );
		}
		$formatter->filterContent();
		$html = $formatter->getText();
		$this->assertEquals( self::normalize( $expected ), self::normalize( $html ) );
	}

	private static function normalize( $s ) {
		return str_replace( "\n", '',
			str_replace( "\r", '', $s ) // "yay" to Windows!
		);
	}

	public function getHtmlData() {
		$removeImages = function( HtmlFormatter $f ) {
			$f->removeImages();
		};
		$fullyRemoveImages = function( HtmlFormatter $f ) {
			$f->removeImages();
			$f->useImgAlt( false );
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
				'<span class="mw-mf-image-replacement">['. wfMessage( 'mobile-frontend-missing-image' ) .']</span>Blah',
				$removeImages,
			),
			array(
				'<img src="/foo/bar.jpg" alt="Blah"/>',
				'<span class="mw-mf-image-replacement">[Blah]</span>',
				$removeImages,
			),
			array(
				'<img src="/foo/bar.jpg" alt="Blah"/>',
				'',
				$fullyRemoveImages,
			),
			// basic tag removal
			array(
				'<table><tr><td>foo</td></tr></table><div class="foo">foo</div><div class="foo quux">foo</div><span id="bar">bar</span>
<strong class="foo" id="bar">foobar</strong><div class="notfoo">test</div><div class="baz"/>
<span class="baz">baz</span> <span class="foo" id="jedi">jedi</span>',

				'<div class="notfoo">test</div>
<span class="baz">baz</span> <span class="foo" id="jedi">jedi</span>',
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
			// UTF-8 preservation and security
			array(
				'<span title="&quot; \' &amp;">&lt;Тест!&gt;</span> &amp;&lt;&#38;&#0038;&#x26;&#x026;',
				'<span title="&quot; \' &amp;">&lt;Тест!&gt;</span> &amp;&lt;&amp;&amp;&amp;&amp;',
			),
			array(
				'<img alt="picture of kitty" src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[picture of kitty]</span>',
				$removeImages,
			),
			array(
				'<img src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' . wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			),
			array(
				'<img alt src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' . wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			),
			array(
				'<img alt src="kitty.jpg">look at the cute kitty!<img alt="picture of angry dog" src="dog.jpg">',
				'<span class="mw-mf-image-replacement">[' . wfMessage( 'mobile-frontend-missing-image' ) . ']</span>look at the cute kitty!'.
					'<span class="mw-mf-image-replacement">[picture of angry dog]</span>',
				$removeImages,
			),
			// https://bugzilla.wikimedia.org/show_bug.cgi?id=53086
			array(
				'Foo<sup id="cite_ref-1" class="reference"><a href="#cite_note-1">[1]</a></sup> <a href="/wiki/Bar" title="Bar" class="mw-redirect">Bar</a>',
				'Foo<sup id="cite_ref-1" class="reference"><a href="#cite_note-1">[1]</a></sup> <a href="/wiki/Bar" title="Bar" class="mw-redirect">Bar</a>',
			),
		);
	}
}
