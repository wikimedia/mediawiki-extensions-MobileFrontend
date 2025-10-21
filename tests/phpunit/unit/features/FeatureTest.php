<?php

use MobileFrontend\Features\Feature;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\Features\Feature
 * @covers ::__construct()
 */
class FeatureTest extends \MediaWikiUnitTestCase {

	private array $madeUpConfigVariable;

	protected function setUp(): void {
		parent::setUp();
		$this->madeUpConfigVariable = [
			'base' => true
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
		$stableMock = $this->createMock( \MobileFrontend\Features\IUserMode::class );
		$stableMock->method( 'getModeIdentifier' )
			->willReturn( 'base' );

		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->isAvailable( $stableMock );
		$this->assertTrue( $actual );
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

	protected function tearDown(): void {
		unset( $this->madeUpConfigVariable );
		parent::tearDown();
	}
}
