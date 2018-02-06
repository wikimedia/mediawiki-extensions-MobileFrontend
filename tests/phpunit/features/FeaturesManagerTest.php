<?php

use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\Feature;

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileFrontend\Features\FeaturesManager
 */
class FeaturesManagerTest extends MediaWikiTestCase {

	/**
	 * @dataProvider provideIsFeatureAvailableInContext
	 * @covers ::isFeatureAvailableInContext
	 *
	 * @param string $html
	 * @param string $expected
	 * @param string $isBetaGroupMember isBetaGroup memeber
	 */
	public function testIsFeatureAvailableInContext(
		$expected,
		$madeUpConfigVariable,
		$isBetaGroupMember
	) {
		$manager = new FeaturesManager();
		$manager->registerFeature(
			new Feature( 'MFMadeUpConfigVariable', 'test-group', $madeUpConfigVariable ) );

		$contextMock = $this->getMockBuilder( MobileContext::class )
			->disableOriginalConstructor()
			->setMethods( [ 'isBetaGroupMember' ] )
			->getMock();

		$contextMock->expects( $this->once() )
			->method( 'isBetaGroupMember' )
			->willReturn( $isBetaGroupMember );

		$this->assertEquals(
			$expected,
			$manager->isFeatureAvailableInContext( 'MFMadeUpConfigVariable', $contextMock )
		);
	}

	public function provideIsFeatureAvailableInContext() {
		$madeUpConfigVariable = [
			'beta' => true,
			'base' => false,
		];

		return [
			[ false, $madeUpConfigVariable, false ],
			[ true, $madeUpConfigVariable, true ],

			[ false, [ 'alpha' => 'baz' ], true ],
		];
	}
}
