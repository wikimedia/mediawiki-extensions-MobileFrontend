<?php

use MobileFrontend\Features\FeaturesManager;
use MobileFrontend\Features\Feature;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\Features\FeaturesManager
 * @covers ::__construct
 */
class FeaturesManagerTest extends MediaWikiTestCase {

	private function getTestMode( $modeName, $isEnabled = true ) {
		$modeMock = $this->getMock( \MobileFrontend\Features\IUserMode::class );
		$modeMock->expects( $this->any() )
			->method( 'getModeIdentifier' )
			->willReturn( $modeName );
		$modeMock->expects( $this->any() )
			->method( 'isEnabled' )
			->willReturn( $isEnabled );

		return $modeMock;
	}

	private function makeFeature( $featureId, array $availability ) {
		return new Feature( $featureId, 'test', $availability );
	}

	/**
	 * @covers ::registerFeature
	 * @covers ::getAvailableForMode
	 */
	public function testGetAvailableForMode() {
		$modeAMock = $this->getTestMode( 'modeA' );
		$modeBMock = $this->getTestMode( 'modeB' );
		$modeCMock = $this->getTestMode( 'modeC' );

		$featureA = $this->makeFeature( 'featureA',
			[ 'modeA' => true, 'modeB' => true, 'modeC' => false ] );
		$featureB = $this->makeFeature( 'featureB',
			[ 'modeA' => false, 'modeB' => true, 'modeC' => false ] );
		$featureC = $this->makeFeature( 'featureC',
			[ 'modeA' => false, 'modeB' => false, 'modeC' => false ] );

		$userModes = new \MobileFrontend\Features\UserModes();
		$userModes->registerMode( $modeAMock );
		$userModes->registerMode( $modeBMock );
		$userModes->registerMode( $modeCMock );

		$manager = new FeaturesManager( $userModes );
		$manager->registerFeature( $featureA );
		$manager->registerFeature( $featureB );
		$manager->registerFeature( $featureC );

		// Should return only A and B feature
		$featuresInA = $manager->getAvailableForMode( $modeAMock );
		// Should return only B feature
		$featuresInB = $manager->getAvailableForMode( $modeBMock );
		// Should return no features
		$featuresInC = $manager->getAvailableForMode( $modeCMock );

		$this->assertCount( 1, $featuresInA, 'ModeA should have only one feature available' );
		$this->assertArrayHasKey( 'featureA', $featuresInA, 'ModeA should have only FeatureA available' );
		$this->assertCount( 2, $featuresInB, 'ModeB should have two features available' );
		$this->assertArrayHasKey( 'featureA', $featuresInB, 'ModeB should have FeatureA available' );
		$this->assertArrayHasKey( 'featureB', $featuresInB, 'ModeB should have FeatureB available' );
		$this->assertEmpty( $featuresInC, 'ModeC should have no features available' );
	}

	/**
	 * @covers ::isFeatureAvailableForCurrentUser
	 */
	public function testModeDisabledSoFeatureNotAvailableForUser() {
		// There is one feature, but modeA is not enabled by user
		$modeAMock = $this->getTestMode( 'modeA', false );
		$featureA = $this->makeFeature( 'featureA', [ 'modeA' => true ] );

		$userModes = new \MobileFrontend\Features\UserModes();
		$userModes->registerMode( $modeAMock );
		$manager = new FeaturesManager( $userModes );
		$manager->registerFeature( $featureA );

		$this->assertEquals( false, $manager->isFeatureAvailableForCurrentUser( 'featureA' ) );
	}

	/**
	 * @covers ::isFeatureAvailableForCurrentUser
	 */
	public function testFeatureAvailableInTwoModesButOnlyOneEnabledByUser() {
		// There is one feature, but modeA is not enabled by user
		$modeAMock = $this->getTestMode( 'modeA', false );
		$modeBMock = $this->getTestMode( 'modeA', true );

		$featureA = $this->makeFeature( 'featureA', [ 'modeA' => true, 'modeB' => true ] );

		$userModes = new \MobileFrontend\Features\UserModes();
		$userModes->registerMode( $modeAMock );
		$userModes->registerMode( $modeBMock );
		$manager = new FeaturesManager( $userModes );
		$manager->registerFeature( $featureA );

		$this->assertEquals( true, $manager->isFeatureAvailableForCurrentUser( 'featureA' ) );
	}

}
