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
