<?php

/**
 * @group MobileFrontend
 */
class ApiParseExtenderTest extends MediaWikiIntegrationTestCase {
	// phpcs:ignore Generic.Files.LineLength.TooLong
	private const SECTION_INDICATOR = '<div class="mw-ui-icon mw-ui-icon-element indicator mw-ui-icon-small mw-ui-icon-flush-left mw-ui-button mw-ui-quiet"></div>';

	/**
	 * @dataProvider getData
	 * @covers \MobileFrontend\Api\ApiParseExtender::onAPIGetAllowedParams
	 */
	public function testApi( array $params, string $expected ) {
		$this->setMwGlobals( 'wgMFRemovableClasses',
			[
				'base' => [ '.nomobile' ]
			]
		);
		$this->doTest( $params, $expected );
	}

	private function doTest( array $params, string $expected ) {
		// MobileFrontendContentProvider may use HTTP requests which are forbidden in test environment, so disable.
		$this->clearHook( 'MobileFrontendContentProvider' );
		$params += [ 'action' => 'parse', 'wrapoutputclass' => '', 'useskin' => 'fallback' ];

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
		$text = preg_replace( "/[\r\n]/", '', trim( $data['parse']['text']['*'] ) );
		// Remove parser report comment as it is non-deterministic
		$text = preg_replace( '/<!--.*?-->/s', '', $text );
		$expected = preg_replace( "/[\r\n]/", '', trim( $expected ) );
		$this->assertEquals( $expected, $text );
	}

	public function getData() {
		return [
			[
				[
					'mobileformat' => '',
					'text' => "I exist\n\n<span class='nomobile'>I don't</span>"
				],
				'<section class="mf-section-0" id="mf-section-0"><p>I exist</p><p></p></section>'
			],
			[
				[
					'mobileformat' => '1',
					'text' => "Lede<h2>Section1</h2>Text<h2>Section2</h2>Text"
				],
				'<section class="mf-section-0" id="mf-section-0"><p>Lede</p></section>' .
				'<h2 class="section-heading" onclick="mfTempOpenSection(1)">' .
				self::SECTION_INDICATOR .
				'<span class="mw-headline" id="Section1">Section1</span></h2>' .
				'<section class="mf-section-1 collapsible-block" id="mf-section-1"><p>Text</p></section>' .
				'<h2 class="section-heading" onclick="mfTempOpenSection(2)">' .
				self::SECTION_INDICATOR .
				'<span class="mw-headline" id="Section2">Section2</span></h2>' .
				'<section class="mf-section-2 collapsible-block" id="mf-section-2"><p>Text</p></section>'
			],
		];
	}
}
