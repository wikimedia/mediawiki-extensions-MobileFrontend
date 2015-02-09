<?php

/**
 * @group MobileFrontend
 */
class MobileFormatterTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getHtmlData
	 *
	 * @param $input
	 * @param $expected
	 * @param callable|bool $callback
	 */
	public function testHtmlTransform( $input, $expected, $callback = false ) {
		$t = Title::newFromText( 'Mobile' );
		$input = str_replace( "\r", '', $input ); // "yay" to Windows!
		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $input ), $t );
		if ( $callback ) {
			$callback( $mf );
		}
		$mf->filterContent();
		$html = $mf->getText();
		$this->assertEquals( str_replace( "\n", '', $expected ), str_replace( "\n", '', $html ) );
	}

	public function getHtmlData() {
		$enableSections = function ( MobileFormatter $mf ) {
			$mf->enableExpandableSections();
		};
		$longLine = "\n" . str_repeat( 'A', 5000 );
		$removeImages = function( MobileFormatter $f ) {
			$f->setRemoveMedia();
		};
		$mainPage = function( MobileFormatter $f ) {
			$f->setIsMainPage( true );
		};

		return array(
			array(
				'<img src="/foo/bar.jpg">Blah</img>',
				'<span class="mw-mf-image-replacement">['
					. wfMessage( 'mobile-frontend-missing-image' ) .']</span>Blah',
				$removeImages,
			),
			array(
				'<img src="/foo/bar.jpg" alt="Blah"/>',
				'<span class="mw-mf-image-replacement">[Blah]</span>',
				$removeImages,
			),
			array(
				'fooo
<div id="mp-itn">bar</div>
<div id="mf-custom" title="custom">blah</div>',
				'<div id="mainpage"><h2>In the news</h2><div id="mp-itn">bar</div>'
					. '<h2>custom</h2><div id="mf-custom">blah</div><br clear="all"></div>',
				function ( MobileFormatter $mf ) {
					$mf->setIsMainPage( true );
				},
			),
			// \n</h2> in headers
			array(
				'<h2><span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				'<div></div>'
					. '<h2><span class="mw-headline" id="Forty-niners">Forty-niners</span>'
					. '<a class="edit-page" href="#editor/2">Edit</a></h2>'
					. '<div>' . $longLine . '</div>',
				$enableSections
			),
			// \n</h3> in headers
			array(
				'<h3><span>h3</span></h3>'
					. $longLine
					. '<h4><span>h4</span></h4>'
					. 'h4 text.',
				'<div></div>'
					. '<h3><span>h3</span></h3>'
					. '<div>'
					. $longLine
					. '<h4 class="in-block"><span>h4</span></h4>'
					. 'h4 text.'
					. '</div>',
				$enableSections
			),
			// \n</h6> in headers
			array(
				'<h6><span>h6</span></h6>'
					. $longLine,
				'<div></div>'
					. '<h6><span>h6</span></h6>'
					. '<div>' . $longLine . '</div>',
				$enableSections
			),
			// Bug 36670
			array(
				'<h2><span class="mw-headline" id="History"><span id="Overview"></span>'
					. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2>'
					. $longLine,
				'<div></div><h2><span class="mw-headline" id="History"><span id="Overview"></span>'
					. 'History</span><a class="edit-page" href="#editor/2">Edit</a></h2><div>'
					. $longLine . '</div>',
				$enableSections
			),
			array(
				'<img alt="picture of kitty" src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[picture of kitty]</span>',
				$removeImages,
			),
			array(
				'<img src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			),
			array(
				'<img alt src="kitty.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>',
				$removeImages,
			),
			array(
				'<img alt src="kitty.jpg">look at the cute kitty!' .
					'<img alt="picture of angry dog" src="dog.jpg">',
				'<span class="mw-mf-image-replacement">[' .
					wfMessage( 'mobile-frontend-missing-image' ) . ']</span>look at the cute kitty!' .
					'<span class="mw-mf-image-replacement">[picture of angry dog]</span>',
				$removeImages,
			),
			array(
				'<div id="foo">test</div>',
				'<div id="foo">test</div>',
				$mainPage,
			),
			array(
				'<div id="mf-foo" title="A &amp; B">test</div>',
				'<div id="mainpage"><h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all"></div>',
				$mainPage,
			),
			array(
				'<div id="foo">test</div><div id="central-auth-images">images</div>',
				'<div id="foo">test</div><div id="central-auth-images">images</div>',
				$mainPage,
			),
			array(
				'<div id="mf-foo" title="A &amp; B">test</div><div id="central-auth-images">images</div>',
				'<div id="mainpage"><h2>A &amp; B</h2><div id="mf-foo">test</div><br clear="all">'
					. '<div id="central-auth-images">images</div></div>',
				$mainPage,
			),
		);
	}
}
