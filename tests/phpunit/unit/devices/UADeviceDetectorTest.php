<?php

namespace Tests\MobileFrontend\Devices;

use FauxRequest;
use MobileFrontend\Devices\UADeviceDetector;

/**
 * @group MobileFrontend
 */
class UADeviceDetectorTest extends \MediaWikiUnitTestCase {

	/**
	 * @var UADeviceDetector
	 */
	private $detector;

	/**
	 * @var FauxRequest
	 */
	private $request;

	protected function setUp() {
		parent::setUp();

		$this->detector = new UADeviceDetector();
		$this->request = new FauxRequest();
	}

	/**
	 * Creates the list of arguments expected to be returned by a PHPUnit data
	 * provider from a list of UAs.
	 *
	 * @param string[] $userAgents
	 * @return array
	 */
	private static function provideUserAgents( $userAgents ) {
		return array_map(
			function ( $userAgent ) {
				return [ $userAgent ];
			},
			$userAgents
		);
	}

	public static function provideMobileUserAgents() {
		// @codingStandardsIgnoreStart
		return self::provideUserAgents( [
			// Android
			'Mozilla/5.0 (Linux; U; Android 2.3.3; zh-tw; HTC_Pyramid Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
			'Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
			// Firefox OS (bug 40919)
			'Mozilla/5.0 (Mobile; rv:14.0) Gecko/14.0 Firefox/14.0',
			'Mozilla/5.0 (Android; Mobile; rv:20.0) Gecko/20.0 Firefox/20.0',
			// Blackberry 10 (bug 40513)
			'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.3+ (KHTML, like Gecko) Version/10.0.9.386 Mobile Safari/537.3+',
			'Mozilla/5.0 (BlackBerry; U; BlackBerry 9850; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.254 Mobile Safari/534.11+',
			// Windows Phone 8 / IE 10 (bug 41517)
			'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; ARM; Touch; IEMobile/10.0; <Manufacturer>; <Device> [;<Operator>])',
			// Others
			'Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17',
			'Mozilla/5.0 (ipod: U;CPU iPhone OS 2_2 like Mac OS X: es_es) AppleWebKit/525.18.1 (KHTML, like Gecko) Version/3.0 Mobile/3B48b Safari/419.3',
			'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3B48b Safari/419.3',
			'Mozilla/5.0 (SymbianOS/9.1; U; [en]; SymbianOS/91 Series60/3.0) AppleWebKit/413 (KHTML, like Gecko) Safari/413',
			'Mozilla/5.0 (webOS/1.0; U; en-US) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Safari/525.27.1 Pre/1.0',
			'Vodafone/1.0/LG-KU990/V10iBrowser/Obigo-Q05A/3.6 MMS/LG-MMS-V1.0/1.2 Java/ASVM/1.0 Profile/MIDP-2.0Configuration/CLDC-1.1',
			'Vodafone/1.0/0Vodafone543/ V010 05/MIDP-2.0 Configuration/CLDC-1.1 ObigoInternetBrowser/Q03C',
			'DoCoMo/2.0 P07A3(c500;TB;W24H15)',
			'KDDI-HI31 UP.Browser/6.2.0.5 (GUI) MMP/2.0',
			'Mozilla/4.0 (compatible; MSIE 6.0; KDDI-SA39) Opera 8.60 [ja]',
			// Opera
			'Opera/9.50 (J2ME/MIDP; Opera Mini/4.0.10031/298; U; en)',
			'Opera/9.80 (iPhone; Opera Mini/7.0.4/28.2555; U; fr) Presto/2.8.119 Version/11.10',
			'Opera/9.51 Beta (Microsoft Windows; PPC; Opera Mobi/1718; U; en)',
			'Opera/9.80 (Android 4.1.1; Linux; Opera Mobi/ADR-1301080958) Presto/2.11.355 Version/12.10',
			'Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)',
			'Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.0 (screen 824x1200; rotate)',
			// Later Kindles use WebKit
			'Mozilla/5.0 (Linux; U; en-US) AppleWebKit/528.5+ (KHTML, like Gecko, Safari/528.5+) Version/4.0 Kindle/3.0 (screen 600X800; rotate)',
			'Mozilla/4.08 (Windows; Mobile Content Viewer/1.0) NetFront/3.2',
			'SonyEricssonK608i/R2L/SN356841000828910 Browser/SEMC-Browser/4.2 Profile/MIDP-2.0 Configuration/CLDC-1.1',
			'NokiaN73-2/3.0-630.0.2 Series60/3.0 Profile/MIDP-2.0 Configuration/CLDC-1.1',
			'Mozilla/4.0 (PSP (PlayStation Portable); 2.00)',
			'Mozilla/5.0 (PLAYSTATION 3; 1.00)',
			// Blackberry
			'BlackBerry9300/5.0.0.716 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/133',
			'BlackBerry7250/4.0.0 Profile/MIDP-2.0 Configuration/CLDC-1.1',
			// T32827
			'SAMSUNG-S8000/S800MXEJA1 SHP/VPP/R5 Jasmine/1.0 Nextreaming SMM-MMS/1.2.0 profile/MIDP-2.1 configuration/CLDC-1.1 SS-Widget/S8000-FM',
			// WML
			'KDDI-KC31 UP.Browser/6.2.0.5 (GUI) MMP/2.0',
		] );
		// @codingStandardsIgnoreEnd
	}

	public static function provideDesktopUserAgents() {
		// @codingStandardsIgnoreStart
		return self::provideUserAgents( [
			'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.7) Gecko/20060928 (Debian|Debian-1.8.0.7-1) Epiphany/2.14',
			'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)',
			'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
			'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.205 Safari/534.16',
			'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.6) Gecko/20070817 IceWeasel/2.0.0.6-g2',
			'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.11) Gecko/20071203 IceCat/2.0.0.11-g1',
			'Mozilla/5.0 (compatible; Konqueror/4.3; Linux) KHTML/4.3.5 (like Gecko)',
			'Links (2.2; GNU/kFreeBSD 6.3-1-486 i686; 80x25)',
			'Lynx/2.8.6rel.4 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/0.9.8g',
			'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:16.0) Gecko/20120815 Firefox/16.0',
			'Opera/9.80 (Windows NT 6.1; U; ru) Presto/2.8.131 Version/11.10',
			'Mozilla/5.0 (Macintosh; I; Intel Mac OS X 10_6_7; ru-ru) AppleWebKit/534.31+ (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
			'w3m/0.5.1',
			'Googlebot/2.1 (+http://www.google.com/bot.html)',
			'Mozilla/5.0 (compatible; googlebot/2.1; +http://www.google.com/bot.html)',
			'Wget/1.9',
			'Mozilla/5.0 (compatible; YandexBot/3.0)',
		] );
		// @codingStandardsIgnoreEnd
	}

	public static function provideTabletUserAgents() {
		// @codingStandardsIgnoreStart
		return self::provideUserAgents( [
			// iPad
			'Mozilla/5.0 (iPad; CPU OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A501 Safari/9537.53',
			// Motorola Xoom
			'Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13',
			// Opera Mobile running on a tablet
			'Opera/9.80 (Android 4.0.4; Linux; Opera Tablet/ADR-1301080958) Presto/2.11.355 Version/12.10',
			// Firefox running on a tablet
			'Mozilla/5.0 (Android; Tablet; rv:24.0) Gecko/24.0 Firefox/24.0',
			// Nintendo Wii
			'Opera/9.00 (Nintendo Wii; U; ; 1309-9; en)',
			'Mozilla/5.0 (Nintendo WiiU) AppleWebKit/536.28 (KHTML, like Gecko) NX/3.0.3.12.6 NintendoBrowser/2.0.0.9362.EU',
			// Samsung Galaxy Tab
			'Mozilla/5.0 (Linux; U; Android 4.2.2; nl-nl; GT-P5210 Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
			// Kindle Fire, Silk browser operating in "desktop" mode
			// (Silk operating in "mobile" mode will only be detected as a mobile device.)
			'Mozilla/5.0 (Linux; U; en-us; KFTT Build/IML74K) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.4 Safari/535.19 Silk-Accelerated=true',
		] );
		// @codingStandardsIgnoreEnd
	}

	private function detectDeviceProperties( $userAgent ) {
		$this->request->setHeader( 'User-Agent', $userAgent );

		return $this->detector->detectDeviceProperties( $this->request, [] );
	}

	/**
	 * @dataProvider provideMobileUserAgents
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectMobileDevice
	 */
	public function testItClassifiesMobileUAsAsMobileDevices( $userAgent ) {
		$this->assertTrue(
			$this->detectDeviceProperties( $userAgent )
				->isMobileDevice()
		);
	}

	/**
	 * @dataProvider provideDesktopUserAgents
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectDeviceProperties
	 */
	public function testItDoesntClassifyDesktopUAsAsMobileDevices( $userAgent ) {
		$this->assertFalse(
			$this->detectDeviceProperties( $userAgent )
				->isMobileDevice()
		);
	}

	/**
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectMobileDevice
	 */
	public function testItDoesntClassifySamsungSmartTVsAsMobileDevices() {
		$properties = $this->detectDeviceProperties(
			// @codingStandardsIgnoreStart
			'Mozilla/5.0 (SMART-TV; Linux; Tizen 2.3) AppleWebkit/538.1 (KHTML, like Gecko) SamsungBrowser/1.0 TV Safari/538.1'
			// @codingStandardsIgnoreEnd
		);

		$this->assertFalse( $properties->isMobileDevice() );

		// ---

		$properties = $this->detectDeviceProperties(
			// @codingStandardsIgnoreStart
			'Mozilla/5.0 (Linux; Android 4.2.2; nl-nl; SAMSUNG GT-I9505 Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Version/1.0 Chrome/18.0.1025.308 Mobile Safari/535.19'
			// @codingStandardsIgnoreEnd
		);

		$this->assertTrue( $properties->isMobileDevice() );
	}

	/**
	 * @dataProvider provideMobileUserAgents
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectTabletDevice
	 */
	public function testItDoesntClassifyMobileUAsAsTablets( $userAgent ) {
		$this->assertFalse(
			$this->detectDeviceProperties( $userAgent )
				->isTabletDevice()
		);
	}

	/**
	 * @dataProvider provideTabletUserAgents
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectDeviceProperties
	 * @covers \MobileFrontend\Devices\UADeviceDetector::detectTabletDevice
	 */
	public function testItClassifiesTabletUAsAsTablets( $userAgent ) {
		$this->assertTrue(
			$this->detectDeviceProperties( $userAgent )
				->isTabletDevice()
		);
	}
}
