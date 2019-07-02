<?php

namespace Tests\MobileFrontend\Devices;

use FauxRequest;
use HashConfig;
use MobileFrontend\Devices\CustomHeaderDeviceDetector;

/**
 * @group MobileFrontend
 */
class CustomHeaderDeviceDetectorTest extends \MediaWikiUnitTestCase {

	/**
	 * @var \GlobalVarConfig
	 */
	private $config;

	/**
	 * @var \MobileFrontend\Devices\UADeviceDetector
	 */
	private $detector;

	/**
	 * @var FauxRequest
	 */
	private $request;

	protected function setUp() {
		parent::setUp();

		$config = new HashConfig();
		$config->set( 'MFMobileHeader', 'FooHeader' );

		$this->detector = new CustomHeaderDeviceDetector( $config );
		$this->request = new FauxRequest();
	}

	/**
	 * @covers \MobileFrontend\Devices\CustomHeaderDeviceDetector::detectDeviceProperties
	 */
	public function testIsNullWhenCustomHeaderIsntPresent() {
		$this->assertNull(
			$this->detector->detectDeviceProperties( $this->request, [] )
		);
	}

	/**
	 * @covers \MobileFrontend\Devices\CustomHeaderDeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\CustomHeaderDeviceDetector::__construct
	 * @covers \MobileFrontend\Devices\DeviceProperties::isMobileDevice
	 * @covers \MobileFrontend\Devices\DeviceProperties::isTabletDevice
	 */
	public function testIsMobileWhenMobileHeaderIsPresent() {
		$this->request->setHeader( 'FooHeader',  '' );

		$properties = $this->detector->detectDeviceProperties( $this->request, [] );

		$this->assertTrue( $properties->isMobileDevice() );
		$this->assertFalse( $properties->isTabletDevice() );
	}
}
