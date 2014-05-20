<?php

/**
 * @group MobileFrontend
 */
class ApiParseExtenderTest extends MediaWikiTestCase {
	private $savedGlobals;

	public function setUp() {
		$this->savedGlobals = $GLOBALS;
		parent::setUp();
	}

	public function tearDown() {
		$GLOBALS = $this->savedGlobals;
		$this->savedGlobals = null;
		parent::tearDown();
	}

	/**
	 * @dataProvider getData
	 */
	public function testApi( array $params, $expected ) {
		global $wgUseTidy, $wgMFRemovableClasses;

		$wgMFRemovableClasses['HTML'][] = '.nomobile';
		if ( $wgUseTidy ) {
			// Should work both with Tidy and without it
			$wgUseTidy = false;
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
		$data = $api->getResultData();
		$this->assertFalse( isset( $data['errors'] ) );
		$text = preg_replace( "/[\r\n]/", '', trim( $data['parse']['text'] ) );
		$expected = preg_replace( "/[\r\n]/", '', trim( $expected ) );
		$this->assertEquals( $expected, $text );
	}

	public function getData() {
		return array(
			array(
				array(
					'mobileformat' => 'html',
					'text' => "I exist\n\n<span class='nomobile'>I don't</span>"
				),
				'<div><p>I exist</p><p></p></div>' ),
			array(
				array(
					'mobileformat' => 'html',
					'text' => "Lede<h2>Section1</h2>Text<h2>Section2</h2>Text"
				),
				'<div>Lede</div>' .
				'<h2><span class="mw-headline" id="Section1">Section1</span></h2>' .
				'<div>Text</div>' .
				'<h2><span class="mw-headline" id="Section2">Section2</span></h2>' .
				'<div>Text</div>' ),
		);
	}
}
