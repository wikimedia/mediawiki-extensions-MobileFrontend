<?php

/**
 * @group MobileFrontend
 */
class ApiParseExtenderTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getData
	 */
	public function testApi( array $params, $expected ) {
		$params += array( 'action' => 'parse' );
		$req = new FauxRequest( $params );
		$api = new ApiMain( $req );
		$api->execute();
		$data = $api->getResultData();
		$this->assertFalse( isset( $data['errors'] ) );
		$text = preg_replace( "/[\r\n]+/", "\n", trim( $data['parse']['text'] ) );
		$this->assertEquals( $expected, $text );
	}

	public function getData() {
		return array(
			array( array( 'mobileformat' => 'html', 'text' => "I exist\n\n<span class='nomobile'>I don't</span>" ),
				"<p>I exist</p>\n<p></p>" ),
			array( array( 'mobileformat' => 'wml', 'text' => 'I am <span class="nomobile">not</span> a <span>span</span>' ),
				"<card id='s0' title='API'><p><p>I am  a span</p>\n</p><p>1/1</p></card>" ),
		);
	}
}