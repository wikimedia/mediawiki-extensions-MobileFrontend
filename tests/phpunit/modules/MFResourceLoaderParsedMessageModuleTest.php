<?php

/**
 * @group MobileFrontend
 */
class MFResourceLoaderParsedMessageModuleTest extends ResourceLoaderTestCase {
	private $modules = [
		[
			'messages' => [ 'foo', 'bar' ],
		],
		[
			'messages' => [
				'foo',
				'mobile-frontend-photo-license' => [ 'parse' ],
			],
		],
		[
			'messages' => [
				'foo',
				'mobile-frontend-photo-license' => [ 'unknown' ],
			],
		],
	];

	// providers
	public function providerGetMessages() {
		return [
			[
				$this->modules[0],
				[ 'foo', 'bar' ],
			],
			[
				$this->modules[1],
				[ 'foo' ],
			],
			[
				$this->modules[2],
				[ 'foo' ],
			],
		];
	}

	public function providerAddParsedMessages() {
		$html = wfMessage( 'mobile-frontend-photo-license' )->parse();
		$expected = Xml::encodeJsCall( 'mw.messages.set',
				[ [ 'mobile-frontend-photo-license' => $html ] ] );

		return [
			// test case 1
			[
				$this->modules[0],
				// expected value
				''
			],
			// test case 2
			[
				$this->modules[1],
				// expected value 2
				$expected
			],
			// test case 3
			[
				$this->modules[2],
				// expected value 2
				''
			],
		];
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
