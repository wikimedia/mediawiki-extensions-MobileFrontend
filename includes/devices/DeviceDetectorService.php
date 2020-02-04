<?php

namespace MobileFrontend\Devices;

use Config;
use WebRequest;

/**
 * MobileFrontend's device detector.
 *
 * Detects the properties of a device by iterating over a list, //in order//,
 * child device detectors until one returns a positive result.
 *
 * The order of the child device detectors is defined in
 * `DeviceDetectorService::factory`.
 */
class DeviceDetectorService implements DeviceDetector {

	/**
	 * Given MobileFrontend's configuration, creates a new instance of the device
	 * detector.
	 *
	 * If `$wgMFAutodetectMobileView` is falsy, then no device detection will
	 * occur.
	 *
	 * @param Config $config containing values for MFAutodetectMobileView and MFMobileHeader
	 * @return self
	 */
	public static function factory( Config $config ) {
		$children = [];

		if ( $config->get( 'MFAutodetectMobileView' ) ) {
			array_push(
				$children,
				new AMFDeviceDetector(),
				new CustomHeaderDeviceDetector( $config ),
				new UADeviceDetector()
			);
		}

		return new self( $children );
	}

	/**
	 * @var DeviceDetector[]
	 */
	private $children;

	/**
	 * @param DeviceDetector[] $children
	 */
	public function __construct( array $children ) {
		$this->children = $children;
	}

	/**
	 * @inheritDoc
	 */
	public function detectDeviceProperties( WebRequest $request, array $server ) {
		foreach ( $this->children as $child ) {
			$properties = $child->detectDeviceProperties( $request, $server );

			if ( $properties ) {
				return $properties;
			}
		}
	}
}
