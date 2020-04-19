<?php

namespace MobileFrontend\Devices;

use WebRequest;

/**
 * Detect mobile and tablet devices using environment variables set by the
 * Apache Mobile Filter (AMF) module.
 *
 * @link http://wiki.apachemobilefilter.org/index.php/Main_Page
 */
class AMFDeviceDetector implements DeviceDetector {

	/**
	 * @inheritDoc
	 */
	public function detectDeviceProperties( WebRequest $request, array $server ) {
		$hasIsMobile = isset( $server['AMF_DEVICE_IS_MOBILE'] );
		$hasIsTablet = isset( $server['AMF_DEVICE_IS_TABLET'] );

		if ( !$hasIsMobile && !$hasIsTablet ) {
			return null;
		}

		$isMobileDevice = $hasIsMobile
			&& $server['AMF_DEVICE_IS_MOBILE'] === 'true';

		$isTabletDevice = $hasIsTablet
			&& $server['AMF_DEVICE_IS_TABLET'] === 'true';

		return new DeviceProperties( $isMobileDevice, $isTabletDevice );
	}
}
