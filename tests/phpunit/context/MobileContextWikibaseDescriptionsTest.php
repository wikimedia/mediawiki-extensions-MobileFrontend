<?php

/**
 * @group MobileFrontend
 */
class MobileContextWikibaseDescriptionsTest extends MediaWikiTestCase {

	/**
	 * @var MobileContext
	 */
	protected $context;

	protected function setUp() {
		parent::setUp();

		// Set relevant configuration variables to their default values.
		$this->setMwGlobals( [
			'wgMFDisplayWikibaseDescriptions' => [
				'search' => true,
				'tagline' => false,
			],
		] );

		$this->context = MobileContext::singleton();
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function testShowingDescriptionsIsDisabledByDefault() {
		$this->assertTrue( $this->context->shouldShowWikibaseDescriptions( 'search' ) );
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function testShowingDescriptionsCanBeEnabled() {
		$this->assertTrue(
			$this->context->shouldShowWikibaseDescriptions( 'search' ),
			'Showing descriptions is flagged by new variables.'
		);
		$this->assertFalse(
			$this->context->shouldShowWikibaseDescriptions( 'tagline' ),
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
		$this->context->shouldShowWikibaseDescriptions( $feature );
	}
}
