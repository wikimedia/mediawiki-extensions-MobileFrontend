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
	 * @return string: 'html' or 'wml'
	 */
	function format();

	/**
	 * @return bool
	 */
	function isMobileDevice();

}

interface IDeviceDetector {
	/**
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
	private $userAgent,
		$acceptHeader,
		$isMobile = null,
		$format = null;

	public function __construct( $userAgent, $acceptHeader ) {
		$this->userAgent = $userAgent;
		$this->acceptHeader = $acceptHeader;
	}

	/**
	 * @return string
	 */
	public function format() {
		wfProfileIn( __METHOD__ );
		if ( !$this->format ) {
			$this->format = $this->detectFormat( $this->userAgent, $this->acceptHeader );
		}
		wfProfileOut( __METHOD__ );
		return $this->format;
	}

	/**
	 * @return string
	 */
	protected function detectFormat() {
		if ( strpos( $this->acceptHeader, 'vnd.wap.wml' ) !== false
			&& strpos( $this->acceptHeader, 'text/html' ) === false
			&& strpos( $this->acceptHeader, 'application/vnd.wap.xhtml+xml' ) === false )
		{
			return 'wml';
		}
		return 'html';
	}

	/**
	 * @return bool
	 */
	public function isMobileDevice() {
		if ( is_null( $this->isMobile ) ) {
			$this->isMobile = $this->detectMobileDevice();
		}
		return $this->isMobile;
	}

	/**
	 * @return bool
	 */
	private function detectMobileDevice() {
		wfProfileIn( __METHOD__ );

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

		wfProfileOut( __METHOD__ );
		return $isMobile;
	}
}

class HtmlDeviceProperties implements IDeviceProperties {

	/**
	 * @return string
	 */
	function format() {
		return 'html';
	}

	/**
	 * @return bool
	 */
	function isMobileDevice() {
		return true;
	}
}

class WmlDeviceProperties implements IDeviceProperties {

	/**
	 * @return string
	 */
	function format() {
		return 'wml';
	}

	/**
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
	 * @param string $userAgent
	 * @param string $acceptHeader
	 * @return IDeviceProperties
	 */
	public function detectDeviceProperties( $userAgent, $acceptHeader ) {
		return new DeviceProperties( $userAgent, $acceptHeader );
	}
}
