<?php

/**
 * @group MobileFrontend
 */
class MobileFormatterTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getHtmlData
	 */
	public function testHtmlTransform( $input, $expected, $callback = false ) {
		$t = Title::newFromText( 'Mobile' );
		$input = str_replace( "\r", '', $input ); // "yay" to Windows!
		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $input ), $t, 'HTML' );
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
		$summarySection = '<div id="content_0" class="content_block openSection"></div>';
		$anchor = '<a id="anchor_1" href="#section_1" class="section_anchors back_to_top">&#8593;Jump back a section</a>';

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
				'<div class="thumb tright"><div class="thumbinner" style="width:222px;"><a href="/wiki/File:Foo.jpg" class="image"><img alt="" src="/foo.jpg" width="220" height="165" class="thumbimage"></a><div class="thumbcaption">Foobar!</div></div></div>',
			),
			array(
				'fooo
<div id="mp-itn">bar</div>
<div id="mf-custom" title="custom">blah</div>',
				'<div id="mainpage"><h2>In The News</h2><div id="mp-itn">bar</div><h2>custom</h2><div id="mf-custom">blah</div><br clear="all"></div>',
				function( MobileFormatter $mf ) { $mf->setIsMainPage( true ); },
			),
			// \n</h2> in headers
			array(
				'<h2><span class="editsection">[<a href="/w/index.php?title=California_Gold_Rush&amp;action=edit&amp;section=2" title="Edit section: Forty-niners">edit</a>]</span> <span class="mw-headline" id="Forty-niners">Forty-niners</span>

 	 </h2>' . $longLine,
				$summarySection.
				'<div class="section"><h2 class="section_heading" id="section_1"><span id="Forty-niners">Forty-niners</span></h2><div class="content_block" id="content_1">'
					. $longLine . '</div>'
					. $anchor . '</div>',
				$enableSections
			),
			// Bug 36670
			array(
				'<h2><span class="editsection">[<a href="/w/index.php?title=California_Gold_Rush&amp;action=edit&amp;section=1" title="Edit section: History">edit</a>]</span> <span class="mw-headline" id="History"><span id="Overview"></span>History</span></h2>'
					. $longLine,
				$summarySection.
				'<div class="section"><h2 class="section_heading" id="section_1"><span id="History"><span id="Overview"></span>History</span></h2><div class="content_block" id="content_1">'
					. $longLine . '</div>'
					. $anchor
					. '</div>',
				$enableSections
			),
		);
	}
}
