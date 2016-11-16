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
			'wgMFUseWikibaseDescription' => false,
			'wgMFDisplayWikibaseDescription' => false,
			'wgMFDisplayWikibaseDescriptionsAsTaglines' => false,

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
	 * @covers MobileContext::shouldShowWikibaseDescriptionsLegacy
	 */
	public function test_showing_descriptions_is_disabled_by_default() {
		$this->assertFalse( $this->context->shouldShowWikibaseDescriptions( 'search' ) );

		$this->setMwGlobals( 'wgMFUseWikibaseDescription', true );

		$this->assertFalse(
			$this->context->shouldShowWikibaseDescriptions( 'search' ),
			'Showing descriptions is flagged by wgMFDisplayWikibaseDescription.'
		);

		$this->setMwGlobals( 'wgMFDisplayWikibaseDescription', true );

		$this->assertTrue( $this->context->shouldShowWikibaseDescriptions( 'search' ) );
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 * @covers MobileContext::shouldShowWikibaseDescriptionsLegacy
	 */
	public function test_showing_descriptions_as_taglines_can_be_enabled() {
		$this->setMwGlobals( [
			'wgMFUseWikibaseDescription' => true,
			'wgMFDisplayWikibaseDescriptionsAsTaglines' => true,
		] );

		$this->assertTrue( $this->context->shouldShowWikibaseDescriptions( 'tagline' ) );
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 * @covers MobileContext::shouldShowWikibaseDescriptionsLegacy
	 */
	public function test_showing_descriptions_can_be_enabled() {
		$this->setMwGlobals( [
			'wgMFUseWikibase' => true,
		] );

		$this->assertTrue(
			$this->context->shouldShowWikibaseDescriptions( 'search' ),
			'Showing descriptions is flagged by new variables.'
		);

		$this->setMwGlobals( [
			'wgMFUseWikibase' => false,
			'wgMFUseWikibaseDescription' => true,
			'wgMFDisplayWikibaseDescription' => true,
		] );

		$this->assertTrue(
			$this->context->shouldShowWikibaseDescriptions( 'search' ),
			'Showing descriptions is still flagged by deprecated variables.'
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
	 * @covers MobileContext::shouldShowWikibaseDescriptionsLegacy
	 */
	public function test_it_throws_an_exception_if_feature_is_invalid( $feature ) {
		$this->context->shouldShowWikibaseDescriptions( $feature );
	}
}
