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
	function supportsJQuery();

	/**
	 * @return bool
	 */
	function disableZoom();

	/**
	 * @return bool
	 */
	function isMobileDevice();

	/**
	 * @return string
	 */
	function moduleName();
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
	public function supportsJQuery() {
		return $this->device['supports_jquery'];
	}

	/**
	 * @return bool
	 */
	public function disableZoom() {
		return $this->device['disable_zoom'];
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
			'phone',
			'android',
			'ipod',
			'webos',
			'palm',
			'opera.m',
			'semc-browser',
			'playstation',
			'nintendo',
			'blackberry',
			'bada',
			'meego',
			'vodafone',
			'docomo',
			'samsung',
			'alcatel',
			'motor',
			'huawei',
			'audiovox',
			'philips',
			'mot-',
			'cdm-',
			'sagem-',
			'htc[-_]',
			'ngm_',
			'mmp\/',
			'up.browser',
			'symbian',
			'midp',
			'kindle',
			'softbank',
			'sec-',
			'240x240',
			'240x320',
			'320x320',
			'ericsson',
			'panasonic',
			'hiptop',
			'portalmmm',
			'kddi-',
			'benq',
			'compal-',
			'sanyo',
			'sharp',
			'teleca',
			'mitsu',
			'sendo',
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
}

/**
 * Provides abstraction for a device.
 * A device can select which format a request should receive and
 * may be extended to provide access to particular device functionality.
 */
class DeviceDetection implements IDeviceDetector {

	private static $formats = array (
		'android' => array (
			'view_format' => 'html',
			'css_file_name' => '',
			'supports_jquery' => true,
			'disable_zoom' => false,
		),
		'blackberry' => array (
			'view_format' => 'html',
			'css_file_name' => 'blackberry',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'blackberry-lt5' => array (
			'view_format' => 'html',
			'css_file_name' => 'blackberry',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'capable' => array (
			'view_format' => 'html',
			'css_file_name' => '',
			'supports_jquery' => true,
			'disable_zoom' => true,
		),
		'html' => array (
			'view_format' => 'html',
			'css_file_name' => '',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'ie' => array (
			'view_format' => 'html',
			'css_file_name' => 'ie',
			'supports_jquery' => true,
			'disable_zoom' => false,
		),
		'iphone' => array (
			'view_format' => 'html',
			'css_file_name' => 'iphone',
			'supports_jquery' => true,
			'disable_zoom' => false,
		),
		'kindle' => array (
			'view_format' => 'html',
			'css_file_name' => 'kindle',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'kindle2' => array (
			'view_format' => 'html',
			'css_file_name' => 'kindle',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'netfront' => array (
			'view_format' => 'html',
			'css_file_name' => 'simple',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'nokia' => array (
			'view_format' => 'html',
			'css_file_name' => 'nokia',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'operamini' => array (
			'view_format' => 'html',
			'css_file_name' => 'operamini',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'operamobile' => array (
			'view_format' => 'html',
			'css_file_name' => 'operamobile',
			'supports_jquery' => true,
			'disable_zoom' => true,
		),
		'palm_pre' => array (
			'view_format' => 'html',
			'css_file_name' => '',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'ps3' => array (
			'view_format' => 'html',
			'css_file_name' => 'simple',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'psp' => array (
			'view_format' => 'html',
			'css_file_name' => 'psp',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'wap2' => array (
			'view_format' => 'html',
			'css_file_name' => 'simple',
			'supports_jquery' => false,
			'disable_zoom' => true,
		),
		'webkit' => array (
			'view_format' => 'html',
			'css_file_name' => '',
			'supports_jquery' => true,
			'disable_zoom' => false,
		),
		'wii' => array (
			'view_format' => 'html',
			'css_file_name' => 'wii',
			'supports_jquery' => true,
			'disable_zoom' => true,
		),
		'wml' => array (
			'view_format' => 'wml',
			'css_file_name' => '',
			'supports_jquery' => false,
			'disable_zoom' => true,
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
		if ( isset( self::$formats[$deviceName] ) ) {
			return new DeviceProperties( self::$formats[$deviceName], $userAgent );
		} else {
			return new DeviceProperties( array(
				'view_format' => 'html',
				'css_file_name' => '',
				'supports_jquery' => true,
				'disable_zoom' => true,
			), $userAgent );
		}
	}

	/**
	 * @param $userAgent string
	 * @param $acceptHeader string
	 * @return string
	 */
	public function detectDeviceName( $userAgent, $acceptHeader = '' ) {
		wfProfileIn( __METHOD__ );

		$deviceName = '';
		if ( preg_match( '/Android/', $userAgent ) ) {
			$deviceName = 'android';
			if ( strpos( $userAgent, 'Opera Mini' ) !== false ) {
				$deviceName = 'operamini';
			} elseif ( strpos( $userAgent, 'Opera Mobi' ) !== false ) {
				$deviceName = 'operamobile';
			}
		} elseif ( preg_match( '/MSIE (8|9|1\d)\./', $userAgent ) ) {
			$deviceName = 'ie';
		} elseif( preg_match( '/MSIE/', $userAgent ) ) {
			$deviceName = 'html';
		} elseif ( strpos( $userAgent, 'Opera Mobi' ) !== false ) {
			$deviceName = 'operamobile';
		} elseif ( preg_match( '/iPad.* Safari/', $userAgent ) ) {
			$deviceName = 'iphone';
		} elseif ( preg_match( '/iPhone.* Safari/', $userAgent ) ) {
			$deviceName = 'iphone';
		} elseif ( preg_match( '/iPhone/', $userAgent ) ) {
			if ( strpos( $userAgent, 'Opera' ) !== false ) {
				$deviceName = 'operamini';
			} else {
				$deviceName = 'capable';
			}
		} elseif ( preg_match( '/WebKit/', $userAgent ) ) {
			if ( preg_match( '/Series60/', $userAgent ) ) {
				$deviceName = 'nokia';
			} elseif ( preg_match( '/webOS/', $userAgent ) ) {
				$deviceName = 'palm_pre';
			} else {
				$deviceName = 'webkit';
			}
		} elseif ( preg_match( '/Opera/', $userAgent ) ) {
			if ( strpos( $userAgent, 'Nintendo Wii' ) !== false ) {
				$deviceName = 'wii';
			} elseif ( strpos( $userAgent, 'Opera Mini' ) !== false ) {
				$deviceName = 'operamini';
			} else {
				$deviceName = 'operamobile';
			}
		} elseif ( preg_match( '/Kindle\/1.0/', $userAgent ) ) {
			$deviceName = 'kindle';
		} elseif ( preg_match( '/Kindle\/2.0/', $userAgent ) ) {
			$deviceName = 'kindle2';
		} elseif ( preg_match( '/Firefox|Maemo Browser|Fennec/', $userAgent ) ) {
			$deviceName = 'capable';
		} elseif ( preg_match( '/NetFront/', $userAgent ) ) {
			$deviceName = 'netfront';
		} elseif ( preg_match( '/SEMC-Browser/', $userAgent ) ) {
			$deviceName = 'wap2';
		} elseif ( preg_match( '/Series60/', $userAgent ) ) {
			$deviceName = 'wap2';
		} elseif ( preg_match( '/PlayStation Portable/', $userAgent ) ) {
			$deviceName = 'psp';
		} elseif ( preg_match( '/PLAYSTATION 3/', $userAgent ) ) {
			$deviceName = 'ps3';
		} elseif ( preg_match( '/SAMSUNG/', $userAgent ) ) {
			$deviceName = 'capable';
		} elseif ( preg_match( '/BlackBerry/', $userAgent ) ) {
			if( preg_match( '/BlackBerry[^\/]*\/[1-4]\./', $userAgent ) ) {
				$deviceName = 'blackberry-lt5';
			} else {
				$deviceName = 'blackberry';
			}
		}

		if ( $deviceName === '' ) {
			if ( strpos( $acceptHeader, 'application/vnd.wap.xhtml+xml' ) !== false ) {
				// Should be wap2
				$deviceName = 'html';
			} elseif ( strpos( $acceptHeader, 'vnd.wap.wml' ) !== false ) {
				$deviceName = 'wml';
			} else {
				$deviceName = 'html';
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
