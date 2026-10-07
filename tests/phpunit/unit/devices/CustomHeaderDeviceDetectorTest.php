<?php

namespace Tests\MobileFrontend\Devices;

use MediaWiki\Config\HashConfig;
use MediaWiki\Request\FauxRequest;
use MobileFrontend\Devices\CustomHeaderDeviceDetector;

/**
 * @group MobileFrontend
 * @covers \MobileFrontend\Devices\CustomHeaderDeviceDetector
 * @covers \MobileFrontend\Devices\DeviceProperties
 */
class CustomHeaderDeviceDetectorTest extends \MediaWikiUnitTestCase {

	private CustomHeaderDeviceDetector $detector;
	private FauxRequest $request;

	protected function setUp(): void {
		parent::setUp();

		$config = new HashConfig();
		$config->set( 'MFMobileHeader', 'FooHeader' );

		$this->detector = new CustomHeaderDeviceDetector( $config );
		$this->request = new FauxRequest();
	}

	public function testIsNullWhenCustomHeaderIsntPresent() {
		$this->assertNull(
			$this->detector->detectDeviceProperties( $this->request, [] )
		);
	}

	public function testIsMobileWhenMobileHeaderIsPresent() {
		$this->request->setHeader( 'FooHeader', '' );

		$properties = $this->detector->detectDeviceProperties( $this->request, [] );

		$this->assertTrue( $properties->isMobileDevice );
		$this->assertFalse( $properties->isTabletDevice );
	}
}
