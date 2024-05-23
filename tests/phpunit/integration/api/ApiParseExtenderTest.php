<?php

use MediaWiki\Context\RequestContext;
use MediaWiki\Request\FauxRequest;

/**
 * @group MobileFrontend
 * @group Database
 */
class ApiParseExtenderTest extends MediaWikiIntegrationTestCase {

	protected function tearDown(): void {
		MobileContext::resetInstanceForTesting();
		parent::tearDown();
	}

	/**
	 * @dataProvider provideData
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
		$requestContext = new RequestContext();
		$requestContext->setRequest( $request );
		MobileContext::resetInstanceForTesting();
		$context = MobileContext::singleton();
		$context->setContext( $requestContext );

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

	public static function provideData() {
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
