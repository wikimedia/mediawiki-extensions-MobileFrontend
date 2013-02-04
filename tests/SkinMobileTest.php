<?php

/**
 * @group MobileFrontend
 */
class SkinMobileTest extends MediaWikiTestCase {
	private $modules = array(
		'arthur' => array(
			'mobileTargets' => array( 'beta' ),
		),
		'brion' => array(
			'mobileTargets' => array( 'beta', 'alpha' ),
			'position' => 'top',
		),
		'jon' => array(
			'mobileTargets' => array( 'alpha' ),
			'position' => 'bottom',
		),
		'juliusz' => array(
			'mobileTargets' => array( 'stable', 'beta' ),
		),
		'max' => array(
			'mobileTargets' => array( 'stable' ),
		),
		'patrick' => array(
			'mobileTargets' => array( '?' ),
		),
		'tomasz' => array(
			'position' => 'top',
		),
	);

	// providers
	public function providerGetEnabledModules() {
		$detector = new DeviceDetection();
		$device = $detector->getDeviceProperties( 'webkit', '' );

		return array(
			// stable mode
			array(
				$this->modules,
				'Test',
				$device,
				false,
				false,
				array(
					'top' => array( 'mobile.device.webkit' ),
					'bottom' => array( 'juliusz', 'max' ),
				),
			),

			// beta mode
			array(
				$this->modules,
				'Test',
				$device,
				true,
				false,
				array(
					'top' => array( 'brion', 'mobile.device.webkit' ),
					'bottom' => array( 'arthur', 'juliusz' ),
				),
			),

			// alpha mode
			array(
				$this->modules,
				'Test',
				$device,
				true,
				true,
				array(
					'top' => array( 'brion', 'mobile.device.webkit' ),
					'bottom' => array( 'jon' ),
				),
			),
		);
	}

	// tests

	/**
	 * @dataProvider providerGetEnabledModules
	 */
	public function testGetEnabledModules( $modules, $title, $device, $inBeta, $inAlpha, $expected ) {
		$ctx = MobileContext::singleton();
		$ctx->setBetaGroupMember( $inBeta );
		$ctx->setAlphaGroupMember( $inAlpha );

		$skin = new SkinMobile( new ExtMobileFrontend( $ctx ) );
		$enabled = $skin->getEnabledModules( $modules, Title::newFromText( $title ), $device );

		$this->assertEquals( $enabled, $expected );
	}
}

