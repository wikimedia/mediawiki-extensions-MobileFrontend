<?php

/**
 * @group MobileFrontend
 */
class ExtMobileFrontendTest extends MediaWikiTestCase {
	/**
	* PHP 5.3.2 introduces the ReflectionMethod::setAccessible() method to allow the invocation of
	* protected and private methods directly through the Reflection API
	 *
	 * @param $name string
	*/
	protected static function getMethod( $name ) {
		$class = new ReflectionClass( 'ExtMobileFrontend' );
		$method = $class->getMethod( $name );
		$method->setAccessible( true );
		return $method;
	}

	protected function setUp() {
		parent::setUp();
		global $wgExtMobileFrontend;
		$wgExtMobileFrontend = new ExtMobileFrontend();
	}

	protected function tearDown() {
		global $wgExtMobileFrontend;
		unset( $wgExtMobileFrontend );
		unset( $_SERVER[ 'HTTP_X_DEVICE' ] );
		ExtMobileFrontend::$useFormat = null;
		parent::tearDown();
	}

	public function testGetBaseDomain() {
		global $wgExtMobileFrontend;
		$getBaseDomain = self::getMethod( 'getBaseDomain' );
		$_SERVER['HTTP_HOST'] = 'en.wikipedia.org';
		$this->assertEquals( '.wikipedia.org', $getBaseDomain->invokeArgs( $wgExtMobileFrontend, array() ) );
	}

	public function testGetRelativeURL() {
		global $wgExtMobileFrontend;
		$getRelativeURL = self::getMethod( 'getRelativeURL' );
		$url = 'http://en.wikipedia.org/wiki/Positional_astronomy';
		$this->assertEquals( '/wiki/Positional_astronomy', $getRelativeURL->invokeArgs( $wgExtMobileFrontend, array( $url ) ) );
	}

	public function testDisableCaching() {
		global $wgRequest, $wgExtMobileFrontend, $wgSquidServers;
		$disableCaching = self::getMethod( 'disableCaching' );
		
		$wgSquidServers = array( '10.64.0.131' );
		$_SERVER['REMOTE_ADDR'] = '10.64.0.131';
		$disableCaching->invokeArgs( $wgExtMobileFrontend, array() );
		$this->assertEquals( 'no-cache, must-revalidate', $wgRequest->response()->getheader( 'Cache-Control' ) );
		$this->assertEquals( 'Sat, 26 Jul 1997 05:00:00 GMT', $wgRequest->response()->getheader( 'Expires' ) );
		$this->assertEquals( 'no-cache', $wgRequest->response()->getheader( 'Pragma' ) );
	}

	public function testSendXDeviceVaryHeader() {
		global $wgRequest, $wgExtMobileFrontend;
		$sendXDeviceVaryHeader = self::getMethod( 'sendXDeviceVaryHeader' );
		$_SERVER['HTTP_X_DEVICE'] = 'device';
		$sendXDeviceVaryHeader->invokeArgs( $wgExtMobileFrontend, array() );
		$this->assertEquals( $_SERVER['HTTP_X_DEVICE'], $wgRequest->response()->getheader( 'X-Device' ) );
	}
	
	public function testGetMobileUrl() {
		global $wgMobileUrlTemplate, $wgExtMobileFrontend;
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2";
		$this->assertEquals( 'http://en.m.wikipedia.org/wiki/Article', $wgExtMobileFrontend->getMobileUrl( 'http://en.wikipedia.org/wiki/Article' ) );
	}
	
	public function testParseMobileUrlTemplate() {
		global $wgMobileUrlTemplate, $wgExtMobileFrontend;
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2/path/morepath";
		$this->assertEquals( '%h0.m.%h1.%h2', $wgExtMobileFrontend->parseMobileUrlTemplate( 'host' ) );
		$this->assertEquals( '/path/morepath', $wgExtMobileFrontend->parseMobileUrlTemplate( 'path' ) );
		$this->assertEquals( array( 'host' => '%h0.m.%h1.%h2', 'path' => '/path/morepath' ), $wgExtMobileFrontend->parseMobileUrlTemplate());
	}
	
	public function testUpdateMobileUrlHost() {
		global $wgMobileUrlTemplate, $wgExtMobileFrontend;
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlHost" );
		$wgMobileUrlTemplate = "%h0.m.%h1.%h2";
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $wgExtMobileFrontend, array( &$parsedUrl ) );
		$this->assertEquals( "http://en.m.wikipedia.org/wiki/Gustavus_Airport", wfAssembleUrl( $parsedUrl ) );
	}
	
	public function testUpdateMobileUrlPath() {
		global $wgMobileUrlTemplate, $wgExtMobileFrontend, $wgScriptPath;
		$wgScriptPath = '/wiki';
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlPath" );
		$wgMobileUrlTemplate = "/mobile/%p";
		
		// check for constructing a templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $wgExtMobileFrontend, array( &$parsedUrl ) );
		$this->assertEquals( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport", wfAssembleUrl( $parsedUrl ) );
		
		// check for maintaining an already templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $wgExtMobileFrontend, array( &$parsedUrl ) );
		$this->assertEquals( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport", wfAssembleUrl( $parsedUrl ) );
	}
	
	/**
	 * @dataProvider updateMobileUrlQueryStringProvider
	 */
	public function testUpdateMobileUrlQueryString( $assert, $useFormat ) {
		global $wgRequest, $wgExtMobileFrontend;
		
		$testMethod = ( $assert ) ? 'assertTrue' : 'assertFalse';
		$url = 'http://en.wikipedia.org/wiki/Article/?something=bananas';
		if ( !empty( $useFormat ) ) $url .= "&useformat=" . $useFormat;
		ExtMobileFrontend::$useFormat = $useFormat;
		
		$parsedUrl = wfParseUrl( $url );
		
		$updateMobileUrlQueryString = self::getMethod( 'updateMobileUrlQueryString' );
		$updateMobileUrlQueryString->invokeArgs( $wgExtMobileFrontend, array( &$parsedUrl) );
		
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
		global $wgReqeust, $wgExtMobileFrontend;
		$isMobileDevice = self::getMethod( 'isMobileDevice' );
		
		$testMethod = ( $isDevice ) ? 'assertTrue' : 'assertFalse';
		
		if ( !is_null( $xDevice )) {
			$_SERVER[ 'HTTP_X_DEVICE' ] = $xDevice;
		}
		
		$this->$testMethod( $isMobileDevice->invokeArgs( $wgExtMobileFrontend, array() ), $msg );
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
	public function testIsFauxMobileDevice( $isFauxDevice, $msg, $useformat=null ) {
		global $wgRequest, $wgExtMobileFrontend;
		$isFauxMobileDevice = self::getMethod( 'isFauxMobileDevice' );
		
		$testMethod = ( $isFauxDevice ) ? 'assertTrue' : 'assertFalse';
		
		ExtMobileFrontend::$useFormat = $useformat;
		$this->$testMethod( $isFauxMobileDevice->invokeArgs( $wgExtMobileFrontend, array() ), $msg );
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
	public function testShouldDisplayMobileView( $shouldDisplay, $xDevice=null, $requestVal=array(), $msg=null ) {
		global $wgRequest, $wgExtMobileFrontend;
		$shouldDisplayMobileView = self::getMethod( 'shouldDisplayMobileView' );
	
		$testMethod = ( $shouldDisplay ) ? 'assertTrue' : 'assertFalse';
		
		if ( count( $requestVal )) {
			foreach ( $requestVal as $key => $val ) {
				if ( $key == 'useformat' ) {
					ExtMobileFrontend::$useFormat = $val;
				} else {
					$wgRequest->setVal( $key, $val );
				}
			}
		}
		
		if ( !is_null( $xDevice )) {
			$_SERVER[ 'HTTP_X_DEVICE' ] = $xDevice;
		}
		
		$this->$testMethod( $shouldDisplayMobileView->invokeArgs( $wgExtMobileFrontend, array() ), $msg );
		
		// clean up
		if ( count( $requestVal )) {
			foreach ( $requestVal as $key => $val ) {
				if ( $key == 'useformat' ) {
					continue;
				} else {
					$wgRequest->unsetVal( $key );
				}
			}
		}
	}
	
	public function shouldDisplayMobileViewProvider() {
		return array(
			array( false, null, array() ),
			array( true, 'webkit', array() ),
			array( false, 'webkit', array( 'action' => 'edit' ) ),
			array( false, 'webkit', array( 'mobileaction' => 'view_normal_site' ) ),
			array( true, null, array( 'useformat' => 'mobile-wap' ) ),
			array( false, null, array( 'useformat' => 'mobile-wap', 'action' => 'edit' ) ),
			array( false, null, array( 'useformat' => 'mobile-wap', 'action' => 'history' ) ),
			array( false, null, array( 'useformat' => 'mobile-wap', 'mobileaction' => 'view_normal_site' ) ),
			array( true, null, array( 'useformat' => 'mobile' ) ),
			array( false, null, array( 'useformat' => 'mobile', 'action' => 'edit' ) ),
			array( false, null, array( 'useformat' => 'mobile', 'action' => 'history' ) ),
			array( false, null, array( 'useformat' => 'mobile', 'mobileaction' => 'view_normal_site' ) ),
		);
	}
	
	/**
	 * @dataProvider getXDeviceProvider
	 */
	public function testGetXDevice( $xDevice=null ) {
		global $wgExtMobileFrontend;
		if ( is_null( $xDevice ) ) {
			$assert = '';
			if ( isset( $_SERVER[ 'HTTP_X_DEVICE' ] ) ) {
				unset( $_SERVER[ 'HTTP_X_DEVICE' ] );
			}
		} else {
			$_SERVER[ 'HTTP_X_DEVICE' ] = $xDevice;
			$assert = $xDevice;
		}
		$this->assertEquals( $assert, $wgExtMobileFrontend->getXDevice() );
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
	public function testGetMobileAction( $mobileaction=null ) {
		global $wgRequest, $wgExtMobileFrontend;

		if ( is_null( $mobileaction )) {
			$assert = '';
			$wgRequest->unsetVal( 'mobileaction' );
		} else {
			$wgRequest->setVal( 'mobileaction', $mobileaction );
			$assert = $mobileaction;
		}

		$this->assertEquals( $assert, $wgExtMobileFrontend->getMobileAction() );
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
	public function testGetAction( $action=null ) {
		global $wgRequest, $wgExtMobileFrontend;
		
		if ( is_null( $action )) {
			$assert = '';
			$wgRequest->unsetVal( 'action' );
		} else {
			$wgRequest->setVal( 'action', $action );
			$assert = $action;
		}
		
		$this->assertEquals( $assert, $wgExtMobileFrontend->getAction() );
	}
	
	public function getActionProvider() {
		return array(
			array( null ),
			array( 'edit' ),
		);
	}
}
