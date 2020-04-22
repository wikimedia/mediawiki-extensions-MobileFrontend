<?php

namespace MobileFrontend\Devices;

use Config;
use WebRequest;

/**
 * Detects mobile devices by testing whether a custom request header is present.
 *
 * @note See README.md for more detail on `$wgMFMobileHeader`.
 */
class CustomHeaderDeviceDetector implements DeviceDetector {

	/**
	 * The name of the custom request header.
	 *
	 * @var string
	 */
	private $customHeaderName;

	/**
	 * @param Config $config The global config. Currently this can be any instance
	 *  of `GlobalVarConfig`.
	 *
	 * @todo In future, however, this should probably be a MobileFrontend-specific
	 * instance. `GlobalVarConfig#__construct` accepts a custom prefix to avoid
	 * repeating prefixes in `#get` calls, e.g.
	 *
	 * ```
	 * $config = new GlobalVarConfig();
	 * $mobileFrontendConfig = new GlobalVarConfig( 'wgMF' );
	 *
	 * assert(
	 *   $config->get( 'MFMobileHeader' )
	 *   === $mobileFrontendConfig->get( 'MobileHeader' )
	 * );
	 * ```
	 */
	public function __construct( Config $config ) {
		$this->customHeaderName = $config->get( 'MFMobileHeader' );
	}

	/**
	 * @inheritDoc
	 */
	public function detectDeviceProperties( WebRequest $request, array $server ) {
		if (
			$this->customHeaderName
			&& $request->getHeader( $this->customHeaderName ) !== false
		) {
			return new DeviceProperties( true, false );
		}
	}
}
