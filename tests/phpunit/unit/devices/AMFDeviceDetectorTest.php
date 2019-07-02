<?php

namespace Tests\MobileFrontend\Devices;

use WebRequest;
use MobileFrontend\Devices\AMFDeviceDetector;

/**
 * @group MobileFrontend
 */
class AMFDeviceDetectorTest extends \MediaWikiUnitTestCase {

	/**
	 * @var WebRequest
	 */
	private $request;

	/**
	 * @var AMFDeviceDetector
	 */
	private $detector;

	protected function setUp() {
		parent::setUp();

		$this->request = new WebRequest();
		$this->detector = new AMFDeviceDetector();
	}

	/**
	 * @dataProvider provideIsMobileDevice
	 * @covers \MobileFrontend\Devices\AMFDeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\DeviceProperties::isMobileDevice
	 */
	public function testIsMobileDevice( $server, $expectedIsMobileDevice ) {
		$isMobileDevice =
			$this->detector->detectDeviceProperties( $this->request, $server )
				->isMobileDevice();

		$this->assertEquals( $expectedIsMobileDevice, $isMobileDevice );
	}

	public static function provideIsMobileDevice() {
		return [
			[
				[ 'AMF_DEVICE_IS_MOBILE' => 'true' ],
				true,
			],
			[
				[ 'AMF_DEVICE_IS_MOBILE' => 'false' ],
				false,
			],
		];
	}

	/**
	 * @dataProvider provideIsTabletDevice
	 * @covers \MobileFrontend\Devices\AMFDeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\DeviceProperties::isTabletDevice
	 */
	public function testIsTabletDevice( $server, $expectedIsTabletDevice ) {
		$isTabletDevice =
			$this->detector->detectDeviceProperties( $this->request, $server )
				->isTabletDevice();

		$this->assertEquals( $expectedIsTabletDevice, $isTabletDevice );
	}

	public static function provideIsTabletDevice() {
		return [
			[
				[ 'AMF_DEVICE_IS_TABLET' => 'true' ],
				true,
			],
			[
				[ 'AMF_DEVICE_IS_TABLET' => 'false' ],
				false,
			],
		];
	}

	/**
	 * @covers \MobileFrontend\Devices\AMFDeviceDetector::detectDeviceProperties
	 */
	public function testItShouldHandleNoAMFEnvironmentVariables() {
		$this->assertNull(
			$this->detector->detectDeviceProperties( $this->request, [] )
		);
	}
}
