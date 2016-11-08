<?php

namespace Tests\MobileFrontend\Devices;

use MediaWikiTestCase;
use FauxRequest;
use HashConfig;
use MobileFrontend\Devices\CustomHeaderDeviceDetector;

/**
 * @group MobileFrontend
 */
class CustomHeaderDeviceDetectorTest extends MediaWikiTestCase {

	/**
	 * @var GlobalVarConfig
	 */
	private $config;

	/**
	 * @var UADeviceDetector
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

	public function test_is_null_when_custom_header_isnt_present() {
		$this->assertNull(
			$this->detector->detectDeviceProperties( $this->request, [] )
		);
	}

	public function test_isMobile_when_mobile_header_is_present() {
		$this->request->setHeader( 'FooHeader',  '' );

		$properties = $this->detector->detectDeviceProperties( $this->request, [] );

		$this->assertTrue( $properties->isMobileDevice() );
		$this->assertFalse( $properties->isTabletDevice() );
	}
}
