<?php

/**
 * @group MobileFrontend
 */
class MobileContextTest extends MediaWikiTestCase {
	/**
	* PHP 5.3.2 introduces the ReflectionMethod::setAccessible() method to allow the invocation of
	* protected and private methods directly through the Reflection API
	 *
	 * @param $name string
	 * @return \ReflectionMethod
	 */
	protected static function getMethod( $name ) {
		$class = new ReflectionClass( 'MobileContext' );
		$method = $class->getMethod( $name );
		$method->setAccessible( true );
		return $method;
	}

	protected function setUp() {
		parent::setUp();
		$context = new DerivativeContext( RequestContext::getMain() );
		$context->setRequest( new FauxRequest() );
		MobileContext::singleton()->setContext( $context );
	}

	protected function tearDown() {
		MobileContext::setInstance( null ); //refresh it
		parent::tearDown();
	}

	public function testGetBaseDomain() {
		MobileContext::singleton()->getRequest()->setHeader( 'Host', 'en.wikipedia.org' );
		$this->assertEquals( '.wikipedia.org', MobileContext::singleton()->getBaseDomain() );
		MobileContext::singleton()->getRequest()->setHeader( 'Host', 'en.m.wikipedia.org' );
		$this->assertEquals( '.wikipedia.org', MobileContext::singleton()->getBaseDomain() );
	}

	public function testGetMobileUrl() {
		global $wgMobileUrlTemplate;
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2";
		$this->assertEquals( 'http://en.m.wikipedia.org/wiki/Article', MobileContext::singleton()->getMobileUrl( 'http://en.wikipedia.org/wiki/Article' ) );
		$this->assertEquals( '//en.m.wikipedia.org/wiki/Article', MobileContext::singleton()->getMobileUrl( '//en.wikipedia.org/wiki/Article' ) );
	}

	public function testParseMobileUrlTemplate() {
		global $wgMobileUrlTemplate;
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2/path/morepath";
		$this->assertEquals( '%h0.m.%h1.%h2', MobileContext::singleton()->parseMobileUrlTemplate( 'host' ) );
		$this->assertEquals( '/path/morepath', MobileContext::singleton()->parseMobileUrlTemplate( 'path' ) );
		$this->assertEquals( array( 'host' => '%h0.m.%h1.%h2', 'path' => '/path/morepath' ), MobileContext::singleton()->parseMobileUrlTemplate() );
	}

	public function testUpdateMobileUrlHost() {
		global $wgMobileUrlTemplate;
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlHost" );
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2";
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( MobileContext::singleton(), array( &$parsedUrl ) );
		$this->assertEquals( "http://en.m.wikipedia.org/wiki/Gustavus_Airport", wfAssembleUrl( $parsedUrl ) );
	}

	/**
	 * @dataProvider updateDesktopUrlQueryProvider
	 */
	public function testUpdateDesktopUrlQuery( $mobile, $desktop ) {
		$updateDesktopUrlQuery = self::getMethod( "updateDesktopUrlQuery" );
		$parsedUrl = wfParseUrl( $mobile );
		$updateDesktopUrlQuery->invokeArgs( MobileContext::singleton(), array( &$parsedUrl ) );
		$url =  wfAssembleUrl( $parsedUrl );
		$this->assertEquals( $desktop, $url );
	}

	public function updateDesktopUrlQueryProvider() {
		return array(
			array( 'http://en.m.wikipedia.org/wiki/Gustavus_Airport?useformat=mobile&mobileaction=toggle_desktop_view', 'http://en.m.wikipedia.org/wiki/Gustavus_Airport?mobileaction=toggle_desktop_view' ),
		);
	}

	/**
	 * @dataProvider updateDesktopUrlHostProvider
	 */
	public function testUpdateDesktopUrlHost( $mobile, $desktop ) {
		$this->markTestSkipped('PHP parse_url() does not play nice with Unicode in URL');
		global $wgMobileUrlTemplate;
		$updateMobileUrlHost = self::getMethod( "updateDesktopUrlHost" );
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2";
		$parsedUrl = wfParseUrl( $mobile );
		$updateMobileUrlHost->invokeArgs( MobileContext::singleton(), array( &$parsedUrl ) );
		$this->assertEquals( $desktop, wfAssembleUrl( $parsedUrl ) );
	}

	public function updateDesktopUrlHostProvider() {
		return array(
			array( 'http://en.m.wikipedia.org/wiki/Gustavus_Airport', 'http://en.wikipedia.org/wiki/Gustavus_Airport' ),
			array( 'http://bm.m.wikipedia.org/wiki/Nyɛ_fɔlɔ', 'http://bm.wikipedia.org/wiki/Nyɛ_fɔlɔ' ),
		);
	}

	public function testUpdateMobileUrlPath() {
		global $wgMobileUrlTemplate, $wgScriptPath;
		$wgScriptPath = '/wiki';
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlPath" );
		$wgMobileUrlTemplate = "/mobile/%p";

		// check for constructing a templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( MobileContext::singleton(), array( &$parsedUrl ) );
		$this->assertEquals( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport", wfAssembleUrl( $parsedUrl ) );

		// check for maintaining an already templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( MobileContext::singleton(), array( &$parsedUrl ) );
		$this->assertEquals( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport", wfAssembleUrl( $parsedUrl ) );
	}

	/**
	 * @dataProvider updateMobileUrlQueryStringProvider
	 */
	public function testUpdateMobileUrlQueryString( $assert, $useFormat ) {
		$testMethod = ( $assert ) ? 'assertTrue' : 'assertFalse';
		$url = 'http://en.wikipedia.org/wiki/Article/?something=bananas';
		if ( !empty( $useFormat ) ) $url .= "&useformat=" . $useFormat;
		$context = MobileContext::singleton();
		$context->setUseFormat( $useFormat );

		$parsedUrl = wfParseUrl( $url );

		$updateMobileUrlQueryString = self::getMethod( 'updateMobileUrlQueryString' );
		$updateMobileUrlQueryString->invokeArgs( $context, array( &$parsedUrl ) );

		$targetUrl = wfAssembleUrl( $parsedUrl );
		$this->$testMethod( $url == $targetUrl, $targetUrl );
	}

	public function updateMobileUrlQueryStringProvider() {
		return array(
			array( true, 'mobile' ),
			array( true, 'mobile-wap' ),
			array( true, '' ),
		);
	}

	/**
	 * @dataProvider isMobileDeviceProvider
	 */
	public function testIsMobileDevice( $isDevice, $msg, $xDevice = null ) {
		$testMethod = ( $isDevice ) ? 'assertTrue' : 'assertFalse';

		if ( !is_null( $xDevice ) ) {
			MobileContext::singleton()->getRequest()->setHeader( 'X-Device', $xDevice );
		}

		$this->$testMethod( MobileContext::singleton()->isMobileDevice(), $msg );
	}

	public function isMobileDeviceProvider() {
		return array(
			array( false, 'Nothing set' ),
			array( true, 'HTTP_X_DEVICE = webkit', 'webkit' ),
		);
	}

	/**
	 * @dataProvider isFauxMobileDeviceProvider
	 */
	public function testIsFauxMobileDevice( $isFauxDevice, $msg, $useformat = null ) {
		$isFauxMobileDevice = self::getMethod( 'isFauxMobileDevice' );

		$testMethod = ( $isFauxDevice ) ? 'assertTrue' : 'assertFalse';

		MobileContext::singleton()->setUseFormat( $useformat );
		$this->$testMethod( $isFauxMobileDevice->invokeArgs( MobileContext::singleton(), array() ), $msg );
	}

	public function isFauxMobileDeviceProvider() {
		return array(
			array( false, 'Nothing set' ),
			array( true, 'useformat=mobile', 'mobile' ),
			array( true, 'useformat=mobile-wap', 'mobile-wap' ),
			array( false, 'useformat=yourmom', 'yourmom' ),
		);
	}

	/**
	 * @dataProvider shouldDisplayMobileViewProvider
	 */
	public function testShouldDisplayMobileView( $shouldDisplay, $xDevice = null, $requestVal = array(), $msg = null ) {
		$testMethod = ( $shouldDisplay ) ? 'assertTrue' : 'assertFalse';

		$request = MobileContext::singleton()->getRequest();
		if ( count( $requestVal ) ) {
			foreach ( $requestVal as $key => $val ) {
				if ( $key == 'useformat' ) {
					MobileContext::singleton()->setUseFormat( $val );
				} else {
					$request->setVal( $key, $val );
				}
			}
		}

		if ( !is_null( $xDevice ) ) {
			MobileContext::singleton()->getRequest()->setHeader( 'X-Device', $xDevice );
		}

		$this->$testMethod( MobileContext::singleton()->shouldDisplayMobileView(), $msg );
	}

	public function shouldDisplayMobileViewProvider() {
		return array(
			array( false, null, array() ),
			array( true, 'webkit', array() ),
			array( false, 'webkit', array( 'action' => 'edit' ) ),
			array( false, 'webkit', array( 'useformat' => 'desktop' ) ),
			array( true, null, array( 'useformat' => 'mobile-wap' ) ),
			array( false, null, array( 'useformat' => 'mobile-wap', 'action' => 'edit' ) ),
			array( false, null, array( 'useformat' => 'mobile-wap', 'action' => 'history' ) ),
			array( false, null, array( 'useformat' => 'desktop' ) ),
			array( true, null, array( 'useformat' => 'mobile' ) ),
			array( false, null, array( 'useformat' => 'mobile', 'action' => 'edit' ) ),
			array( false, null, array( 'useformat' => 'mobile', 'action' => 'history' ) ),
		);
	}

	/**
	 * @dataProvider getXDeviceProvider
	 */
	public function testGetXDevice( $xDevice = null ) {
		if ( is_null( $xDevice ) ) {
			MobileContext::singleton()->getRequest()->setHeader( 'X-Device', $xDevice );
			$assert = $xDevice;
		} else {
			$assert = '';
		}
		$this->assertEquals( $assert, MobileContext::singleton()->getXDevice() );
	}

	public function getXDeviceProvider() {
		return array(
			array( 'webkit' ),
			array( null ),
		);
	}

	/**
	 * @dataProvider getMobileActionProvider
	 */
	public function testGetMobileAction( $mobileaction = null ) {
		if ( is_null( $mobileaction ) ) {
			$assert = '';
		} else {
			MobileContext::singleton()->getRequest()->setVal( 'mobileaction', $mobileaction );
			$assert = $mobileaction;
		}

		$this->assertEquals( $assert, MobileContext::singleton()->getMobileAction() );
	}

	public function getMobileActionProvider() {
		return array(
			array( null ),
			array( 'view_normal_site' ),
		);
	}

	/**
	 * @dataProvider getActionProvider
	 */
	public function testGetAction( $action = null ) {
		if ( is_null( $action ) ) {
			$assert = '';
		} else {
			MobileContext::singleton()->getRequest()->setVal( 'action', $action );
			$assert = $action;
		}

		$this->assertEquals( $assert, MobileContext::singleton()->getAction() );
	}

	public function getActionProvider() {
		return array(
			array( null ),
			array( 'edit' ),
		);
	}

	/**
	 * @dataProvider getUseFormatProvider
	 */
	public function testGetUseFormat( $explicit, $requestParam, $expected ) {
		MobileContext::singleton()->getRequest()->setVal( 'useformat', $requestParam );
		MobileContext::singleton()->setUseFormat( $explicit );
		$this->assertEquals( $expected, MobileContext::singleton()->getUseFormat() );
	}

	public function getUseFormatProvider() {
		return array(
			array( 'mobile', null, 'mobile' ),
			array( null, 'mobile', 'mobile' ),
			array( null, null, '' ),
			array( 'desktop', 'mobile', 'desktop' ),
		);
	}

	public function testGetUseFormatCookieExpiry() {
		global $wgCookieExpiration, $wgMobileFrontendFormatCookieExpiry;
		$getUseFormatCookieExpiry = self::getMethod( 'getUseFormatCookieExpiry' );

		$origMFCookieExpiry = $wgMobileFrontendFormatCookieExpiry;
		$startTime = time();
		$wgMobileFrontendFormatCookieExpiry = 60;
		$mfCookieExpected = $startTime + 60;
		$this->assertTrue( $mfCookieExpected == $getUseFormatCookieExpiry->invokeArgs( MobileContext::singleton(), array( $startTime ) ), 'Using MobileFrontend expiry.' );

		$wgMobileFrontendFormatCookieExpiry = null;
		$defaultMWCookieExpected = $startTime + $wgCookieExpiration;
		$this->assertTrue( $defaultMWCookieExpected == $getUseFormatCookieExpiry->invokeArgs( MobileContext::singleton(), array( $startTime ) ), 'Using default MediaWiki cookie expiry.' );

		// reset global back to original value
		$wgMobileFrontendFormatCookieExpiry = $origMFCookieExpiry;
	}

	public function testGetStopMobileRedirectCookieDomain(){
		global $wgMFStopRedirectCookieHost;
		$context = MobileContext::singleton();
		$wgMFStopRedirectCookieHost = null;
		$context->getRequest()->setHeader( 'Host', 'en.wikipedia.org' );
		$this->assertEquals( $context->getStopMobileRedirectCookieDomain(), '.wikipedia.org' );
		$wgMFStopRedirectCookieHost = 'foo.bar.baz';
		$this->assertEquals( $context->getStopMobileRedirectCookieDomain(), 'foo.bar.baz' );
	}
}
