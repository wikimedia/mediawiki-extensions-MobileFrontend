<?php

/**
 * @group MobileFrontend
 */
class MFResourceLoaderModuleTest extends MediaWikiTestCase {
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

		'templateModule' => array(
			'templates' => array(
				'template', 'template2',
			)
		),

		'dependenciesTemplatesModule' => array(
			'templates' => array( 'foo' ),
			'dependencies' => array( 'dependency1', 'dependency2' )
		),

		'dependenciesModule' => array(
			'dependencies' => array( 'dependency1', 'dependency2' )
		)
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

	public function providerGetTemplateNames() {
		return array(
			array(
				$this->modules[0], array(),
			),
			array(
				$this->modules['templateModule'], array( 'template', 'template2' ),
			)
		);
	}

	/**
	 * @FIXME update template tests
	 */
	public function providerGetTemplateScript() {
		$module = $this->modules['templateModule'];
		$module['localTemplateBasePath'] = realpath( dirname( __FILE__ ) . '/templates/' );

		return array(
			array(
				$this->modules[0], ''
			),
			array(
				$module,
				'mw.template.add("template","hello\n");' .
				'mw.template.add("template2","goodbye\n");'
			)
		);
	}

	public function providerGetModifiedTimeTemplates() {
		$module = $this->modules['templateModule'];
		$module['localTemplateBasePath'] = '/tmp/templates';

		return array(
			// Check the default value when no templates present in module is 1
			array( $module, 1 ),
		);
	}

	// tests

	/**
	 * @dataProvider providerAddParsedMessages
	 */
	public function testAddParsedMessages( $module, $expectedJavascript ) {
		$rl = new MFResourceLoaderModule( $module );
		$js = $rl->addParsedMessages();

		$this->assertEquals( $js, $expectedJavascript );
	}

	/**
	 * @dataProvider providerGetMessages
	 */
	public function testGetMessages( $module, $expectedMessages ) {
		$rl = new MFResourceLoaderModule( $module );
		$msgs = $rl->getMessages();

		$this->assertEquals( $msgs, $expectedMessages );
	}

	/**
	 * @dataProvider providerGetTemplateNames
	 */
	public function testGetTemplateNames( $module, $expected ) {
		$rl = new MFResourceLoaderModule( $module );
		$names = $rl->getTemplateNames();

		$this->assertEquals( $names, $expected );
	}

	/**
	 * @dataProvider providerGetTemplateScript
	 */
	public function testGetTemplateScript( $module, $expected ) {
		$rl = new MFResourceLoaderModule( $module );
		$js = $rl->getTemplateScript();

		$this->assertEquals( $js, $expected );
	}

	/**
	 * @dataProvider providerGetModifiedTimeTemplates
	 */
	public function testGetModifiedTimeTemplates( $module, $expected ) {
		$rl = new MFResourceLoaderModule( $module );
		$ts = $rl->getModifiedTimeTemplates( new ResourceLoaderContext( array(), new WebRequest() ) );
		$this->assertEquals( $ts, $expected );
	}
}
