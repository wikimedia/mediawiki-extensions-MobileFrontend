<?php

/**
 * @group MobileFrontend
 * @group Broken
 * Disabled for now due to Jenkins weirdness
 */
class MF_ExtractFormatterTest extends MediaWikiTestCase {
	/**
	 * @dataProvider provideExtracts
	 */
	public function testExtracts( $expected, $wikiText, $plainText ) {
		$title = Title::newFromText( 'Test' );
		$po = new ParserOptions();
		$po->setEditSection( true );
		$parser = new Parser();
		$text = $parser->parse( $wikiText, $title, $po )->getText();
		$fmt = new ExtractFormatter( $text, $plainText );
		$fmt->remove( '.metadata' ); // Will be added via $wgMFRemovableClasses on WMF
		$text = trim( $fmt->getText() );
		$this->assertEquals( $expected, $text );
	}

	public function provideExtracts() {
		$dutch = "'''Dutch''' (<span class=\"unicode haudio\" style=\"white-space:nowrap;\"><span class=\"fn\">"
			. "[[File:Loudspeaker.svg|11px|link=File:nl-Nederlands.ogg|About this sound]]&nbsp;[[:Media:nl-Nederlands.ogg|''Nederlands'']]"
			. "</span>&nbsp;<small class=\"metadata audiolinkinfo\" style=\"cursor:help;\">([[Wikipedia:Media help|<span style=\"cursor:help;\">"
			. "help</span>]]·[[:File:nl-Nederlands.ogg|<span style=\"cursor:help;\">info</span>]])</small></span>) is a"
			. " [[West Germanic languages|West Germanic language]] and the native language of most of the population of the [[Netherlands]]";
		return array(
			array(
				"Dutch ( Nederlands ) is a West Germanic language and the native language of most of the population of the Netherlands",
				$dutch,
				true,
			),
		);
	}
}