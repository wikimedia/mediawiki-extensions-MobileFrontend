<?php

use MediaWiki\MediaWikiServices;

/**
 * @group MobileFrontend
 */
class MobileContextTest extends MediaWikiTestCase {
	/**
	 * PHP 5.3.2 introduces the ReflectionMethod::setAccessible() method to allow the invocation of
	 * protected and private methods directly through the Reflection API
	 *
	 * @param string $name
	 * @return ReflectionMethod
	 */
	protected static function getMethod( $name ) {
		$class = new ReflectionClass( MobileContext::class );
		$method = $class->getMethod( $name );
		$method->setAccessible( true );

		return $method;
	}

	protected function tearDown() : void {
		parent::tearDown();

		MobileContext::resetInstanceForTesting();
	}

	/**
	 * @param string $url
	 * @param array $cookies
	 * @return MobileContext
	 */
	private function makeContext( $url = '/', $cookies = [] ) {
		$query = [];
		if ( $url ) {
			$params = wfParseUrl( wfExpandUrl( $url ) );
			if ( isset( $params['query'] ) ) {
				$query = wfCgiToArray( $params['query'] );
			}
		}

		$request = new FauxRequest( $query );
		$request->setRequestURL( $url );
		$request->setCookies( $cookies, '' );

		MobileContext::resetInstanceForTesting();
		/** @var MobileContext $context */
		$instance = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		/** @var MutableContext $context */
		$context = $instance->getContext();
		$context->setRequest( $request );

		return $instance;
	}

	/**
	 * @covers MobileContext::getMobileUrl
	 */
	public function testGetMobileUrl() {
		$this->setMwGlobals( [
			'wgMFMobileHeader' => 'X-Subdomain',
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
			'wgServer' => '//en.wikipedia.org',
		] );
		$invokes = 0;
		$context = $this->makeContext();
		$asserter = $this;
		$this->setMwGlobals( 'wgHooks',
			[ 'GetMobileUrl' => [ function ( &$string, $hookCtx ) use (
					$asserter,
					&$invokes,
					$context
				) {
					$asserter->assertEquals( $context, $hookCtx );
					$invokes++;
			} ]
		] );
		$context->getRequest()->setHeader( 'X-Subdomain', 'M' );
		$this->assertEquals(
			'http://en.m.wikipedia.org/wiki/Article',
			$context->getMobileUrl( 'http://en.wikipedia.org/wiki/Article' )
		);
		$this->assertEquals(
			'//en.m.wikipedia.org/wiki/Article',
			$context->getMobileUrl( '//en.wikipedia.org/wiki/Article' )
		);
		// test local Urls - task T107505
		$this->assertEquals(
			'http://en.m.wikipedia.org/wiki/Article',
			$context->getMobileUrl( '/wiki/Article' )
		);
		$this->assertEquals( 3, $invokes, 'Ensure that hook got the right context' );
	}

	/**
	 * @covers MobileContext::parseMobileUrlTemplate
	 */
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
			[ 'host' => '%h0.m.%h1.%h2', 'path' => '/path/morepath' ],
			$context->parseMobileUrlTemplate()
		);
	}

	/**
	 * @dataProvider updateMobileUrlHostProvider
	 * @covers MobileContext::updateMobileUrlHost
	 */
	public function testUpdateMobileUrlHost( $url, $expected, $urlTemplate ) {
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlHost" );
		$this->setMwGlobals( 'wgMobileUrlTemplate', $urlTemplate );
		$parsedUrl = wfParseUrl( $url );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), [ &$parsedUrl ] );
		$this->assertEquals( $expected, wfAssembleUrl( $parsedUrl ) );
	}

	public function updateMobileUrlHostProvider() {
		return [
			[
				'http://en.wikipedia.org/wiki/Gustavus_Airport',
				'http://en.m.wikipedia.org/wiki/Gustavus_Airport',
				'%h0.m.%h1.%h2',
			],
			[
				'https://127.0.0.1/wiki/Test',
				'https://127.0.0.1/wiki/Test',
				'%h0.m.%h1.%h2',
			],
		];
	}

	/**
	 * @covers MobileContext::usingMobileDomain
	 */
	public function testUsingMobileDomain() {
		$this->setMwGlobals( [
			'wgMFMobileHeader' => 'X-Subdomain',
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
		] );
		$context = $this->makeContext();
		$this->assertFalse( $context->usingMobileDomain() );
		$context->getRequest()->setHeader( 'X-Subdomain', 'M' );
		$this->assertTrue( $context->usingMobileDomain() );
	}

	/**
	 * @dataProvider updateDesktopUrlQueryProvider
	 * @covers MobileContext::updateDesktopUrlQuery
	 */
	public function testUpdateDesktopUrlQuery( $mobile, $desktop ) {
		$updateDesktopUrlQuery = self::getMethod( "updateDesktopUrlQuery" );
		$parsedUrl = wfParseUrl( $mobile );
		$updateDesktopUrlQuery->invokeArgs( $this->makeContext(), [ &$parsedUrl ] );
		$url = wfAssembleUrl( $parsedUrl );
		$this->assertEquals( $desktop, $url );
	}

	public function updateDesktopUrlQueryProvider() {
		$baseUrl = 'http://en.m.wikipedia.org/wiki/Gustavus_Airport';

		return [
			[
				$baseUrl . '?useformat=mobile&mobileaction=toggle_desktop_view',
				$baseUrl . '?mobileaction=toggle_desktop_view'
			],
		];
	}

	/**
	 * @dataProvider updateDesktopUrlHostProvider
	 * @covers MobileContext::updateDesktopUrlHost
	 */
	public function testUpdateDesktopUrlHost( $mobile, $desktop, $server ) {
		$updateMobileUrlHost = self::getMethod( "updateDesktopUrlHost" );
		$this->setMwGlobals( [
			'wgServer' => $server,
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
		] );
		$parsedUrl = wfParseUrl( $mobile );
		$updateMobileUrlHost->invokeArgs(
			$this->makeContext(),
			[ &$parsedUrl ] );
		$this->assertEquals( $desktop, wfAssembleUrl( $parsedUrl ) );
	}

	public function updateDesktopUrlHostProvider() {
		return [
			[
				'http://bm.m.wikipedia.org/wiki/' . urlencode( 'Nyɛ_fɔlɔ' ),
				'http://bm.wikipedia.org/wiki/' . urlencode( 'Nyɛ_fɔlɔ' ),
				'//bm.wikipedia.org',
			],
			[
				'http://en.m.wikipedia.org/wiki/Gustavus_Airport',
				'http://en.wikipedia.org/wiki/Gustavus_Airport',
				'//en.wikipedia.org',
			],
		];
	}

	/**
	 * @covers MobileContext::updateMobileUrlPath
	 */
	public function testUpdateMobileUrlPath() {
		$this->setMwGlobals( [
			'wgScriptPath' => '/wiki',
			'wgMobileUrlTemplate' => "/mobile/%p",
		] );
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlPath" );

		// check for constructing a templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), [ &$parsedUrl ] );
		$this->assertEquals(
			"http://en.wikipedia.org/wiki/mobile/Gustavus_Airport",
			wfAssembleUrl( $parsedUrl )
		);

		// check for maintaining an already templated URL
		$parsedUrl = wfParseUrl( "http://en.wikipedia.org/wiki/mobile/Gustavus_Airport" );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), [ &$parsedUrl ] );
		$this->assertEquals(
			"http://en.wikipedia.org/wiki/mobile/Gustavus_Airport",
			wfAssembleUrl( $parsedUrl )
		);
	}

	/**
	 * A null title shouldn't result in a fatal exception - bug T142914
	 * @covers MobileContext::shouldDisplayMobileView
	 * @covers MobileContext::shouldDisplayMobileViewInternal
	 * @covers MobileContext::getUseFormat
	 */
	public function testRedirectMobileEnabledPages() {
		$this->setMwGlobals( [
			'wgTitle' => null,
		] );
		$mobileContext = $this->makeContext();
		$mobileContext->getRequest()->setVal( 'action', 'history' );
		$mobileContext->getRequest()->setVal( 'useformat', 'mobile' );

		$this->assertTrue( $mobileContext->shouldDisplayMobileView() );
	}

	/**
	 * @dataProvider getMobileActionProvider
	 * @covers MobileContext::getMobileAction
	 */
	public function testGetMobileAction( $mobileaction = null ) {
		$context = $this->makeContext();
		if ( $mobileaction === null ) {
			$assert = '';
		} else {
			$context->getRequest()->setVal( 'mobileaction', $mobileaction );
			$assert = $mobileaction;
		}

		$this->assertEquals( $assert, $context->getMobileAction() );
	}

	public function getMobileActionProvider() {
		return [
			[ null ],
			[ 'view_normal_site' ],
		];
	}

	/**
	 * @covers MobileContext::getUseFormatCookieExpiry
	 */
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
				[ $startTime ]
			),
			'Using MobileFrontend expiry.'
		);

		$this->setMwGlobals( 'wgMobileFrontendFormatCookieExpiry', null );
		$defaultMWCookieExpected = $startTime + $wgCookieExpiration;
		$this->assertTrue(
			$defaultMWCookieExpected == $getUseFormatCookieExpiry->invokeArgs(
				$context,
				[ $startTime ]
			),
			'Using default MediaWiki cookie expiry.'
		);
	}

	/**
	 * @covers MobileContext::getStopMobileRedirectCookieDomain
	 */
	public function testGetStopMobileRedirectCookieDomain() {
		$context = $this->makeContext();
		$this->setMwGlobals( [
			'wgMFStopRedirectCookieHost' => null,
			'wgServer' => 'http://en.wikipedia.org',
		] );
		$this->assertEquals( '.wikipedia.org', $context->getStopMobileRedirectCookieDomain() );
		$this->setMwGlobals( 'wgMFStopRedirectCookieHost', 'foo.bar.baz' );
		$this->assertEquals( 'foo.bar.baz', $context->getStopMobileRedirectCookieDomain() );
	}

	/**
	 * @covers MobileContext::isLocalUrl
	 */
	public function testIsLocalUrl() {
		global $wgServer;
		$context = $this->makeContext();
		$this->assertTrue( $context->isLocalUrl( $wgServer ) );
		$this->assertFalse( $context->isLocalUrl( 'http://www.google.com' ) );
	}

	/**
	 * @dataProvider addAnalyticsLogItemProvider
	 * @covers MobileContext::getAnalyticsLogItems
	 */
	public function testAddAnalyticsLogItem( $key, array $inputs, $expected ) {
		$context = $this->makeContext();
		foreach ( $inputs as $input => $val ) {
			$context->addAnalyticsLogItem( $key, $val );
		}
		$context->addAnalyticsLogItem( $key, $val );
		$logItems = $context->getAnalyticsLogItems();
		$trimmedKey = trim( $key );
		$this->assertTrue( isset( $logItems[$trimmedKey] ) );
		$this->assertEquals( $expected, $logItems[$trimmedKey] );
	}

	public function addAnalyticsLogItemProvider() {
		return [
			[ 'mf-m', [ 'a' ], 'a' ],
			[ ' mf-m', [ 'b ' ], 'b' ],
			[ 'mf-m', [ 'a', 'b' ], 'a,b' ],
			[ 'mf-m', [ 'a', 'b' ], 'a,b' ],
		];
	}

	/**
	 * @dataProvider getXAnalyticsHeaderProvider
	 * @covers MobileContext::getXAnalyticsHeader
	 */
	public function testGetXAnalyticsHeader( $existingHeader, $logItems, $expectedHeader ) {
		$context = $this->makeContext();
		foreach ( $logItems as $key => $val ) {
			$context->addAnalyticsLogItem( $key, $val );
		}
		if ( $existingHeader ) {
			$context->getRequest()->response()->header( 'X-Analytics: ' . $existingHeader, true );
		}
		$this->assertEquals( $expectedHeader, $context->getXAnalyticsHeader() );
	}

	public function getXAnalyticsHeaderProvider() {
		return [
			[
				null,
				[ 'mf-m' => 'a', 'zot' => '123' ],
				'X-Analytics: mf-m=a;zot=123',
			],
			// check key/val trimming
			[
				null,
				[ '  foo' => '  bar  ', 'baz' => ' blat ' ],
				'X-Analytics: foo=bar;baz=blat'
			],
			// check urlencoding key/val pairs
			[
				null,
				[ 'foo' => 'bar baz', 'blat' => '$blammo' ],
				'X-Analytics: foo=bar+baz;blat=%24blammo'
			],
			// check handling of existing header value
			[
				'existing=value; another=item',
				[ 'mf-m' => 'a', 'zot' => '123' ],
				'X-Analytics: existing=value;another=item;mf-m=a;zot=123',
			],
		];
	}

	/**
	 * @dataProvider addAnalyticsLogItemFromXAnalyticsProvider
	 * @covers MobileContext::addAnalyticsLogItemFromXAnalytics
	 */
	public function testAddAnalyticsLogItemFromXAnalytics( $analyticsItem, $key, $val ) {
		$context = $this->makeContext();
		$context->addAnalyticsLogItemFromXAnalytics( $analyticsItem );
		$logItems = $context->getAnalyticsLogItems();
		$this->assertTrue( isset( $logItems[$key] ) );
		$this->assertEquals( $val, $logItems[$key] );
	}

	public function addAnalyticsLogItemFromXAnalyticsProvider() {
		return [
			[ 'mf-m=a', 'mf-m', 'a' ],
			// check key/val trimming
			[ ' mf-m=a ', 'mf-m', 'a' ],
			[ 'mf-m=a,b', 'mf-m', 'a,b' ],
			// check urldecode
			[ 'foo=bar+%24blat', 'foo', 'bar $blat' ],
		];
	}

	/**
	 * @dataProvider getMobileHostTokenProvider
	 * @covers MobileContext::getMobileHostToken
	 */
	public function testGetMobileHostToken( $domainTemplate, $result ) {
		$context = $this->makeContext();
		$this->assertEquals( $result, $context->getMobileHostToken( $domainTemplate ) );
	}

	public function getMobileHostTokenProvider() {
		return [
			[ '%h1.m.%h2.%h3', 'm.' ],
			[ '', '' ],
			[ 'bananas.%h2.%h3', 'bananas.' ],
		];
	}

	/**
	 * @dataProvider optInProvider
	 * @covers MobileContext::isBetaGroupMember
	 */
	public function testOptIn( array $cookies, $isBeta, $enabledInSettings ) {
		$this->setMwGlobals( 'wgMFEnableBeta', $enabledInSettings );
		$mobileContext = $this->makeContext( '/', $cookies );
		$this->assertEquals( $isBeta, $mobileContext->isBetaGroupMember() );
	}

	public function optInProvider() {
		return [
			[ [], false, true ],
			[ [ MobileContext::OPTIN_COOKIE_NAME => MobileContext::MODE_BETA ], true, true ],
			[ [ MobileContext::OPTIN_COOKIE_NAME => 'foobar' ], false, true ],
			[ [], false, false ],
			[ [ MobileContext::OPTIN_COOKIE_NAME => MobileContext::MODE_BETA ], false, false ],
			[ [ MobileContext::OPTIN_COOKIE_NAME => 'foobar' ], false, false ],
		];
	}

	/**
	 * @dataProvider provideToggleView
	 * @covers MobileContext::checkToggleView
	 * @covers MobileContext::doToggling
	 */
	public function testToggleView( $page, $url, $urlTemplate, $expectedLocation ) {
		$this->setMwGlobals( [
			'wgMobileUrlTemplate' => $urlTemplate,
			'wgServer' => '//en.wikipedia.org',
			// 'wgArticlePath' => '/wiki/$1',
			'wgScriptPath' => '/wiki',
		] );
		$context = $this->makeContext( $url );
		$context->getContext()->setTitle( Title::newFromText( $page ) );
		$context->checkToggleView();
		$context->doToggling();
		$location = $context->getOutput()->getRedirect();
		$this->assertEquals( $expectedLocation, $location );
	}

	public function provideToggleView() {
		$token = '%h0.m.%h1.%h2';
		return [
			[ 'Foo', '/', '', '' ],
			[ 'Foo', '/', $token, '' ],
			[ 'Main Page', '/wiki/Main_Page', '', '' ],
			[ 'Main Page', '/wiki/Main_Page', $token, '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=mobile', '', '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=mobile', $token, '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=desktop', '', '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=desktop', $token, '' ],
			[ 'Foo', '/?mobileaction=toggle_view_desktop', '', '' ],
			[ 'Foo', '/?mobileaction=toggle_view_mobile', '', '' ],
			[ 'Page', '/wiki/Page?mobileaction=toggle_view_desktop',
				'', ''
			],
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
		];
	}

	/**
	 * @codeCoverageIgnore
	 * @coversNothing
	 */
	public function testBug71329() {
		$services = MediaWikiServices::getInstance();
		$services->resetServiceForTesting( 'SpecialPageFactory' );
		RequestContext::resetMain();
		$req = new FauxRequest(
			[ 'title' => 'Special:Search', 'mobileaction' => 'toggle_view_mobile' ]
		);
		$req->setRequestURL( '/w/index.php?title=Special:Search&mobileaction=toggle_view_mobile' );
		RequestContext::getMain()->setRequest( $req );
		MobileContext::resetInstanceForTesting();
		$this->setMwGlobals( 'wgTitle', null );
		SpecialPage::getTitleFor( 'Search' );
		$this->assertTrue( true, 'In case of failure this test just crashes' );
	}

	/**
	 * @dataProvider provideShouldStripResponsiveImages
	 * @covers MobileContext::shouldStripResponsiveImages
	 * @covers MobileContext::setForceMobileView
	 */
	public function testShouldStripResponsiveImages(
		$expected,
		$forceMobileView,
		$wgMFStripResponsiveImages,
		$stripResponsiveImages = null
	) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$context->setForceMobileView( $forceMobileView );

		$this->setMwGlobals(
			'wgMFStripResponsiveImages',
			$wgMFStripResponsiveImages
		);

		$context->setStripResponsiveImages( $stripResponsiveImages );

		$this->assertEquals( $expected, $context->shouldStripResponsiveImages() );
	}

	public static function provideShouldStripResponsiveImages() {
		return [
			[ true, true, true ],
			[ false, true, false ],
			[ false, false, true ],
			[ false, true, true, false ],
		];
	}
}
