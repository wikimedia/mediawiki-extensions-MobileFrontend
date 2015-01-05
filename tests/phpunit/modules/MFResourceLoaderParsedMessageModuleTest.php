<?php

/**
 * @group MobileFrontend
 */
class MFResourceLoaderParsedMessageModuleTest extends MediaWikiTestCase {
	private $modules = array(
		array(
			'messages' => array( 'foo', 'bar' ),
		),
		array(
			'messages' => array(
				'foo',
				'mobile-frontend-photo-license' => array( 'parse' ),
			),
		),
		array(
			'messages' => array(
				'foo',
				'mobile-frontend-photo-license' => array( 'unknown' ),
			),
		),
	);

	// providers
	public function providerGetMessages() {
		return array(
			array(
				$this->modules[0],
				array( 'foo', 'bar' ),
			),
			array(
				$this->modules[1],
				array( 'foo' ),
			),
			array(
				$this->modules[2],
				array( 'foo' ),
			),
		);
	}

	public function providerAddParsedMessages() {
		$msg = wfMessage( 'mobile-frontend-photo-license' )->parse();
		$expected = "\n" . Xml::encodeJsCall( 'mw.messages.set',
				array( 'mobile-frontend-photo-license', $msg ) );

		return array(
			// test case 1
			array(
				$this->modules[0],
				// expected value
				"\n"
			),
			// test case 2
			array(
				$this->modules[1],
				// expected value 2
				$expected
			),
			// test case 3
			array(
				$this->modules[2],
				// expected value 2
				"\n"
			),
		);
	}

	// tests

	/**
	 * @dataProvider providerAddParsedMessages
	 */
	public function testAddParsedMessages( $module, $expectedJavascript ) {
		$rl = new MFResourceLoaderParsedMessageModule( $module );
		$js = $rl->addParsedMessages();

		$this->assertEquals( $js, $expectedJavascript );
	}

	/**
	 * @dataProvider providerGetMessages
	 */
	public function testGetMessages( $module, $expectedMessages ) {
		$rl = new MFResourceLoaderParsedMessageModule( $module );
		$msgs = $rl->getMessages();

		$this->assertEquals( $msgs, $expectedMessages );
	}
}
