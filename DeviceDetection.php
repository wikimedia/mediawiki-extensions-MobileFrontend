<?php
/**
 * Extension MobileFrontend — Device Detection
 *
 * @file
 * @ingroup Extensions
 * @author Patrick Reilly
 * @copyright © 2011 Patrick Reilly
 * @licence GNU General Public Licence 2.0 or later
 */

// Provides an abstraction for a device 
// A device can select which format a request should recieve and
// may be extended to provide access to particular devices functionality
class DeviceDetection {
	
	public function availableFormats() {		
		$formats = array (
			  'html' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'default',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'capable' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'default',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'simplehtml' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'simple',
				'footmenu' => 'simple',
				'with_layout' => 'application',
				'css_file_name' => 'simple',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'webkit' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'webkit',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'webkit',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'webkit_old' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'webkit_old',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'android' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'android',
				'supports_javascript' => true,
				'disable_zoom' => false,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'iphone' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'webkit',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'iphone',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'iphone2' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'iphone2',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'native_iphone' => 
			  array (
				'view_format' => 'html',
				'search_bar' => false,
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'default',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => false,
			  ),
			  'palm_pre' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'palm_pre',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'kindle' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'kindle',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'kindle',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'kindle2' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'kindle',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'kindle',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'blackberry' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'default',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'blackberry',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'netfront' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'simple',
				'footmenu' => 'simple',
				'with_layout' => 'application',
				'css_file_name' => 'simple',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'wap2' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'simple',
				'footmenu' => 'simple',
				'with_layout' => 'application',
				'css_file_name' => 'simple',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'psp' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'simple',
				'footmenu' => 'simple',
				'with_layout' => 'application',
				'css_file_name' => 'psp',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'ps3' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'simple',
				'footmenu' => 'simple',
				'with_layout' => 'application',
				'css_file_name' => 'simple',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'wii' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'wii',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'wii',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'operamini' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'simple',
				'footmenu' => 'simple',
				'with_layout' => 'application',
				'css_file_name' => 'operamini',
				'supports_javascript' => false,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'nokia' => 
			  array (
				'view_format' => 'html',
				'search_bar' => 'webkit',
				'footmenu' => 'default',
				'with_layout' => 'application',
				'css_file_name' => 'nokia',
				'supports_javascript' => true,
				'disable_zoom' => true,
				'parser' => 'html',
				'disable_links' => true,
			  ),
			  'wml' => 
			  array (
				'view_format' => 'wml',
				'search_bar' => 'wml',
				'supports_javascript' => false,
				'parser' => 'wml',
			  ),
			);
		return $formats;
	}
	
	public function format( $formatName ) {
		$format = $this->availableFormats();
		return ( isset( $format[$formatName] ) ) ? $format[$formatName] : array();
	}
	
	public function testFormatName() {
		$testResults = '';
		
		$userAgents = array();
		$userAgents['android']   = 'Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17';
		$userAgents['iphone2']   = 'Mozilla/5.0 (ipod: U;CPU iPhone OS 2_2 like Mac OS X: es_es) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.0 Mobile/3B48b Safari/419.3';
		$userAgents['iphone']    = 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3B48b Safari/419.3';
		$userAgents['nokia']     = 'Mozilla/5.0 (SymbianOS/9.1; U; [en]; SymbianOS/91 Series60/3.0) AppleWebKit/413 (KHTML, like Gecko) Safari/413';
		$userAgents['palm_pre']  = 'Mozilla/5.0 (webOS/1.0; U; en-US) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Safari/525.27.1 Pre/1.0';
		$userAgents['wii']       = 'Opera/9.00 (Nintendo Wii; U; ; 1309-9; en)';
		$userAgents['operamini'] = 'Opera/9.50 (J2ME/MIDP; Opera Mini/4.0.10031/298; U; en)';
		$userAgents['iphone']    = 'Opera/9.51 Beta (Microsoft Windows; PPC; Opera Mobi/1718; U; en)';
		$userAgents['kindle']    = 'Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)';
		$userAgents['kindle2']   = 'Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.0 (screen 824x1200; rotate)';
		$userAgents['capable']   = 'Mozilla/5.0 (X11; Linux i686; rv:2.0.1) Gecko/20100101 Firefox/4.0.1';
		$userAgents['netfront']  = 'Mozilla/4.08 (Windows; Mobile Content Viewer/1.0) NetFront/3.2';
		$userAgents['wap2']      = 'SonyEricssonK608i/R2L/SN356841000828910 Browser/SEMC-Browser/4.2 Profile/MIDP-2.0 Configuration/CLDC-1.1';
		$userAgents['wap2']      = 'NokiaN73-2/3.0-630.0.2 Series60/3.0 Profile/MIDP-2.0 Configuration/CLDC-1.1';
		$userAgents['psp']       = 'Mozilla/4.0 (PSP (PlayStation Portable); 2.00)';
		$userAgents['ps3']       = 'Mozilla/5.0 (PLAYSTATION 3; 1.00)';
		
		foreach ( $userAgents as $formatName => $userAgent ) {
			if ( $this->formatName( $userAgent ) === $formatName ) {
				$result = ' has PASSED!';
			} else {
				$result = ' has FAILED!';
			}
			
			$testResults .= $formatName . $result . '<br/>' . PHP_EOL;
		}
		return $testResults;
	}

	public function formatName( $userAgent, $acceptHeader = '' ) {
		$formatName = '';

		if ( preg_match( '/Android/', $userAgent ) ) {
			$formatName = 'android';
		} elseif ( preg_match( '/iPhone.* Safari/', $userAgent ) ) {
			if ( strpos( $userAgent, 'iPhone OS 2' ) !== false ) {
				$formatName = 'iphone2';
			} else {
				$formatName = 'iphone';
			}
		} elseif ( preg_match( '/iPhone/', $userAgent ) ) {
			if ( strpos( $userAgent, 'Opera' ) !== false ) {
				$formatName = 'operamini';
			} else {
				$formatName = 'native_iphone';
			}
		} elseif ( preg_match( '/WebKit/', $userAgent ) ) {
			if ( preg_match( '/Series60/', $userAgent ) ) {
				$formatName = 'nokia';
			} elseif ( preg_match( '/webOS/', $userAgent ) ) {
				$formatName = 'palm_pre';
			} else {
				$formatName = 'webkit';
			}
		} elseif ( preg_match( '/Opera/', $userAgent ) ) {
			if ( strpos( $userAgent, 'Nintendo Wii' ) !== false ) {
				$formatName = 'wii';
			} elseif ( strpos( $userAgent, 'Opera Mini' ) !== false ) { 
				$formatName = 'operamini';
			} elseif ( strpos( $userAgent, 'Opera Mobi' ) !== false ) {
				$formatName = 'iphone';
			} else {
				$formatName = 'webkit';
			}
		} elseif ( preg_match( '/Kindle\/1.0/', $userAgent ) ) {
			$formatName = 'kindle';
		} elseif ( preg_match( '/Kindle\/2.0/', $userAgent ) ) {
			$formatName = 'kindle2';
		} elseif ( preg_match( '/Firefox/', $userAgent ) ) {
			$formatName = 'capable';
		} elseif ( preg_match( '/NetFront/', $userAgent ) ) {
			$formatName = 'netfront';
		} elseif ( preg_match( '/SEMC-Browser/', $userAgent ) ) {
			$formatName = 'wap2';
		} elseif ( preg_match( '/Series60/', $userAgent ) ) {
			$formatName = 'wap2';
		} elseif ( preg_match( '/PlayStation Portable/', $userAgent ) ) {
			$formatName = 'psp';
		} elseif ( preg_match( '/PLAYSTATION 3/', $userAgent ) ) {
			$formatName = 'ps3';
		} elseif ( preg_match( '/SAMSUNG/', $userAgent ) ) {
		    $formatName = 'html';
		} elseif ( preg_match( '/BlackBerry/', $userAgent ) ) {
			$formatName = 'blackberry';
		}
		
		if ( $formatName === '' ) {
			if ( strpos( $acceptHeader, 'application/vnd.wap.xhtml+xml' ) !== false ) {
				$formatName = 'html';
			} elseif ( strpos( $acceptHeader, 'vnd.wap.wml' ) !== false ) {
				$formatName = 'wml';
			} else {
				$formatName = 'html';
			}
		}
		return $formatName;
	}
}