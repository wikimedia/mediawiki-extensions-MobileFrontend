<?php

namespace Tests\MobileFrontend\Devices;

use MobileFrontend\Devices\DeviceDetector;
use WebRequest;
use FauxRequest;
use MobileFrontend\Devices\DeviceProperties;
use MobileFrontend\Devices\DeviceDetectorService;

/**
 * @group MobileFrontend
 */
class DeviceDetectorServiceTest extends \MediaWikiUnitTestCase {
	protected function setUp() {
		parent::setUp();

		$this->request = new FauxRequest();
	}

	/**
	 * Creates a list of child device detectors from a list of results, which are
	 * then used to create an instance of `CompositeDeviceDetector`.
	 *
	 * @param array $results
	 * @return CompositeDeviceDetector
	 */
	private function createDetector( array $results ) {
		$childFactory = function ( $result ) {
			return new StubDeviceDetector( $result );
		};

		return new DeviceDetectorService( array_map( $childFactory, $results ) );
	}

	/**
	 * @covers \MobileFrontend\Devices\DeviceDetectorService::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\DeviceDetectorService::__construct
	 * @covers \MobileFrontend\Devices\DeviceProperties::__construct
	 */
	public function testItShouldHandleOneChild() {
		$expectedProperties = new DeviceProperties( true, false );
		$detector = $this->createDetector( [ $expectedProperties ] );

		$properties = $detector->detectDeviceProperties( $this->request, [] );

		$this->assertSame( $expectedProperties, $properties );
	}

	/**
	 * @covers \MobileFrontend\Devices\DeviceDetectorService::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\DeviceDetectorService::__construct
	 * @covers \MobileFrontend\Devices\DeviceProperties::__construct
	 */
	public function testItShouldHandleManyChildren() {
		$expectedProperties = new DeviceProperties( true, false );
		$detector = $this->createDetector( [
			null,
			null,
			$expectedProperties
		] );

		$properties = $detector->detectDeviceProperties( $this->request, [] );

		$this->assertSame( $expectedProperties, $properties );
	}

	/**
	 * @covers \MobileFrontend\Devices\DeviceDetectorService::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\DeviceDetectorService::__construct
	 */
	public function testItShouldHandleZeroChildren() {
		$detector = $this->createDetector( [] );

		$properties = $detector->detectDeviceProperties( $this->request, [] );

		$this->assertEquals( null, $properties );
	}
}

class StubDeviceDetector implements DeviceDetector {
	public function __construct( $result ) {
		$this->result = $result;
	}

	public function detectDeviceProperties( WebRequest $request, array $server ) {
		return $this->result;
	}
}
