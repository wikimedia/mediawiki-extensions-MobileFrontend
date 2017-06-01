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
			'wgMFUseWikibase' => false,
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
	public function test_showing_descriptions_is_disabled_by_default() {
		$this->assertFalse( $this->context->shouldShowWikibaseDescriptions( 'search' ) );
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function test_showing_descriptions_can_be_enabled() {
		$this->setMwGlobals( [
			'wgMFUseWikibase' => true,
		] );

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
	 * @expectedException DomainException
	 *
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function test_it_throws_an_exception_if_feature_is_invalid( $feature ) {
		$this->context->shouldShowWikibaseDescriptions( $feature );
	}
}
