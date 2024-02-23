<?php

use MediaWiki\MainConfigNames;
use MediaWiki\MediaWikiServices;
use MediaWiki\Request\FauxRequest;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;
use MobileFrontend\Tests\Utils;

/**
 * @group MobileFrontend
 */
class MobileContextTest extends MediaWikiIntegrationTestCase {
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

	protected function tearDown(): void {
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
		/** @var MobileContext $instance */
		$instance = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		/** @var MutableContext $context */
		$context = $instance->getContext();
		$context->setRequest( $request );

		return $instance;
	}

	/**
	 * @covers MobileContext::hasMobileDomain
	 */
	public function testHasMobileDomain() {
		// not configured
		$this->overrideConfigValues( [
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => '',
		] );

		$this->overrideConfigValue( MainConfigNames::Server, '//en.wikipedia.org' );
		$context = $this->makeContext();
		$this->assertFalse( $context->hasMobileDomain() );

		// callback
		$this->overrideConfigValues( [
			'MobileUrlCallback' => [ Utils::class, 'mobileUrlCallback' ],
			'MobileUrlTemplate' => '',
		] );

		$this->overrideConfigValue( MainConfigNames::Server, '//en.wikipedia.org' );
		$context = $this->makeContext();
		$this->assertTrue( $context->hasMobileDomain() );

		// When a domain is returned unchanged, there is no mobile domain.
		$this->overrideConfigValue( MainConfigNames::Server, '//wikitech.wikimedia.org' );
		$context = $this->makeContext();
		$this->assertFalse( $context->hasMobileDomain() );

		// template
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::getMobileUrlTemplate was deprecated in MobileFrontend 1\.42\./'
		);
		$this->overrideConfigValues( [
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => '%h0.m.%h1.%h2',
		] );

		$this->overrideConfigValue( MainConfigNames::Server, '//en.wikipedia.org' );
		$context = $this->makeContext();
		$this->assertTrue( $context->hasMobileDomain() );

		// the template is ignored when the callback is set
		$this->overrideConfigValues( [
			'MobileUrlCallback' => [ Utils::class, 'mobileUrlCallback' ],
			'MobileUrlTemplate' => 'm.%h1.%h2',
		] );

		$this->overrideConfigValue( MainConfigNames::Server, '//wikitech.wikimedia.org' );
		$context = $this->makeContext();
		$this->assertFalse( $context->hasMobileDomain() );
	}

	/**
	 * @covers MobileContext::getMobileUrl
	 */
	public function testGetMobileUrl() {
		$this->overrideConfigValues( [
			'MFMobileHeader' => 'X-Subdomain',
			MainConfigNames::Server => '//en.wikipedia.org',
			'MobileUrlCallback' => [ Utils::class, 'mobileUrlCallback' ],
			'MobileUrlTemplate' => '%h0.%h1.m.%h2',
		] );
		$context = $this->makeContext();
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
		// test other wikis
		$this->assertEquals(
			'http://de.m.wiktionary.org/wiki/Article',
			$context->getMobileUrl( 'http://de.wiktionary.org/wiki/Article' )
		);
		$this->assertEquals(
			'http://m.wikidata.org/wiki/Q1',
			$context->getMobileUrl( 'http://www.wikidata.org/wiki/Q1' )
		);
		$this->assertEquals(
			'http://wikitech.wikimedia.org/wiki/Main_Page',
			$context->getMobileUrl( 'http://wikitech.wikimedia.org/wiki/Main_Page' )
		);
	}

	/**
	 * @covers MobileContext::getMobileUrl
	 */
	public function testGetMobileUrl_template() {
		$this->overrideConfigValues( [
			'MFMobileHeader' => 'X-Subdomain',
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => '%h0.m.%h1.%h2',
			MainConfigNames::Server => '//en.wikipedia.org',
		] );
		$invokes = 0;
		$context = $this->makeContext();
		$this->expectDeprecationAndContinue(
			'/Use of (GetMobileUrl hook .*|MobileContext::.*MobileUrl.*) was deprecated in MobileFrontend 1\.42\./'
		);
		$this->setTemporaryHook(
			'GetMobileUrl',
			function ( &$string, $hookCtx ) use (
					&$invokes,
					$context
				) {
					$this->assertEquals( $context, $hookCtx );
					$invokes++;
			}
		);
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
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::.*MobileUrlTemplate was deprecated in MobileFrontend 1\.42\./'
		);
		$this->overrideConfigValue( 'MobileUrlTemplate', '%h0.m.%h1.%h2/path/morepath' );
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
	 * @covers MobileContext::updateMobileUrlHost
	 * @dataProvider updateMobileUrlHostProvider
	 */
	public function testUpdateMobileUrlHost( $url, $expected, $urlTemplate ) {
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::.*MobileUrl.* was deprecated in MobileFrontend 1\.42\./'
		);
		$updateMobileUrlHost = self::getMethod( "updateMobileUrlHost" );
		$this->overrideConfigValue( 'MobileUrlTemplate', $urlTemplate );
		$parsedUrl = wfParseUrl( $url );
		$updateMobileUrlHost->invokeArgs( $this->makeContext(), [ &$parsedUrl ] );
		$this->assertEquals( $expected, wfAssembleUrl( $parsedUrl ) );
	}

	public static function updateMobileUrlHostProvider() {
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
		$this->overrideConfigValues( [
			'MFMobileHeader' => 'X-Subdomain',
			'MobileUrlCallback' => [ Utils::class, 'mobileUrlCallback' ],
			'MobileUrlTemplate' => '',
		] );
		$context = $this->makeContext();
		$this->assertFalse( $context->usingMobileDomain() );
		$context->getRequest()->setHeader( 'X-Subdomain', 'M' );
		$this->assertTrue( $context->usingMobileDomain() );

		// test deprecated config variable
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::.*MobileUrl.* was deprecated in MobileFrontend 1\.42\./'
		);
		$this->overrideConfigValues( [
			'MFMobileHeader' => 'X-Subdomain',
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => '%h0.m.%h1.%h2',
		] );
		$context = $this->makeContext();
		$this->assertFalse( $context->usingMobileDomain() );
		$context->getRequest()->setHeader( 'X-Subdomain', 'M' );
		$this->assertTrue( $context->usingMobileDomain() );
	}

	/**
	 * @covers MobileContext::updateDesktopUrlQuery
	 * @dataProvider updateDesktopUrlQueryProvider
	 */
	public function testUpdateDesktopUrlQuery( $mobile, $desktop ) {
		$updateDesktopUrlQuery = self::getMethod( "updateDesktopUrlQuery" );
		$parsedUrl = wfParseUrl( $mobile );
		$updateDesktopUrlQuery->invokeArgs( $this->makeContext(), [ &$parsedUrl ] );
		$url = wfAssembleUrl( $parsedUrl );
		$this->assertEquals( $desktop, $url );
	}

	public static function updateDesktopUrlQueryProvider() {
		$baseUrl = 'http://en.m.wikipedia.org/wiki/Gustavus_Airport';

		return [
			[
				$baseUrl . '?useformat=mobile&mobileaction=toggle_desktop_view',
				$baseUrl . '?mobileaction=toggle_desktop_view'
			],
		];
	}

	/**
	 * @covers MobileContext::updateDesktopUrlHost
	 * @dataProvider updateDesktopUrlHostProvider
	 */
	public function testUpdateDesktopUrlHost( $mobile, $desktop, $server ) {
		$updateMobileUrlHost = self::getMethod( "updateDesktopUrlHost" );
		$this->overrideConfigValues( [
			MainConfigNames::Server => $server,
			'MobileUrlCallback' => [ Utils::class, 'mobileUrlCallback' ],
			'MobileUrlTemplate' => '',
		] );
		$parsedUrl = wfParseUrl( $mobile );
		$updateMobileUrlHost->invokeArgs(
			$this->makeContext(),
			[ &$parsedUrl ] );
		$this->assertEquals( $desktop, wfAssembleUrl( $parsedUrl ) );

		// test deprecated config variable
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::.*MobileUrl.* was deprecated in MobileFrontend 1\.42\./'
		);
		$updateMobileUrlHost = self::getMethod( "updateDesktopUrlHost" );
		$this->overrideConfigValues( [
			MainConfigNames::Server => $server,
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => '%h0.m.%h1.%h2',
		] );
		$parsedUrl = wfParseUrl( $mobile );
		$updateMobileUrlHost->invokeArgs(
			$this->makeContext(),
			[ &$parsedUrl ] );
		$this->assertEquals( $desktop, wfAssembleUrl( $parsedUrl ) );
	}

	public static function updateDesktopUrlHostProvider() {
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
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::.*MobileUrl.* was deprecated in MobileFrontend 1\.42\./'
		);
		$this->overrideConfigValues( [
			MainConfigNames::ScriptPath => '/wiki',
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => "/mobile/%p",
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
	 * @covers MobileContext::getMobileAction
	 * @dataProvider getMobileActionProvider
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

	public static function getMobileActionProvider() {
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
		$this->overrideConfigValue( 'MobileFrontendFormatCookieExpiry', 60 );
		$mfCookieExpected = $startTime + 60;
		$this->assertTrue(
			$mfCookieExpected == $getUseFormatCookieExpiry->invokeArgs(
				$context,
				[ $startTime ]
			),
			'Using MobileFrontend expiry.'
		);

		$this->overrideConfigValue( 'MobileFrontendFormatCookieExpiry', null );
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
		$this->overrideConfigValues( [
			'MFStopRedirectCookieHost' => null,
			MainConfigNames::Server => 'http://en.wikipedia.org',
		] );
		$this->assertEquals( '.wikipedia.org', $context->getStopMobileRedirectCookieDomain() );
		$this->overrideConfigValue( 'MFStopRedirectCookieHost', 'foo.bar.baz' );
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
	 * @covers MobileContext::getAnalyticsLogItems
	 * @dataProvider addAnalyticsLogItemProvider
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

	public static function addAnalyticsLogItemProvider() {
		return [
			[ 'mf-m', [ 'a' ], 'a' ],
			[ ' mf-m', [ 'b ' ], 'b' ],
			[ 'mf-m', [ 'a', 'b' ], 'a,b' ],
			[ 'mf-m', [ 'a', 'b' ], 'a,b' ],
		];
	}

	/**
	 * @covers MobileContext::getXAnalyticsHeader
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
		$this->assertEquals( $expectedHeader, $context->getXAnalyticsHeader() );
	}

	public static function getXAnalyticsHeaderProvider() {
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
	 * @covers MobileContext::addAnalyticsLogItemFromXAnalytics
	 * @dataProvider addAnalyticsLogItemFromXAnalyticsProvider
	 */
	public function testAddAnalyticsLogItemFromXAnalytics( $analyticsItem, $key, $val ) {
		$context = $this->makeContext();
		$context->addAnalyticsLogItemFromXAnalytics( $analyticsItem );
		$logItems = $context->getAnalyticsLogItems();
		$this->assertTrue( isset( $logItems[$key] ) );
		$this->assertEquals( $val, $logItems[$key] );
	}

	public static function addAnalyticsLogItemFromXAnalyticsProvider() {
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
	 * @covers MobileContext::getMobileHostToken
	 * @dataProvider getMobileHostTokenProvider
	 */
	public function testGetMobileHostToken( $domainTemplate, $result ) {
		$this->expectDeprecationAndContinue(
			'/Use of MobileContext::getMobileHostToken was deprecated in MobileFrontend 1\.42\./'
		);
		$context = $this->makeContext();
		$this->assertEquals( $result, $context->getMobileHostToken( $domainTemplate ) );
	}

	public static function getMobileHostTokenProvider() {
		return [
			[ '%h1.m.%h2.%h3', 'm.' ],
			[ '', '' ],
			[ 'bananas.%h2.%h3', 'bananas.' ],
		];
	}

	/**
	 * @covers MobileContext::isBetaGroupMember
	 * @dataProvider optInProvider
	 */
	public function testOptIn( array $cookies, $isBeta, $enabledInSettings ) {
		$this->overrideConfigValue( 'MFEnableBeta', $enabledInSettings );
		$mobileContext = $this->makeContext( '/', $cookies );
		$this->assertEquals( $isBeta, $mobileContext->isBetaGroupMember() );
	}

	public static function optInProvider() {
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
	 * @covers MobileContext::checkToggleView
	 * @covers MobileContext::doToggling
	 * @dataProvider provideToggleView
	 */
	public function testToggleView( $page, $url, $urlCallback, $urlTemplate, $expectedLocation ) {
		$this->overrideConfigValues( [
			'MobileUrlCallback' => $urlCallback,
			'MobileUrlTemplate' => '',
			MainConfigNames::Server => '//en.wikipedia.org',
			// 'wgArticlePath' => '/wiki/$1',
			MainConfigNames::ScriptPath => '/wiki',
		] );
		$context = $this->makeContext( $url );
		$context->getContext()->setTitle( Title::newFromText( $page ) );
		$context->checkToggleView();
		$context->doToggling();
		$location = $context->getOutput()->getRedirect();
		$this->assertEquals( $expectedLocation, $location );

		// test deprecated config variable
		$this->overrideConfigValues( [
			'MobileUrlCallback' => null,
			'MobileUrlTemplate' => $urlTemplate,
			MainConfigNames::Server => '//en.wikipedia.org',
			// 'wgArticlePath' => '/wiki/$1',
			MainConfigNames::ScriptPath => '/wiki',
		] );
		$context = $this->makeContext( $url );
		$context->getContext()->setTitle( Title::newFromText( $page ) );
		$context->checkToggleView();
		$context->doToggling();
		$location = $context->getOutput()->getRedirect();
		$this->assertEquals( $expectedLocation, $location );
	}

	public static function provideToggleView() {
		$mobileUrlCallback = [ Utils::class, 'mobileUrlCallback' ];
		$mobileUrlTemplate = '%h0.m.%h1.%h2';
		return [
			[ 'Foo', '/', null, '', '' ],
			[ 'Foo', '/', $mobileUrlCallback, $mobileUrlTemplate, '' ],
			[ 'Main Page', '/wiki/Main_Page', null, '', '' ],
			[ 'Main Page', '/wiki/Main_Page', $mobileUrlCallback, $mobileUrlTemplate, '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=mobile', null, '', '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=mobile', $mobileUrlCallback, $mobileUrlTemplate, '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=desktop', null, '', '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=desktop', $mobileUrlCallback, $mobileUrlTemplate, '' ],
			[ 'Foo', '/?mobileaction=toggle_view_desktop', null, '', '' ],
			[ 'Foo', '/?mobileaction=toggle_view_mobile', null, '', '' ],
			[ 'Page', '/wiki/Page?mobileaction=toggle_view_desktop', null, '', '' ],
			/*
			FIXME: works locally but fails in Jerkins
			array( 'Main Page', '/?mobileaction=toggle_view_desktop',
				$mobileUrlCallback, $mobileUrlTemplate, 'http://en.wikipedia.org/wiki/Main_Page'
			),
			array( 'Main Page', '/?mobileaction=toggle_view_mobile',
				$mobileUrlCallback, $mobileUrlTemplate, 'http://en.m.wikipedia.org/wiki/Main_Page'
			),
			array( 'Page', '/wiki/Page?mobileaction=toggle_view_mobile',
				$mobileUrlCallback, $mobileUrlTemplate, 'http://en.m.wikipedia.org/wiki/Page'
			),
			array( 'Page', '/wiki/Page?mobileaction=toggle_view_desktop',
				$mobileUrlCallback, $mobileUrlTemplate, 'http://en.wikipedia.org/wiki/Page'
			),
			array( 'Special:Foo',
				'/wiki/index.php?title=Special:Foo&bar=baz&mobileaction=toggle_view_desktop',
				$mobileUrlCallback, $mobileUrlTemplate,
				'http://en.wikipedia.org/w/index.php?title=Special:Foo&bar=baz'
			),
			array( 'Special:Foo',
				'/wiki/index.php?title=Special%3AFoo&bar=baz&mobileaction=toggle_view_mobile',
				$mobileUrlCallback, $mobileUrlTemplate,
				'http://en.m.wikipedia.org/w/index.php?title=Special:Foo&bar=baz'
			),
			array( 'Page', '/wiki/index.php?title=Page&mobileaction=toggle_view_desktop',
				$mobileUrlCallback, $mobileUrlTemplate, 'http://en.wikipedia.org/wiki/Page',
			),
			array( 'Page', '/wiki/index.php?title=Page&mobileaction=toggle_view_mobile',
				$mobileUrlCallback, $mobileUrlTemplate, 'http://en.m.wikipedia.org/wiki/Page',
			),
			*/
		];
	}

	/**
	 * @codeCoverageIgnore
	 * @coversNothing
	 */
	public function testT73329() {
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
}
