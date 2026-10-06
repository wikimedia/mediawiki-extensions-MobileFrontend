<?php

use MediaWiki\Config\Config;

/**
 * @group MobileFrontend
 * @covers MobileContext
 */
class MobileContextWikibaseDescriptionsTest extends MediaWikiIntegrationTestCase {

	/**
	 * @var MobileContext
	 */
	protected $context;

	/**
	 * @var Config
	 */
	protected $config;

	protected function setUp(): void {
		parent::setUp();

		// Set relevant configuration variables to their default values.
		$this->overrideConfigValue(
			'MFDisplayWikibaseDescriptions', [
				'search' => true,
				'tagline' => false,
			] );

		$services = $this->getServiceContainer();
		$this->context = $services->getService( 'MobileFrontend.Context' );
		$this->config = $services->getService( 'MobileFrontend.Config' );
	}

	public function testShowingDescriptionsIsDisabledByDefault() {
		$this->assertTrue(
			$this->context->shouldShowWikibaseDescriptions( 'search', $this->config )
		);
	}

	public function testShowingDescriptionsCanBeEnabled() {
		$this->assertTrue(
			$this->context->shouldShowWikibaseDescriptions( 'search', $this->config ),
			'Showing descriptions is flagged by new variables.'
		);
		$this->assertFalse(
			$this->context->shouldShowWikibaseDescriptions( 'tagline', $this->config ),
			'Showing descriptions is flagged by tagline variable.'
		);
	}

	public static function invalidFeatureProvider() {
		return [
			[ '' ],
			[ 'foo' ],
		];
	}

	/**
	 * @dataProvider invalidFeatureProvider
	 */
	public function testItThrowsAnExceptionIfFailureIsInvalid( $feature ) {
		$this->expectException( DomainException::class );
		$this->context->shouldShowWikibaseDescriptions( $feature, $this->config );
	}
}
