<?php

class ExtMobileFrontendTest extends MediaWikiTestCase {
	
	/**
	* PHP 5.3.2 introduces the ReflectionMethod::setAccessible() method to allow the invocation of 
	* protected and private methods directly through the Reflection API
	*/
	protected static function getMethod( $name ) {
		$class = new ReflectionClass( 'ExtMobileFrontend' );
		$method = $class->getMethod( $name );
		$method->setAccessible( true );
		return $method;
	}
	
	protected function setUp() {
		parent::setUp();
		$this->wgExtMobileFrontend = new ExtMobileFrontend();
	}

	protected function tearDown() {
		unset( $this->wgExtMobileFrontend );
		parent::tearDown();
	}
	
	public function testgetBaseDomain() {
		$getBaseDomain = self::getMethod( 'getBaseDomain' );
		$wgExtMobileFrontend = new ExtMobileFrontend();
		$_SERVER['HTTP_HOST'] = 'en.wikipedia.org';
		$this->assertEquals( '.wikipedia.org', $getBaseDomain->invokeArgs( $wgExtMobileFrontend, array() ) );
	}
	
	public function testgetRelativeURL() {
		$getRelativeURL = self::getMethod( 'getRelativeURL' );
		$wgExtMobileFrontend = new ExtMobileFrontend();
		$url = 'http://en.wikipedia.org/wiki/Positional_astronomy';
		$this->assertEquals( '/wiki/Positional_astronomy', $getRelativeURL->invokeArgs( $wgExtMobileFrontend, array( $url ) ) );
	}
	
	public function testdisableCaching() {
		global $wgRequest;
		$disableCaching = self::getMethod( 'disableCaching' );
		$wgExtMobileFrontend = new ExtMobileFrontend();
		$_SERVER['HTTP_VIA'] = '.wikimedia.org:3128';
		$disableCaching->invokeArgs( $wgExtMobileFrontend, array() );
		$this->assertEquals( 'no-cache, must-revalidate', $wgRequest->response()->getheader( 'Cache-Control' ) );
		$this->assertEquals( 'Sat, 26 Jul 1997 05:00:00 GMT', $wgRequest->response()->getheader( 'Expires' ) );
		$this->assertEquals( 'no-cache', $wgRequest->response()->getheader( 'Pragma' ) );
	}
}