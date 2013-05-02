<?php

/**
 * Provides device-specific CSS
 * Only added to output when $wgMFVaryResources = true
 */
class MobileDeviceDetectModule extends ResourceLoaderFileModule {
	protected $xDevice = null;

	protected function init( ResourceLoaderContext $context ) {
		if ( is_null( $this->xDevice ) ) {
			// @todo: Autodetection for third parties?
			$this->xDevice = MobileContext::singleton()->getXDevice();
			if ( $this->xDevice ) {
				$response = $context->getRequest()->response();
				$response->header( 'Vary: Accept-Encoding,X-Device' );
				$response->header( "X-Device: {$this->xDevice}" );
			} else {
				wfDebugLog( 'mobile', "MobileFrontendDeviceDetectModule: no X-Device header found" );
			}
		}
	}

	public function getStyles( ResourceLoaderContext $context ) {
		$this->init( $context );

		if ( $this->xDevice ) {
			$device = MobileContext::singleton()->getDevice();
			$file = "stylesheets/devices/{$device->cssFileName()}";
			if ( $file ) {
				$this->styles[] = $file;
			}
		}
		return parent::getStyles( $context );
	}
}
