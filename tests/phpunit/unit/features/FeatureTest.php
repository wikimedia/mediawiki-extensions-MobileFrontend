<?php

use MobileFrontend\Features\Feature;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\Features\Feature
 * @covers ::__construct()
 */
class FeatureTest extends \MediaWikiUnitTestCase {
	/** @var array */
	private $madeUpConfigVariable;

	protected function setUp() : void {
		parent::setUp();
		$this->madeUpConfigVariable = [
			'beta' => true,
			'base' => false
		];
	}

	/**
	 * @covers ::isAvailable
	 */
	public function testIsAvailableDefault() {
		$modeMock = $this->createMock( \MobileFrontend\Features\IUserMode::class );
		$modeMock->method( 'getModeIdentifier' )
			->willReturn( 'default' );

		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->isAvailable( $modeMock );

		$this->assertFalse( $actual );
	}

	/**
	 * @covers ::isAvailable
	 */
	public function testIsAvailable() {
		$betaMock = $this->createMock( \MobileFrontend\Features\IUserMode::class );
		$betaMock->method( 'getModeIdentifier' )
			->willReturn( 'beta' );

		$stableMock = $this->createMock( \MobileFrontend\Features\IUserMode::class );
		$stableMock->method( 'getModeIdentifier' )
			->willReturn( 'base' );

		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->isAvailable( $betaMock );
		$this->assertTrue( $actual );

		$actual = $feature->isAvailable( $stableMock );
		$this->assertFalse( $actual );
	}

	/**
	 * @covers ::getId
	 */
	public function testGetId() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->getId();

		$this->assertSame( 'TestName', $actual );
	}

	/**
	 * @covers ::__toString
	 */
	public function testToString() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->__toString();

		$this->assertSame( 'TestName', $actual );
	}

	/**
	 * @covers ::getGroup
	 */
	public function testGetGroup() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->getGroup();

		$this->assertSame( 'test-group', $actual );
	}

	/**
	 * @covers ::getNameKey
	 */
	public function testGetNameKey() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->getNameKey();
		$expected = 'test-group-mobile-option-TestName';

		$this->assertSame( $expected, $actual );
	}

	/**
	 * @covers ::getDescriptionKey
	 */
	public function testGetDescriptionKey() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->getDescriptionKey();
		$expected = 'test-group-mobile-option-TestName-description';

		$this->assertSame( $expected, $actual );
	}

	protected function tearDown() : void {
		unset( $this->madeUpConfigVariable );
		parent::tearDown();
	}
}
