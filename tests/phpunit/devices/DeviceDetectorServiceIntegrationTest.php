<?php

namespace Tests\MobileFrontend\Devices;

use MediaWikiTestCase;
use FauxRequest;
use GlobalVarConfig;
use MobileFrontend\Devices\DeviceDetectorService;

/**
 * This suite of test cases tests
 * `MobileFrontend\Devices\DeviceDetectorService`'s behaviour with no stubbed
 * dependencies.
 *
 * @group MobileFrontend
 * @group integration
 */
class DeviceDetectorServiceIntegrationTest extends MediaWikiTestCase {
	public function setUp() {
		parent::setUp();

		$this->setMwGlobals( 'wgMFAutodetectMobileView', true );

		$this->request = new FauxRequest();
		$this->request->setHeader(
			'User-Agent',

			// A Macbook Air running Google Chrome (53.0.2785.116).
			// @codingStandardsIgnoreStart
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36'
			// @codingStandardsIgnoreEnd
		);

		$this->server = [];
	}

	private function detectDeviceProperties() {
		$config = new GlobalVarConfig();

		return DeviceDetectorService::factory( $config )
			->detectDeviceProperties( $this->request, $this->server );
	}

	private function whenTheRequestIsFromAMobileUA() {
		$this->request->setHeader(
			'User-Agent',

			// An iPhone running iOS 8.0.
			// @codingStandardsIgnoreStart
			'Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25'
			// @codingStandardsIgnoreEnd
		);
	}

	public function test_it_should_handle_requests_from_mobile_UAs() {
		$this->whenTheRequestIsFromAMobileUA();

		$properties = $this->detectDeviceProperties();

		$this->assertTrue( $properties->isMobileDevice() );
		$this->assertFalse( $properties->isTabletDevice() );
	}

	public function test_it_should_handle_a_request_from_desktop_browsers() {
		$properties = $this->detectDeviceProperties();

		$this->assertFalse( $properties->isMobileDevice() );
		$this->assertFalse( $properties->isTabletDevice() );
	}

	public function test_it_should_prioritize_the_custom_request_header() {
		// @codingStandardsIgnoreStart
		// The custom header //should// either be M or ZERO, per
		// <https://github.com/wikimedia/operations-puppet/blob/2a2714c28eab25eed469375dc5322ea6a6ef85df/modules/varnish/templates/text-frontend.inc.vcl.erb#L74-L78>.
		// @codingStandardsIgnoreEnd

		$this->request->setHeader( 'X-Subdomain', 'M' );

		$properties = $this->detectDeviceProperties();

		$this->assertTrue( $properties->isMobileDevice() );
		$this->assertFalse( $properties->isTabletDevice() );
	}

	/**
	 * @FIXME Should this really be the case?
	 */
	public function test_it_should_prioritize_the_amf_environment_variables() {
		$this->request->setHeader( 'X-Subdomain', 'M' );

		$this->server[ 'AMF_DEVICE_IS_TABLET' ] = 'true';

		$properties = $this->detectDeviceProperties();

		$this->assertFalse(
			$properties->isMobileDevice(),
			'Apache Mobile Filter environment variables are prioritized above the custom request header.'
		);
		$this->assertTrue( $properties->isTabletDevice() );
	}

	public function test_it_should_handle_device_detection_being_disabled() {
		$this->setMwGlobals( 'wgMFAutodetectMobileView', false );

		$this->whenTheRequestIsFromAMobileUA();

		$this->assertNull( $this->detectDeviceProperties() );
	}
}
