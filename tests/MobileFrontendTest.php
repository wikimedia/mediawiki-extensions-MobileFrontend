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
}
