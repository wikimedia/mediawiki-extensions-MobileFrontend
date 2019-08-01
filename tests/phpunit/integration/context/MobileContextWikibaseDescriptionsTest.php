<?php

use MediaWiki\MediaWikiServices;

/**
 * @group MobileFrontend
 */
class MobileContextWikibaseDescriptionsTest extends MediaWikiTestCase {

	/**
	 * @var MobileContext
	 */
	protected $context;

	/**
	 * @var Config
	 */
	protected $config;

	protected function setUp() {
		parent::setUp();

		// Set relevant configuration variables to their default values.
		$this->setMwGlobals( [
			'wgMFDisplayWikibaseDescriptions' => [
				'search' => true,
				'tagline' => false,
			],
		] );

		$services = MediaWikiServices::getInstance();
		$this->context = $services->getService( 'MobileFrontend.Context' );
		$this->config = $services->getService( 'MobileFrontend.Config' );
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function testShowingDescriptionsIsDisabledByDefault() {
		$this->assertTrue(
			$this->context->shouldShowWikibaseDescriptions( 'search', $this->config )
		);
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
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
	 *
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function testItThrowsAnExceptionIfFailureIsInvalid( $feature ) {
		$this->expectException( DomainException::class );
		$this->context->shouldShowWikibaseDescriptions( $feature, $this->config );
	}
}
