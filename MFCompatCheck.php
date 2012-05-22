<?php
/**
 * This class is intended to track compatibility of functionality in the
 * MobileFrontend extension against different versions of MediaWiki.
 *
 * This is generally useful as MW evolves while MobileFrontend maintains a
 * level of support for older versions, and it will come in particularly handy
 * as MobileFrontend functionality is gradually moved into core.
 *
 * Methods herein are intended to be lightweight, static, and performant. In
 * general, it is preferable to do a version_compare() for functionality,
 * however there are times when that is inappropriate, such as when comparing
 * bleeding edge functionality in core. As core evolves, so to should methods
 * in this class when it becomes possible to adopt version_compare().
 *
 * This class can also serve as an at-a-glance list of compatibility issues
 * and statuses for MobileFrontend.
 */
class MFCompatCheck {

	/**
	 * Check for WebRequest::removeQueryValue()
	 * Awaiting merge into core
	 * @return Bool
	 */
	public static function checkRemoveQueryString() {
		global $wgRequest;
		return is_callable( array( $wgRequest, 'removeQueryValue' ) );
	}

	/**
	 * Check to see if wfIsConfiguredProxy() is available
	 * Available in 1.20alpha as of 05e5a819
	 * @return Bool
	 */
	public static function checkWfIsConfiguredProxy() {
		global $wgVersion;
		return version_compare( $wgVersion, '1.20alpha' , '>=' );
	}

	/**
	 * Check to see if HTMLForm has been updated in core to support multiple
	 * display formats.
	 * @return Bool
	 */
	public static function checkHTMLFormCoreUpdates() {
		return method_exists( 'HTMLForm', 'setDisplayFormat' );
	}
}
