<?php

/**
 * @group MobileFrontend
 */
class ApiParseExtenderTest extends MediaWikiTestCase {
	const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator"></div>';

	/**
	 * @dataProvider getData
	 */
	public function testApi( array $params, $expected ) {
		global $wgUseTidy;

		$this->setMwGlobals( 'wgMFRemovableClasses',
			array(
				'base' => array( '.nomobile' )
			)
		);
		if ( $wgUseTidy ) {
			// Should work both with Tidy and without it
			$this->setMwGlobals( 'wgUseTidy', false );
			$this->doTest( $params, $expected );
			$wgUseTidy = true;
		}
		$this->doTest( $params, $expected );
	}

	private function doTest( array $params, $expected ) {
		$params += array( 'action' => 'parse' );
		$req = new FauxRequest( $params );
		$api = new ApiMain( $req );
		$api->execute();
		if ( defined( 'ApiResult::META_CONTENT' ) ) {
			$data = $api->getResult()->getResultData( null, array(
				'BC' => array(),
				'Types' => array(),
			) );
		} else {
			$data = $api->getResultData();
		}
		$this->assertFalse( isset( $data['errors'] ) );
		$text = preg_replace( "/[\r\n]/", '', trim( $data['parse']['text']['*'] ) );
		$expected = preg_replace( "/[\r\n]/", '', trim( $expected ) );
		$this->assertEquals( $expected, $text );
	}

	public function getData() {
		return array(
			array(
				array(
					'mobileformat' => '',
					'text' => "I exist\n\n<span class='nomobile'>I don't</span>"
				),
				'<div class="mf-section-0"><p>I exist</p><p></p></div>' ),
			array(
				array(
					'mobileformat' => 'html',
					'text' => "Lede<h2>Section1</h2>Text<h2>Section2</h2>Text"
				),
				'<div class="mf-section-0">Lede</div>' .
				'<h2 class="section-heading">' .
				self::SECTION_INDICATOR .
				'<span class="mw-headline" id="Section1">Section1</span></h2>' .
				'<div class="mf-section-1">Text</div>' .
				'<h2 class="section-heading">' .
				self::SECTION_INDICATOR .
				'<span class="mw-headline" id="Section2">Section2</span></h2>' .
				'<div class="mf-section-2">Text</div>' ),
		);
	}
}
