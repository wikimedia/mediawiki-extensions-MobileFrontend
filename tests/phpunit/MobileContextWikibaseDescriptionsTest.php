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

		$this->context = MobileContext::singleton();
	}

	/**
	 * @covers MobileContext::shouldShowWikibaseDescriptions
	 */
	public function test_showing_descriptions_is_disabled_by_default() {
		// Set relevant configuration variables to their default values.
		$this->setMwGlobals( [
			'wgMFUseWikibaseDescription' => false,
			'wgMFDisplayWikibaseDescription' => false,
		] );

		$this->assertFalse( $this->context->shouldShowWikibaseDescriptions() );

		$this->setMwGlobals( 'wgMFUseWikibaseDescription', true );

		$this->assertFalse(
			$this->context->shouldShowWikibaseDescriptions(),
			'Showing descriptions is flagged by wgMFDisplayWikibaseDescription.'
		);

		$this->setMwGlobals( 'wgMFDisplayWikibaseDescription', true );

		$this->assertTrue( $this->context->shouldShowWikibaseDescriptions() );
	}
}
