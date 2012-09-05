<?php

/**
 * @group MobileFrontend
 */
class ApiParseExtenderTest extends MediaWikiTestCase {
	private $useTidySaved;

	public function setUp() {
		global $wgUseTidy;
		$this->useTidySaved = $wgUseTidy;
		parent::setUp();
	}

	public function tearDown() {
		global $wgUseTidy;
		$wgUseTidy = $this->useTidySaved;
		parent::tearDown();
	}

	/**
	 * @dataProvider getData
	 */
	public function testApi( array $params, $expected ) {
		global $wgUseTidy;

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
			array( array( 'mobileformat' => 'html', 'text' => "I exist\n\n<span class='nomobile'>I don't</span>" ),
				"<p>I exist\n</p><p></p>" ),
			array( array( 'mobileformat' => 'wml', 'text' => 'I am <span class="nomobile">not</span> a <span>span</span>' ),
				"<card id='s0' title='API'><p><p>I am  a span</p>\n</p><p>1/1</p></card>" ),
		);
	}
}