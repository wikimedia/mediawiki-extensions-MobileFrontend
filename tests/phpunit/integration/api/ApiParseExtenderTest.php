<?php

/**
 * @group MobileFrontend
 */
class ApiParseExtenderTest extends MediaWikiIntegrationTestCase {

	/**
	 * @dataProvider getData
	 * @covers \MobileFrontend\Api\ApiParseExtender::onAPIGetAllowedParams
	 */
	public function testApi( array $params, array $expected ) {
		$this->overrideConfigValue( 'MFRemovableClasses',
			[
				'base' => [ '.nomobile' ]
			]
		);
		$this->doTest( $params, $expected );
	}

	private function doTest( array $params, array $expected ) {
		// MobileFrontendContentProvider may use HTTP requests which are forbidden in test environment, so disable.
		$this->clearHook( 'MobileFrontendContentProvider' );
		$params += [ 'action' => 'parse', 'wrapoutputclass' => '', 'useskin' => 'minerva' ];

		$request = new FauxRequest( $params );
		$mainContext = new DerivativeContext( RequestContext::getMain() );
		$mainContext->setRequest( $request );
		MobileContext::resetInstanceForTesting();
		$context = MobileContext::singleton();
		$context->setContext( $mainContext );

		$api = new ApiMain( $context );
		$api->execute();
		$data = $api->getResult()->getResultData( null, [
			'BC' => [],
			'Types' => [],
		] );
		$this->assertFalse( isset( $data['errors'] ) );
		$result = $data['parse']['text']['*'];

		foreach ( $expected as $expectedItem ) {
			$this->assertStringContainsString( $expectedItem, $result );
		}
	}

	public function getData() {
		return [
			[
				[
					'mobileformat' => '',
					'text' => "I exist\n\n<span class='nomobile'>I don't</span>"
				],
				[
					'<section',
					'mf-section-0',
				]
			],
			[
				[
					'mobileformat' => '1',
					'text' => "Lede<h2>Section1</h2>Text<h2>Section2</h2>Text"
				],
				[
					'<section',
					'mf-section-0',
					'section-heading',
					'mfTempOpenSection',
					'<h2',
				]
			],
		];
	}
}
