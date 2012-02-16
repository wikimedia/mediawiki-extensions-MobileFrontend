<?php

/**
 * @group MobileFrontend
 */
class MobileFormatterTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getXhtmlData
	 */
	public function testXhtmlTransform( $input, $expected, $callback = false ) {
		$t = Title::newFromText( 'Mobile' );
		$mf = new MobileFormatter( "<div id='content'>$input</div>", $t, 'XHTML' );
		if ( $callback ) {
			$callback( $mf );
		}
		$mf->filterContent();
		$html = $mf->getText( 'content' );
		$html = preg_replace( '/^<div.*?>|<\\/div>$/', '', $html ); // Forgive me father for I have sinned
		$this->assertEquals( str_replace( "\n", '', $expected ), str_replace( "\n", '', $html ) );
	}

	public function getXhtmlData() {
		$disableImages = function( MobileFormatter $mf ) {
			$mf->removeImages();
		};
		return array(
			// down with infoboxes
			array(
				'<div class="infobox">Insanity!</div>',
				'',
			),
			// remove magnifying glass
			array(
				'<div class="thumb tright"><div class="thumbinner" style="width:222px;"><a href="/wiki/File:Foo.jpg" class="image">
<img alt="" src="/foo.jpg" width="220" height="165" class="thumbimage"/></a><div class="thumbcaption">
<div class="magnify"><a href="/wiki/File:Foo.jpg" class="internal" title="Enlarge"></div>
Foobar!</div></div></div>',
				'<div class="thumb tright"><div class="thumbinner" style="width:222px;"><a href="/wiki/File:Foo.jpg" class="image"><img alt="" src="/foo.jpg" width="220" height="165" class="thumbimage"></img></a><div class="thumbcaption">Foobar!</div></div></div>',
			),
			// remove images if asked
			array(
				'<img src="/foo/bar.jpg">Blah</img>',
				'Blah',
				$disableImages,
			),
		);
	}
}