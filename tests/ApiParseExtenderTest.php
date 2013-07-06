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
				'<div id="content_0" class="content_block openSection"><p>I exist</p><p></p></div>' ),
			array( array( 'mobileformat' => 'html', 'text' => "Lede<h2>Section1</h2>Text<h2>Section2</h2>Text" ),
				'<div id="content_0" class="content_block openSection">Lede</div>'
				. '<div class="section"><h2 class="section_heading" id="section_1"><span id="Section1">Section1</span></h2>'
				. '<div class="content_block" id="content_1">Text</div><a id="anchor_1" href="#section_1" class="section_anchors">&#8593;Jump back a section</a></div>'
				. '<div class="section"><h2 class="section_heading" id="section_2"><span id="Section2">Section2</span></h2>'
				. '<div class="content_block" id="content_2">Text</div><a id="anchor_2" href="#section_2" class="section_anchors">&#8593;Jump back a section</a></div>' ),
		);
	}
}