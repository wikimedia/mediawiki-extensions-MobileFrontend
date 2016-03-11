<?php

/**
 * @group MobileFrontend
 */
class MFResourceLoaderParsedMessageModuleTest extends ResourceLoaderTestCase {
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
		$html = wfMessage( 'mobile-frontend-photo-license' )->parse();
		$expected = Xml::encodeJsCall( 'mw.messages.set',
				array( array( 'mobile-frontend-photo-license' => $html ) ) );

		return array(
			// test case 1
			array(
				$this->modules[0],
				// expected value
				''
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
				''
			),
		);
	}

	// tests

	/**
	 * @dataProvider providerAddParsedMessages
	 * @covers MFResourceLoaderParsedMessageModule::addParsedMessages
	 */
	public function testAddParsedMessages( $module, $expectedJavascript ) {
		$rl = new MFResourceLoaderParsedMessageModule( $module );
		$js = $rl->addParsedMessages( $this->getResourceLoaderContext( 'en' ) );

		$this->assertEquals( $js, $expectedJavascript );
	}

	/**
	 * @dataProvider providerGetMessages
	 * @covers MFResourceLoaderParsedMessageModule::getMessages
	 */
	public function testGetMessages( $module, $expectedMessages ) {
		$rl = new MFResourceLoaderParsedMessageModule( $module );
		$msgs = $rl->getMessages();

		$this->assertEquals( $msgs, $expectedMessages );
	}
}
