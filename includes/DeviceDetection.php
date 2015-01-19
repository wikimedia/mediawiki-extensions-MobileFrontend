<?php
/**
 * Mobile device detection code
 *
 * Copyright © 2011 Patrick Reilly
 * https://www.mediawiki.org/
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */

/**
 * Base for classes describing devices and their capabilities
 */
interface IDeviceProperties {
	/**
	 * Default implementation of isMobileDevice()
	 * @return bool
	 */
	function isMobileDevice();

	/**
	 * Whether the device is tablet. If this is true, isMobileDevice() is also true
	 * @return bool
	 */
	function isTablet();
}

/**
 * Base for classes for device detection
 */
interface IDeviceDetector {
	/**
	 * default implementation of detectDeviceProperties()
	 * @param string $userAgent
	 * @param string $acceptHeader
	 * @return IDeviceProperties
	 */
	function detectDeviceProperties( $userAgent, $acceptHeader );
}

/**
 * MobileFrontend's default IDeviceProperties implementation
 */
class DeviceProperties implements IDeviceProperties {
	/**
	 * The user gaent string of current device
	 * @var string
	 */
	private $userAgent;
	/**
	 * Stores the accept headers of current browser.
	 * @var string
	 */
	private $acceptHeader;
	/**
	 * Is this device is a mobile device?
	 * @var boolean
	 */
	private $isMobile = null;
	/**
	 * Stores the answer: Is this device a tablet?
	 * @var boolean
	 */
	private $tablet = null;

	/**
	 * Set parameters to class variables
	 *
	 * @param string $userAgent UserAgent string
	 * @param string $acceptHeader Accept Header
	 */
	public function __construct( $userAgent, $acceptHeader ) {
		$this->userAgent = $userAgent;
		$this->acceptHeader = $acceptHeader;
	}

	/**
	 * Check if device is a mobile device based on current user agent string.
	 * @return bool
	 */
	public function isMobileDevice() {
		if ( is_null( $this->isMobile ) ) {
			$this->isMobile = $this->detectMobileDevice();
		}
		return $this->isMobile;
	}

	/**
	 * Check if device is a tablet based on current user agent string.
	 * @return bool
	 */
	public function isTablet() {
		if ( is_null( $this->tablet ) ) {
			$this->tablet = $this->detectTablet();
		}
		return $this->tablet;
	}

	/**
	 * Detect mobile devices using useragent string
	 * @return bool
	 */
	private function detectMobileDevice() {
		$patterns = array(
			'mobi',
			'240x240',
			'240x320',
			'320x320',
			'alcatel',
			'android',
			'audiovox',
			'bada',
			'benq',
			'blackberry',
			'cdm-',
			'compal-',
			'docomo',
			'ericsson',
			'hiptop',
			'htc[-_]',
			'huawei',
			'ipod',
			'kddi-',
			'kindle',
			'meego',
			'midp',
			'mitsu',
			'mmp\/',
			'mot-',
			'motor',
			'ngm_',
			'nintendo',
			'opera.m',
			'palm',
			'panasonic',
			'philips',
			'phone',
			'playstation',
			'portalmmm',
			'sagem-',
			'samsung',
			'sanyo',
			'sec-',
			'sendo',
			'sharp',
			'silk',
			'softbank',
			'symbian',
			'teleca',
			'up.browser',
			'webos',
		);
		$patternsStart = array(
			'lg-',
			'sie-',
			'nec-',
			'lge-',
			'sgh-',
			'pg-',
		);
		$regex = '/^(' . implode( '|', $patternsStart ) . ')|(' . implode( '|', $patterns ) . ')/i';
		$isMobile = (bool)preg_match( $regex, $this->userAgent );

		return $isMobile;
	}

	/**
	 * Detect mobile devices using useragent string
	 * @return bool
	 */
	private function detectTablet() {
		// The only way to distinguish Android browsers on tablet from Android browsers on
		// mobile is that Android browsers on tablet usually don't include the word
		// "mobile". We look for "mobi" instead of "mobile" due to Opera Mobile. Note that
		// this test fails to detect some obscure tablets such as older Xoom tablets and
		// Portablet tablets. See http://stackoverflow.com/questions/5341637.
		$isAndroid = (bool)preg_match( '/Android/i', $this->userAgent );
		if ( $isAndroid ) {
			$isTablet = !(bool)preg_match( '/mobi/i', $this->userAgent );
		} else {
			$pattern = '/(iPad|Tablet|PlayBook|Wii|Silk)/i';
			$isTablet = (bool)preg_match( $pattern, $this->userAgent );
		}

		return $isTablet;
	}
}

/**
 * This class's descendants should only be instantiated with $wgMFAutodetectMobileView set to true,
 * otherwise all attempts to check for tabletness will lie
 */
abstract class PredefinedDeviceProperties implements IDeviceProperties {
	/**
	 * Overrides isTablet function to create Exception.
	 */
	function isTablet() {
		throw new Exception( __METHOD__ . '() called!' );
	}
}

/**
 * implementation of PredefinedDeviceProperties
 */
class HtmlDeviceProperties extends PredefinedDeviceProperties {
	/**
	 * Returns always true
	 * @return bool
	 */
	function isMobileDevice() {
		return true;
	}
}

/**
 * Provides abstraction for a device.
 * A device can select which format a request should receive and
 * may be extended to provide access to particular device functionality.
 */
class DeviceDetection implements IDeviceDetector {

	/**
	 * Returns an instance of detection class, overridable by extensions
	 * @return IDeviceDetector
	 */
	public static function factory() {
		global $wgDeviceDetectionClass;

		static $instance = null;
		if ( !$instance ) {
			$instance = new $wgDeviceDetectionClass();
		}
		return $instance;
	}

	/**
	 * Create instance of DeviceProperties
	 * @param string $userAgent
	 * @param string $acceptHeader
	 * @return IDeviceProperties
	 */
	public function detectDeviceProperties( $userAgent, $acceptHeader ) {
		return new DeviceProperties( $userAgent, $acceptHeader );
	}
}
