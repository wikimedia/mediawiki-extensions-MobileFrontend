<?php

use MobileFrontend\Features\Feature;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\Features\Feature
 * @covers ::__construct()
 */
class FeatureTest extends MediaWikiTestCase {
	private $madeUpConfigVariable;

	public function setUp() {
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
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->isAvailable( 'default' );

		$this->assertFalse( $actual );
	}

	/**
	 * @covers ::isAvailable
	 */
	public function testIsAvailable() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->isAvailable( 'beta' );
		$this->assertTrue( $actual );

		$actual = $feature->isAvailable( 'base' );
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

		$this->assertSame( $actual, 'TestName' );
	}

	/**
	 * @covers ::__toString
	 */
	public function testToString() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->__toString();

		$this->assertSame( $actual, 'TestName' );
	}

	/**
	 * @covers ::getGroup
	 */
	public function testGetGroup() {
		$feature = new Feature(
			'TestName', 'test-group', $this->madeUpConfigVariable
		);
		$actual = $feature->getGroup();

		$this->assertSame( $actual, 'test-group' );
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

		$this->assertSame( $actual, $expected );
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

		$this->assertSame( $actual, $expected );
	}

	public function tearDown() {
		unset( $this->madeUpConfigVariable );
		parent::tearDown();
	}
}
