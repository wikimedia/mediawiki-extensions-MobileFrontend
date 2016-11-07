<?php

namespace Tests\MobileFrontend\Devices;

use MediaWikiTestCase;
use MobileFrontend\Devices\DeviceDetector;
use WebRequest;
use FauxRequest;
use MobileFrontend\Devices\DeviceProperties;
use MobileFrontend\Devices\DeviceDetectorService;

class StubDeviceDetector implements DeviceDetector {
	public function __construct( $result ) {
		$this->result = $result;
	}

	public function detectDeviceProperties( WebRequest $request, array $server ) {
		return $this->result;
	}
}

/**
 * @group MobileFrontend
 */
class DeviceDetectorServiceTest extends MediaWikiTestCase {
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

	public function test_it_should_handle_one_child() {
		$expectedProperties = new DeviceProperties( true, false );
		$detector = $this->createDetector( [ $expectedProperties ] );

		$properties = $detector->detectDeviceProperties( $this->request, [] );

		$this->assertSame( $expectedProperties, $properties );
	}

	public function test_it_should_handle_many_children() {
		$expectedProperties = new DeviceProperties( true, false );
		$detector = $this->createDetector( [
			null,
			null,
			$expectedProperties
		] );

		$properties = $detector->detectDeviceProperties( $this->request, [] );

		$this->assertSame( $expectedProperties, $properties );
	}

	public function test_it_should_handle_zero_children() {
		$detector = $this->createDetector( [] );

		$properties = $detector->detectDeviceProperties( $this->request, [] );

		$this->assertEquals( null, $properties );
	}
}
