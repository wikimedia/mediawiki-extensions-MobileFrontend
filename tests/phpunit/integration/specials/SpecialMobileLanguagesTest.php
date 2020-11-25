<?php

use MediaWiki\MediaWikiServices;
use Psr\Log\LoggerInterface;

/**
 * @group MobileFrontend
 */
class SpecialMobileLanguagesTest extends MediaWikiTestCase {
	/**
	 * Data provider for testProcessLanguages
	 */
	public function providerProcessLanguages() {
		$input = [
			'bs' => [
				'lang' => 'bs',
				'url' => 'http://bs.wikipedia.org',
				'title' => 'bosnian'
			],
			'de' => [
				'lang' => 'de',
				'url' => 'http://de.wikipedia.org',
				'title' => 'German'
			],
			'es' => [
				'lang' => 'es',
				'url' => 'http://es.wikipedia.org',
				'title' => 'Spanish',
			],
			'simple' => [
				'lang' => 'simple',
				'url' => 'http://simple.wikipedia.org',
				'title' => 'Simple English'
			]
		];

		$expected = [
			'bs' => [
				'langname' => 'bosanski'
			] + $input['bs'],
			'de' => [
				'langname' => 'Deutsch'
			] + $input['de'],
			'es' => [
				'langname' => 'español'
			] + $input['es'],
			'simple' => [
				'langname' => 'Simple English'
			] + $input['simple']
		];

		// Transform URLs to mobile version, which is dependent on wgMobileUrlTemplate
		$ctx = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		foreach ( $expected as $key => &$value ) {
			$value['url'] = $ctx->getMobileUrl( $value['url'] );
		}

		return [
			[
				// Works with one language
				[
					$input['es']
				],
				[
					$expected['es']
				]
			],
			[
				// Sorts two languages
				[
					$input['es'],
					$input['bs']
				],
				[
					$expected['bs'],
					$expected['es']
				]
			],
			[
				// Should still sort correctly if already in correct order
				[
					$input['bs'],
					$input['es']
				],
				[
					$expected['bs'],
					$expected['es']
				]
			],
			[
				// Sorts languages case-insensitive
				[
					$input['simple'],
					$input['de'],
					$input['bs'],
					$input['es']
				],
				[
					$expected['bs'],
					$expected['de'],
					$expected['es'],
					$expected['simple']
				]
			],
			[
				// Should still sort correctly if already in correct order (mixed case)
				[
					$input['bs'],
					$input['de'],
					$input['es'],
					$input['simple']
				],
				[
					$expected['bs'],
					$expected['de'],
					$expected['es'],
					$expected['simple']
				]
			]
		];
	}

	/**
	 * @covers SpecialMobileLanguages::processLanguages
	 * @covers SpecialMobileLanguages::__construct
	 * @covers SpecialMobileLanguages::isLanguageObjectValid
	 * @dataProvider providerProcessLanguages
	 */
	public function testProcessLanguages( $langlinks, $expected ) {
		$apiResult = [
			42 => [
				'langlinks' => $langlinks
			]
		];
		$services = MediaWikiServices::getInstance();
		$sp = new SpecialMobileLanguages(
			$services->getLanguageConverterFactory(),
			$services->getLanguageNameUtils()
		);
		$class = new ReflectionClass( SpecialMobileLanguages::class );
		$method = $class->getMethod( 'processLanguages' );
		$method->setAccessible( true );
		$this->assertEquals(
			$expected,
			$method->invokeArgs( $sp, [ $apiResult ] ),
			'Property langname should be added, URL should be transformed, and languages should be sorted.'
		);
	}

	/**
	 * Test an edge case when URL key is missing in langObject
	 *
	 * @covers SpecialMobileLanguages::processLanguages
	 * @covers SpecialMobileLanguages::isLanguageObjectValid
	 */
	public function testProcessLanguagesWhenURLKeyIsMissing() {
		$testUri = 'http://localhost/test';
		$langObject = [
			'lang' => 'pl',
			'title' => 'Polski'
		];
		$expected = [];

		$loggerMock = $this->createMock( LoggerInterface::class );
		$loggerMock->expects( $this->once() )
			->method( 'warning' )
			->with( $this->isType( 'string' ), $this->equalTo(
				[
					'uri' => $testUri,
					'langObject' => $langObject
				]
		) );
		$this->setLogger( MobileContext::LOGGER_CHANNEL, $loggerMock );

		$requestMock = $this->createMock( FauxRequest::class );
		$requestMock->expects( $this->once() )
			->method( 'getFullRequestURL' )
			->willReturn( $testUri );

		RequestContext::getMain()->setRequest( $requestMock );
		$this->testProcessLanguages( [ $langObject ], $expected );
	}
}
