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
	 * @return \ReflectionMethod
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
		$wgExtMobileFrontend = new ExtMobileFrontend( new RequestContext() );
		MobileContext::setInstance( null ); // refresh it
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
		global $wgExtMobileFrontend;
		$sendXDeviceVaryHeader = self::getMethod( 'sendXDeviceVaryHeader' );
		MobileContext::singleton()->getRequest()->setHeader( 'X-Device', 'device' );
		$sendXDeviceVaryHeader->invokeArgs( $wgExtMobileFrontend, array() );
		$this->assertEquals( 'device', MobileContext::singleton()->getRequest()->
			response()->getheader( 'X-Device' ) );
	}

	/**
	 * @group Broken
	 */
	public function testSetPropertiesFromArray() {
		global $wgExtMobileFrontend;
		$props = array(
			'xDevice' => 'android',
			'blargh' => 'bananas',
		);
		$wgExtMobileFrontend->setPropertiesFromArray( $props );
		$this->assertEquals( $wgExtMobileFrontend->getXDevice(), 'android' );
		// ensure 'balrgh' didnt get set since it was not a pre-defined property
		$this->assertFalse( property_exists( $wgExtMobileFrontend, 'blargh' ) );
	}

	/**
	 * @outputBuffering enabled
	 */
	/*public function testCookie() {
		global $wgRequest;
		$wgRequest->response()->setCookie( 'foo', 'bar' );
		$this->assertEquals( $wgRequest->getCookie( 'foo' ), 'bar' );
		setcookie( 'foobar', 'pants' );
		$this->asertEquals( $_COOKIE[ 'foobar' ], 'pants' );
	}

	/**
	 * NB this will not work as PHPUnit seems to not make it possible to set
	 * and retrieve cookies. Note above test, testCookie() - both assertions
	 * currently fail, making testing ExtMobileFrontend::checkUserFormatCookie()
	 * impossible.
	 *
     * @outputBuffering enabled
	 */
	/*public function testCheckUseFormatCookie() {

	}
	*/
}
