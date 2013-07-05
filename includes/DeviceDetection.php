<?php
/**
 * Mobile device detection code
 *
 * Copyright © 2011 Patrick Reilly
 * http://www.mediawiki.org/
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

	/**
	 * @return string
	 */
	function moduleName();

	/**
	 * @return string
	 */
	function cssFileName();
}

interface IDeviceDetector {
	/**
	 * @param $userAgent
	 * @param string $acceptHeader
	 * @return IDeviceProperties
	 */
	function detectDeviceProperties( $userAgent, $acceptHeader = '' );

	/**
	 * @param $deviceName
	 * @param $userAgent
	 *
	 * @return IDeviceProperties
	 */
	function getDeviceProperties( $deviceName, $userAgent );

	/**
	 * @return array
	 */
	function getCssFiles();
}

/**
 * MediaWiki's default IDeviceProperties implementation
 */
final class DeviceProperties implements IDeviceProperties {
	private $device,
		$userAgent,
		$isMobile = null;

	public function __construct( array $deviceCapabilities, $userAgent ) {
		$this->device = $deviceCapabilities;
		$this->userAgent = $userAgent;
	}

	/**
	 * @return string
	 */
	public function format() {
		return $this->device['view_format'];
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

	/**
	 * @return string
	 */
	public function moduleName() {
		if ( isset( $this->device['css_file_name'] ) &&
				$this->device['css_file_name'] ) {
			return "mobile.device.{$this->device['css_file_name']}";
		} else {
			return '';
		}
	}

	/**
	 * @return string
	 */
	public function cssFileName() {
		if ( isset( $this->device['css_file_name'] ) &&
			$this->device['css_file_name'] ) {
			return "{$this->device['css_file_name']}.css";
		} else {
			return '';
		}
	}
}

/**
 * Provides abstraction for a device.
 * A device can select which format a request should receive and
 * may be extended to provide access to particular device functionality.
 */
class DeviceDetection implements IDeviceDetector {

	private static $formats = array (
		'generic' => array (
			'view_format' => 'html',
		),

		'android' => array (
			'view_format' => 'html',
		),
		'blackberry' => array (
			'view_format' => 'html',
		),
		'ie' => array (
			'view_format' => 'html',
		),
		'iphone' => array (
			'view_format' => 'html',
		),
		'kindle' => array (
			'view_format' => 'html',
		),
		'netfront' => array (
			'view_format' => 'html',
		),
		'nokia' => array (
			'view_format' => 'html',
		),
		'operamini' => array (
			'view_format' => 'html',
		),
		'operamobile' => array (
			'view_format' => 'html',
		),
		'palm_pre' => array (
			'view_format' => 'html',
		),
		'webkit' => array (
			'view_format' => 'html',
		),
		'wml' => array (
			'view_format' => 'wml',
		),
	);

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
	 * @param $userAgent
	 * @param string $acceptHeader
	 * @return IDeviceProperties
	 */
	public function detectDeviceProperties( $userAgent, $acceptHeader = '' ) {
		$deviceName = $this->detectDeviceName( $userAgent, $acceptHeader );
		return $this->getDeviceProperties( $deviceName, $userAgent );
	}

	/**
	 * @param $deviceName
	 * @param $userAgent
	 *
	 * @return IDeviceProperties
	 */
	public function getDeviceProperties( $deviceName, $userAgent ) {
		if ( !isset( self::$formats[$deviceName] ) ) {
			$deviceName = 'generic';
		}
		return new DeviceProperties( self::$formats[$deviceName], $userAgent );
	}

	/**
	 * @param $userAgent string
	 * @param $acceptHeader string
	 * @return string
	 */
	public function detectDeviceName( $userAgent, $acceptHeader = '' ) {
		wfProfileIn( __METHOD__ );

		$deviceName = '';

		// These regexes come roughly  in order of popularity per
		// http://stats.wikimedia.org/wikimedia/squids/SquidReportClients.htm
		// to reduce the average number of regexes per user-agent.
		if ( strpos( $userAgent, 'Safari' ) !== false ) {
			if ( strpos( $userAgent, 'iPhone' ) !== false
				|| strpos( $userAgent, 'iPad' ) !== false
			) {
				$deviceName = 'iphone';
			} elseif ( strpos( $userAgent, 'Android' ) !== false ) {
				$deviceName = 'android';
			} elseif ( strpos( $userAgent, 'Series60' ) !== false ) {
				$deviceName = 'nokia';
			} elseif ( strpos( $userAgent, 'webOS' ) !== false ) {
				$deviceName = 'palm_pre';
			} else {
				$deviceName = 'webkit';
			}
		} elseif ( strpos( $userAgent, 'Opera/' ) !== false ) {
			if ( strpos( $userAgent, 'Opera Mini' ) !== false ) {
				$deviceName = 'operamini';
			} elseif ( strpos( $userAgent, 'Opera Mobi' ) !== false ) {
				$deviceName = 'operamobile';
			} elseif ( strpos( $userAgent, 'Wii' ) !== false ) {
				$deviceName = 'operamobile';
			} else {
				$deviceName = 'generic'; // Desktop Opera
			}
		} elseif ( strpos( $userAgent, 'BlackBerry' ) !== false ) {
			$deviceName = 'blackberry';
		} elseif ( strpos( $userAgent, 'NetFront' ) !== false ) {
			if ( strpos( $userAgent, 'Kindle' ) !== false ) {
				$deviceName = 'kindle';
			} else {
				$deviceName = 'netfront';
			}
		} elseif ( strpos( $userAgent, 'MSIE' ) !== false ) {
			$deviceName = 'ie';
		}

		if ( $deviceName === '' ) {
			if ( strpos( $acceptHeader, 'application/vnd.wap.xhtml+xml' ) !== false ) {
				$deviceName = 'generic';
			} elseif ( strpos( $acceptHeader, 'vnd.wap.wml' ) !== false ) {
				$deviceName = 'wml';
			} else {
				$deviceName = 'generic';
			}
		}
		wfProfileOut( __METHOD__ );
		return $deviceName;
	}

	/**
	 * @return array: List of all device-specific stylesheets
	 */
	public function getCssFiles() {
		$files = array();

		foreach ( self::$formats as $dev ) {
			if ( isset( $dev['css_file_name'] ) ) {
				$files[] = $dev['css_file_name'];
			}
		}
		return array_unique( $files );
	}
}
