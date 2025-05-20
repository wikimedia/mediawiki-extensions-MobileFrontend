<?php

namespace Tests\MobileFrontend\Devices;

use MediaWiki\Request\FauxRequest;
use MediaWiki\Request\WebRequest;
use MobileFrontend\Devices\DeviceDetector;
use MobileFrontend\Devices\DeviceDetectorService;
use MobileFrontend\Devices\DeviceProperties;

/**
 * @group MobileFrontend
 */
class DeviceDetectorServiceTest extends \MediaWikiUnitTestCase {
	private FauxRequest $request;

	protected function setUp(): void {
		parent::setUp();

		$this->request = new FauxRequest();
	}

	/**
	 * Creates a list of child device detectors from a list of results, which are
	 * then used to create an instance of DeviceDetectorService.
	 *
	 * @param array<?DeviceProperties> $results
	 * @return DeviceDetectorService
	 */
	private function createDetector( array $results ) {
		$childFactory = static function ( $result ) {
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

		$this->assertNull( $properties );
	}
}

class StubDeviceDetector implements DeviceDetector {

	private ?DeviceProperties $result;

	public function __construct( ?DeviceProperties $result ) {
		$this->result = $result;
	}

	public function detectDeviceProperties( WebRequest $request, array $server ) {
		return $this->result;
	}
}
