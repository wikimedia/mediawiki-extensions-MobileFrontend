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
		// Permit no access to the singleton
		MobileContext::setInstance( new BogusMobileContext() );
	}

	protected function tearDown() {
		MobileContext::setInstance( null ); //refresh it
		parent::tearDown();
	}

	/**
	 * @param string $url
	 * @param array $cookies
	 * @return MobileContext
	 */
	private function makeContext( $url = '/', $cookies = array() ) {
		$context = new DerivativeContext( RequestContext::getMain() );
		$context->setRequest( new MFFauxRequest( $url,  $cookies ) );
		$context->setOutput( new OutputPage( $context ) );
		$instance = unserialize( 'O:13:"MobileContext":0:{}' );
		$instance->setContext( $context );
		return $instance;
	}

	/**
	 * @dataProvider getBaseDomainProvider
	 */
	public function testGetBaseDomain( $server, $baseDomain ) {
		$this->setMwGlobals( 'wgServer', $server );
		$this->assertEquals( $baseDomain, $this->makeContext()->getBaseDomain() );
	}

	public function getBaseDomainProvider() {
		return array(
			array( 'https://en.wikipedia.org', '.wikipedia.org' ),
			array( 'http://en.m.wikipedia.org', '.wikipedia.org' ),
			array( '//en.m.wikipedia.org', '.wikipedia.org' ),
			array( 'http://127.0.0.1', '127.0.0.1' ),
			array( 'http://127.0.0.1:8080', '127.0.0.1' ),
			array( 'http://localhost', 'localhost' ),
		);
	}

	public function testGetMobileUrl() {
		$this->setMwGlobals( array(
			'wgMFMobileHeader' => 'X-WAP',
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2'
		) );
		$invokes = 0;
		$context = $this->makeContext();
		$asserter = $this;
		$this->setMwGlobals( 'wgHooks',
			array( 'GetMobileUrl' => array( function ( &$string, $hookCtx ) use (
					$asserter,
					&$invokes,
					$context
				) {
					$asserter->assertEquals( $context, $hookCtx );
					$invokes++;
			} )
		) );
		$context->getRequest()->setHeader( 'X-WAP', 'no' );
		$this->assertEquals(
			'http://en.m.wikipedia.org/wiki/Article',
			$context->getMobileUrl( 'http://en.wikipedia.org/wiki/Article' )
		);
		$this->assertEquals(
			'//en.m.wikipedia.org/wiki/Article',
			$context->getMobileUrl( '//en.wikipedia.org/wiki/Article' )
		);
		$this->assertEquals( 2, $invokes, 'Ensure that hook got the right context' );
	}

	public function testParseMobileUrlTemplate() {
		$this->setMwGlobals( 'wgMobileUrlTemplate', '%h0.m.%h1.%h2/path/morepath' );
		$context = $this->makeContext();
		$this->assertEquals(
			'%h0.m.%h1.%h2',
			$context->parseMobileUrlTemplate( 'host' )
		);
		$this->assertEquals(
			'/path/morepath',
			$context->parseMobileUrlTemplate( 'path' )
		);
		$this->assertEquals(
			array( 'host' => '%h0.m.%h1.%h2', 'path' => '/path/morepath' ),
			$context->parseMobileUrlTemplate()
		);
	}

	/**
	 * @dataProvider updateMobileUrlHostProvider
	 */
	public function testUpdateMobileUrlHost( $url, $expected, $urlTemplate ) {
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlHost" );
		$this->setMwGlobals( 'wgMobileUrlTemplate', $urlTemplate );
		$parsedUrl = wfParseUrl( $url );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), array( &$parsedUrl ) );
		$this->assertEquals( $expected, wfAssembleUrl( $parsedUrl ) );
	}

	public function updateMobileUrlHostProvider() {
		return array(
			array(
				'http://en.wikipedia.org/wiki/Gustavus_Airport',
				'http://en.m.wikipedia.org/wiki/Gustavus_Airport',
				'%h0.m.%h1.%h2',
			),
			array(
				'https://wikimediafoundation.org/wiki/FAQ',
				'https://m.wikimediafoundation.org/wiki/FAQ',
				'm.%h0.%h1',
			),
			array(
				'https://127.0.0.1/wiki/Test',
				'https://127.0.0.1/wiki/Test',
				'%h0.m.%h1.%h2',
			),
		);
	}

	/**
	 * @dataProvider updateDesktopUrlQueryProvider
	 */
	public function testUpdateDesktopUrlQuery( $mobile, $desktop ) {
		$updateDesktopUrlQuery = self::getMethod( "updateDesktopUrlQuery" );
		$parsedUrl = wfParseUrl( $mobile );
		$updateDesktopUrlQuery->invokeArgs( $this->makeContext(), array( &$parsedUrl ) );
		$url = wfAssembleUrl( $parsedUrl );
		$this->assertEquals( $desktop, $url );
	}

	public function updateDesktopUrlQueryProvider() {
		$baseUrl = 'http://en.m.wikipedia.org/wiki/Gustavus_Airport';

		return array(
			array(
				$baseUrl . '?useformat=mobile&mobileaction=toggle_desktop_view',
				$baseUrl . '?mobileaction=toggle_desktop_view'
			),
		);
	}

	/**
	 * @dataProvider updateDesktopUrlHostProvider
	 */
	public function testUpdateDesktopUrlHost( $mobile, $desktop, $server ) {
		$updateMobileUrlHost = self::getMethod( "updateDesktopUrlHost" );
		$this->setMwGlobals( array(
			'wgServer' => $server,
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
		) );
		$parsedUrl = wfParseUrl( $mobile );
		$updateMobileUrlHost->invokeArgs(
			$this->makeContext(),
			array( &$parsedUrl ) );
		$this->assertEquals( $desktop, wfAssembleUrl( $parsedUrl ) );
	}

	public function updateDesktopUrlHostProvider() {
		return array(
			array(
				'http://bm.m.wikipedia.org/wiki/' . urlencode( 'Nyɛ_fɔlɔ' ),
				'http://bm.wikipedia.org/wiki/' . urlencode( 'Nyɛ_fɔlɔ' ),
				'//bm.wikipedia.org',
			),
			array(
				'http://en.m.wikipedia.org/wiki/Gustavus_Airport',
				'http://en.wikipedia.org/wiki/Gustavus_Airport',
				'//en.wikipedia.org',
			),
			array(
				'https://m.wikimediafoundation.org/wiki/FAQ',
				'https://wikimediafoundation.org/wiki/FAQ',
				'//wikimediafoundation.org',
			),
		);
	}

	public function testUpdateMobileUrlPath() {
		$this->setMwGlobals( array(
			'wgScriptPath' => '/wiki',
			'wgMobileUrlTemplate' => "/mobile/%p",
		) );
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlPath" );

		// check for constructing a templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), array( &$parsedUrl ) );
		$this->assertEquals(
			"http://en.wikipedia.org/wiki/mobile/Gustavus_Airport",
			wfAssembleUrl( $parsedUrl )
		);

		// check for maintaining an already templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), array( &$parsedUrl ) );
		$this->assertEquals(
			"http://en.wikipedia.org/wiki/mobile/Gustavus_Airport",
			wfAssembleUrl( $parsedUrl )
		);
	}

	/**
	 * @dataProvider isFauxMobileDeviceProvider
	 */
	public function testIsFauxMobileDevice( $isFauxDevice, $msg, $useformat = null ) {
		$isFauxMobileDevice = self::getMethod( 'isFauxMobileDevice' );

		$testMethod = ( $isFauxDevice ) ? 'assertTrue' : 'assertFalse';

		$context = $this->makeContext();
		$context->setUseFormat( $useformat );
		$this->$testMethod(
			$isFauxMobileDevice->invokeArgs( $context, array() ),
			$msg
		);
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
	public function testShouldDisplayMobileView( $shouldDisplay, $xWap = null,
		$requestVal = array(), $msg = null
	) {
		$testMethod = ( $shouldDisplay ) ? 'assertTrue' : 'assertFalse';

		$this->setMwGlobals( array(
			'wgMFMobileHeader' => 'X-WAP',
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
		) );
		$context = $this->makeContext();
		$request = $context->getRequest();
		if ( count( $requestVal ) ) {
			foreach ( $requestVal as $key => $val ) {
				if ( $key == 'useformat' ) {
					$context->setUseFormat( $val );
				} else {
					$request->setVal( $key, $val );
				}
			}
		}

		if ( !is_null( $xWap ) ) {
			$request->setHeader( 'X-WAP', $xWap );
		}

		$this->$testMethod( $context->shouldDisplayMobileView(), $msg );
	}

	public function shouldDisplayMobileViewProvider() {
		return array(
			array( false, null, array() ),
			array( true, 'yes', array() ),
			array( true, 'no', array() ),
			array( false, 'yes', array( 'useformat' => 'desktop' ) ),
			array( true, null, array( 'useformat' => 'mobile-wap' ) ),
			array( false, null, array( 'useformat' => 'desktop' ) ),
			array( true, null, array( 'useformat' => 'mobile' ) ),
		);
	}

	/**
	 * @dataProvider getMobileActionProvider
	 */
	public function testGetMobileAction( $mobileaction = null ) {
		$context = $this->makeContext();
		if ( is_null( $mobileaction ) ) {
			$assert = '';
		} else {
			$context->getRequest()->setVal( 'mobileaction', $mobileaction );
			$assert = $mobileaction;
		}

		$this->assertEquals( $assert, $context->getMobileAction() );
	}

	public function getMobileActionProvider() {
		return array(
			array( null ),
			array( 'view_normal_site' ),
		);
	}

	/**
	 * @dataProvider getUseFormatProvider
	 */
	public function testGetUseFormat( $explicit, $requestParam, $expected ) {
		$context = $this->makeContext();
		$context->getRequest()->setVal( 'useformat', $requestParam );
		$context->setUseFormat( $explicit );
		$this->assertEquals( $expected, $context->getUseFormat() );
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
		global $wgCookieExpiration;
		$getUseFormatCookieExpiry = self::getMethod( 'getUseFormatCookieExpiry' );

		$context = $this->makeContext();
		$startTime = time();
		$this->setMwGlobals( 'wgMobileFrontendFormatCookieExpiry', 60 );
		$mfCookieExpected = $startTime + 60;
		$this->assertTrue(
			$mfCookieExpected == $getUseFormatCookieExpiry->invokeArgs(
				$context,
				array( $startTime )
			),
			'Using MobileFrontend expiry.'
		);

		$this->setMwGlobals( 'wgMobileFrontendFormatCookieExpiry', null );
		$defaultMWCookieExpected = $startTime + $wgCookieExpiration;
		$this->assertTrue(
			$defaultMWCookieExpected == $getUseFormatCookieExpiry->invokeArgs(
				$context,
				array( $startTime )
			),
			'Using default MediaWiki cookie expiry.'
		);
	}

	public function testGetStopMobileRedirectCookieDomain() {
		$context = $this->makeContext();
		$this->setMwGlobals( array(
			'wgMFStopRedirectCookieHost' => null,
			'wgServer' => 'http://en.wikipedia.org',
		) );
		$this->assertEquals( $context->getStopMobileRedirectCookieDomain(), '.wikipedia.org' );
		$this->setMwGlobals( 'wgMFStopRedirectCookieHost', 'foo.bar.baz' );
		$this->assertEquals( $context->getStopMobileRedirectCookieDomain(), 'foo.bar.baz' );
	}

	public function testIsLocalUrl() {
		global $wgServer;
		$context = $this->makeContext();
		$this->assertTrue( $context->isLocalUrl( $wgServer ) );
		$this->assertFalse( $context->isLocalUrl( 'http://www.google.com' ) );
	}

	/**
	 * @dataProvider addAnalyticsLogItemProvider
	 */
	public function testAddAnalyticsLogItem( $key, $val ) {
		$context = $this->makeContext();
		$context->addAnalyticsLogItem( $key, $val );
		$logItems = $context->getAnalyticsLogItems();
		$trimmedKey = trim( $key );
		$trimmedVal = trim( $val );
		$this->assertTrue( isset( $logItems[$trimmedKey] ) );
		$this->assertEquals( $logItems[$trimmedKey], $trimmedVal );
	}

	public function addAnalyticsLogItemProvider() {
		return array(
			array( 'mf-m', 'a' ),
			array( ' mf-m', 'b ' ),
		);
	}

	/**
	 * @dataProvider getXAnalyticsHeaderProvider
	 */
	public function testGetXAnalyticsHeader( $existingHeader, $logItems, $expectedHeader ) {
		$context = $this->makeContext();
		foreach ( $logItems as $key => $val ) {
			$context->addAnalyticsLogItem( $key, $val );
		}
		if ( $existingHeader ) {
			$context->getRequest()->response()->header( 'X-Analytics: ' . $existingHeader, true );
		}
		$this->assertEquals( $context->getXAnalyticsHeader(), $expectedHeader );
	}

	public function getXAnalyticsHeaderProvider() {
		return array(
			array(
				null,
				array( 'mf-m' => 'a', 'zero' => '502-13' ),
				'X-Analytics: mf-m=a;zero=502-13',
			),
			// check key/val trimming
			array(
				null,
				array( '  foo' => '  bar  ', 'baz' => ' blat ' ),
				'X-Analytics: foo=bar;baz=blat'
			),
			// check urlencoding key/val pairs
			array(
				null,
				array( 'foo' => 'bar baz', 'blat' => '$blammo' ),
				'X-Analytics: foo=bar+baz;blat=%24blammo'
			),
			// check handling of existing header value
			array(
				'existing=value; another=item',
				array( 'mf-m' => 'a', 'zero' => '502-13' ),
				'X-Analytics: existing=value;another=item;mf-m=a;zero=502-13',
			),
		);
	}

	/**
	 * @dataProvider addAnalyticsLogItemFromXAnalyticsProvider
	 */
	public function testAddAnalyticsLogItemFromXAnalytics( $analyticsItem, $key, $val ) {
		$context = $this->makeContext();
		$context->addAnalyticsLogItemFromXanalytics( $analyticsItem );
		$logItems = $context->getAnalyticsLogItems();
		$this->assertTrue( isset( $logItems[$key] ) );
		$this->assertEquals( $logItems[$key], $val );
	}

	public function addAnalyticsLogItemFromXAnalyticsProvider() {
		return array(
			array( 'mf-m=a', 'mf-m', 'a' ),
			// check key/val trimming
			array( ' mf-m=a ', 'mf-m', 'a' ),
			// check urldecode
			array( 'foo=bar+%24blat', 'foo', 'bar $blat' ),
		);
	}

	/**
	 * @dataProvider getMobileHostTokenProvider
	 */
	public function testGetMobileHostToken( $domainTemplate, $result ) {
		$context = $this->makeContext();
		$this->assertEquals( $context->getMobileHostToken( $domainTemplate ), $result );
	}

	public function getMobileHostTokenProvider() {
		return array(
			array( '%h1.m.%h2.%h3', 'm.' ),
			array( '', '' ),
			array( 'bananas.%h2.%h3', 'bananas.' ),
		);
	}

	/**
	 * @dataProvider optInProvider
	 */
	public function testOptIn( array $cookies, $isAlpha, $isBeta, $enabledInSettings ) {
		$this->setMwGlobals( 'wgMFEnableBeta', $enabledInSettings );
		$mobileContext = $this->makeContext( '/', $cookies );
		$this->assertEquals( $isAlpha, $mobileContext->isAlphaGroupMember() );
		$this->assertEquals( $isBeta, $mobileContext->isBetaGroupMember() );
	}

	public function optInProvider() {
		return array(
			array( array(), false, false, true ),
			array( array( 'optin' => 'beta' ), false, true, true ),
			array( array( 'optin' => 'alpha' ), true, true, true ),
			array( array( 'optin' => 'foobar' ), false, false, true ),
			array( array(), false, false, false ),
			array( array( 'optin' => 'beta' ), false, false, false ),
			array( array( 'optin' => 'alpha' ), false, false, false ),
			array( array( 'optin' => 'foobar' ), false, false, false ),
		);
	}

	/**
	 * @dataProvider provideToggleView
	 * @param $page
	 * @param $url
	 * @param $urlTemplate
	 * @param $expectedLocation
	 */
	public function testToggleView( $page, $url, $urlTemplate, $expectedLocation ) {
		$this->setMwGlobals( array(
			'wgMobileUrlTemplate' => $urlTemplate,
			'wgServer' => '//en.wikipedia.org',
			//'wgArticlePath' => '/wiki/$1',
			'wgScriptPath' => '/wiki',
		) );
		$context = $this->makeContext( $url );
		$context->getContext()->setTitle( Title::newFromText( $page ) );
		$context->checkToggleView();
		$context->doToggling();
		$location = $context->getOutput()->getRedirect();
		$this->assertEquals( $expectedLocation, $location );
	}

	public function provideToggleView() {
		$token = '%h0.m.%h1.%h2';
		return array(
			array( 'Foo', '/', '', '' ),
			array( 'Foo', '/', $token, '' ),
			array( 'Main Page', '/wiki/Main_Page', '', '' ),
			array( 'Main Page', '/wiki/Main_Page', $token, '' ),
			array( 'Main Page', '/wiki/Main_Page?useformat=mobile', '', '' ),
			array( 'Main Page', '/wiki/Main_Page?useformat=mobile', $token, '' ),
			array( 'Main Page', '/wiki/Main_Page?useformat=desktop', '', '' ),
			array( 'Main Page', '/wiki/Main_Page?useformat=desktop', $token, '' ),
			array( 'Foo', '/?mobileaction=toggle_view_desktop', '', '' ),
			array( 'Foo', '/?mobileaction=toggle_view_mobile', '', '' ),
			array( 'Page', '/wiki/Page?mobileaction=toggle_view_desktop',
				'', ''
			),
			/*
		    FIXME: works locally but fails in Jerkins
			array( 'Main Page', '/?mobileaction=toggle_view_desktop',
				$token, 'http://en.wikipedia.org/wiki/Main_Page'
			),
			array( 'Main Page', '/?mobileaction=toggle_view_mobile',
				$token, 'http://en.m.wikipedia.org/wiki/Main_Page'
			),
			array( 'Page', '/wiki/Page?mobileaction=toggle_view_mobile',
				$token, 'http://en.m.wikipedia.org/wiki/Page'
			),
			array( 'Page', '/wiki/Page?mobileaction=toggle_view_desktop',
				$token, 'http://en.wikipedia.org/wiki/Page'
			),
			array( 'Special:Foo',
				'/wiki/index.php?title=Special:Foo&bar=baz&mobileaction=toggle_view_desktop',
				$token, 'http://en.wikipedia.org/w/index.php?title=Special:Foo&bar=baz'
			),
			array( 'Special:Foo',
				'/wiki/index.php?title=Special%3AFoo&bar=baz&mobileaction=toggle_view_mobile',
				$token, 'http://en.m.wikipedia.org/w/index.php?title=Special:Foo&bar=baz'
			),
			array( 'Page', '/wiki/index.php?title=Page&mobileaction=toggle_view_desktop',
				$token, 'http://en.wikipedia.org/wiki/Page',
			),
			array( 'Page', '/wiki/index.php?title=Page&mobileaction=toggle_view_mobile',
				$token, 'http://en.m.wikipedia.org/wiki/Page',
			),
		    */
		);
	}

	public function testBug71329() {
		SpecialPageFactory::resetList();
		RequestContext::resetMain();
		$req = new FauxRequest(
			array( 'title' => 'Special:Search', 'mobileaction' => 'toggle_view_mobile' )
		);
		$req->setRequestURL( '/w/index.php?title=Special:Search&mobileaction=toggle_view_mobile' );
		RequestContext::getMain()->setRequest( $req );
		MobileContext::setInstance( null );
		$this->setMwGlobals( 'wgTitle', null );
		SpecialPage::getTitleFor( 'Search' );
		$this->assertTrue( true, 'In case of failure this test just crashes' );
	}
}

class MFFauxRequest extends FauxRequest {
	private $cookies, $url, $response;

	public function __construct( $url, array $cookies = array() ) {
		$this->url = $url;
		$query = array();
		if ( $url ) {
			$params = wfParseUrl( wfExpandUrl( $url ) );
			if ( isset( $params['query'] ) ) {
				$query = wfCgiToArray( $params['query'] );
			}
		}
		parent::__construct( $query );
		$this->cookies = $cookies;
		$this->response = new FauxResponse();
	}

	public function getCookie( $key, $prefix = null, $default = null ) {
		return isset( $this->cookies[$key] ) ? $this->cookies[$key] : $default;
	}

	public function getRequestURL() {
		return $this->url;
	}

	/**
	 * @return FauxResponse
	 */
	public function response() {
		return $this->response;
	}
}

class BogusMobileContext {
	public function __call( $who, $cares ) {
		throw new Exception( "Don't touch me!" );
	}
}
