<?php

use MediaWiki\Context\MutableContext;
use MediaWiki\Context\RequestContext;
use MediaWiki\MainConfigNames;
use MediaWiki\Request\FauxRequest;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;
use Wikimedia\TestingAccessWrapper;

/**
 * @group MobileFrontend
 * @covers MobileContext
 */
class MobileContextTest extends MediaWikiIntegrationTestCase {

	protected function tearDown(): void {
		parent::tearDown();

		MobileContext::resetInstanceForTesting();
	}

	private function makeContext( string $url = '/', array $cookies = [] ): MobileContext {
		$services = $this->getServiceContainer();
		$urlUtils = $services->getUrlUtils();

		$query = [];
		if ( $url ) {
			$params = $urlUtils->parse( $urlUtils->expand( $url, PROTO_CURRENT ) ?? '' );
			if ( isset( $params['query'] ) ) {
				$query = wfCgiToArray( $params['query'] );
			}
		}

		$request = new FauxRequest( $query );
		$request->setRequestURL( $url );
		$request->setCookies( $cookies, '' );

		MobileContext::resetInstanceForTesting();
		/** @var MobileContext $instance */
		$instance = $services->getService( 'MobileFrontend.Context' );

		/** @var MutableContext $context */
		$context = $instance->getContext();
		$context->setRequest( $request );

		return $instance;
	}

	public function testHasMobileDomain() {
		// default
		$this->overrideConfigValues( [
			'MobileUrlCallback' => null,
		] );

		$this->overrideConfigValue( MainConfigNames::Server, '//en.example.org' );
		$this->assertFalse( $this->makeContext()->hasMobileDomain() );

		// mobile subdomain for one site but not the other
		$this->overrideConfigValues( [
			'MobileUrlCallback' => static fn ( $domain ) => $domain === 'en.example.org' ? 'en.m.example.org' : $domain,
		] );

		$this->overrideConfigValue( MainConfigNames::Server, '//en.example.org' );
		$this->assertTrue( $this->makeContext()->hasMobileDomain() );

		$this->overrideConfigValue( MainConfigNames::Server, '//other.example.org' );
		$this->assertFalse( $this->makeContext()->hasMobileDomain() );
	}

	public function testGetMobileUrl() {
		$this->overrideConfigValues( [
			'MFMobileHeader' => 'X-Subdomain',
			MainConfigNames::Server => '//en.example.org',
			'MobileUrlCallback' => static fn ( $domain ) => $domain === 'en.example.org' ? 'en.m.example.org' : $domain,
		] );
		$context = $this->makeContext();
		$context->getRequest()->setHeader( 'X-Subdomain', 'M' );

		$this->assertEquals(
			'http://en.m.example.org/wiki/Article',
			$context->getMobileUrl( 'http://en.example.org/wiki/Article' )
		);
		$this->assertEquals(
			'//en.m.example.org/wiki/Article',
			$context->getMobileUrl( '//en.example.org/wiki/Article' )
		);
		// test local URLs - task T107505
		$this->assertEquals(
			'http://en.m.example.org/wiki/Article',
			$context->getMobileUrl( '/wiki/Article' )
		);
		// test other wiki
		$this->assertEquals(
			'http://wikitech.wikimedia.org/wiki/Main_Page',
			$context->getMobileUrl( 'http://wikitech.wikimedia.org/wiki/Main_Page' )
		);
	}

	public function testUsingMobileDomain() {
		$this->overrideConfigValues( [
			'MFMobileHeader' => 'X-Subdomain',
			MainConfigNames::Server => '//en.example.org',
			'MobileUrlCallback' => static fn ( $domain ) => $domain === 'en.example.org' ? 'en.m.example.org' : $domain,
		] );
		$context = $this->makeContext();
		$this->assertFalse( $context->usingMobileDomain() );
		$context->getRequest()->setHeader( 'X-Subdomain', 'M' );
		$this->assertTrue( $context->usingMobileDomain() );
	}

	/**
	 * @covers MobileContext
	 * @dataProvider provideUpdateDesktopUrlQuery
	 */
	public function testGetDesktopUrlQuery( $mobile, $expectedDesktop ) {
		$context = $this->makeContext();
		$this->assertEquals( $expectedDesktop, $context->getDesktopUrl( $mobile ) );
	}

	public static function provideUpdateDesktopUrlQuery() {
		$baseUrl = 'http://some.thing.example.org/page/Gustavus_Airport';

		return [
			[
				$baseUrl . '?useformat=mobile&mobileaction=toggle_desktop_view',
				$baseUrl . '?mobileaction=toggle_desktop_view'
			],
		];
	}

	/**
	 * @dataProvider provideUpdateDesktopUrlHost
	 */
	public function testGetDesktopUrlHost( $mobile, $expectedDesktop, $server ) {
		$this->overrideConfigValues( [
			MainConfigNames::Server => $server,
			'MobileUrlCallback' => static fn ( $domain ) => $domain === 'en.example.org' ? 'en.m.example.org' : $domain,
		] );
		$context = $this->makeContext();
		$this->assertEquals( $expectedDesktop, $context->getDesktopUrl( $mobile ) );
	}

	public static function provideUpdateDesktopUrlHost() {
		return [
			[
				'http://en.m.example.org/wiki/' . urlencode( 'Nyɛ_fɔlɔ' ),
				'http://en.example.org/wiki/' . urlencode( 'Nyɛ_fɔlɔ' ),
				'//en.example.org',
			],
			[
				'http://en.m.example.org/wiki/Gustavus_Airport',
				'http://en.example.org/wiki/Gustavus_Airport',
				'//en.example.org',
			],
		];
	}

	/**
	 * A null title shouldn't result in a fatal exception - bug T142914
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
		$context = TestingAccessWrapper::newFromObject( $this->makeContext() );
		$startTime = time();
		$this->overrideConfigValue( 'MobileFrontendFormatCookieExpiry', 60 );
		$mfCookieExpected = $startTime + 60;
		$this->assertTrue(
			$mfCookieExpected === $context->getUseFormatCookieExpiry( $startTime ),
			'Using MobileFrontend expiry.'
		);

		$this->overrideConfigValue( 'MobileFrontendFormatCookieExpiry', null );
		$defaultMWCookieExpected = $startTime +
			$this->getServiceContainer()->getMainConfig()->get( MainConfigNames::CookieExpiration );
		$this->assertTrue(
			$defaultMWCookieExpected === $context->getUseFormatCookieExpiry( $startTime ),
			'Using default MediaWiki cookie expiry.'
		);
	}

	/**
	 * @covers \MobileFrontend\WMFBaseDomainExtractor
	 */
	public function testGetStopMobileRedirectCookieDomain() {
		$context = $this->makeContext();
		$this->overrideConfigValues( [
			'MFStopRedirectCookieHost' => null,
			MainConfigNames::Server => 'https://test.wikipedia.org',
		] );
		$this->assertEquals( '.wikipedia.org', $context->getStopMobileRedirectCookieDomain() );
		$this->overrideConfigValue( 'MFStopRedirectCookieHost', 'foo.bar.baz' );
		$this->assertEquals( 'foo.bar.baz', $context->getStopMobileRedirectCookieDomain() );
	}

	public function testIsLocalUrl() {
		$server = $this->getServiceContainer()->getMainConfig()->get( MainConfigNames::Server );
		$context = $this->makeContext();
		$this->assertTrue( $context->isLocalUrl( $server ) );
		$this->assertFalse( $context->isLocalUrl( 'http://www.google.com' ) );
	}

	/**
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
	 * @dataProvider provideToggleView
	 */
	public function testToggleView( $page, $url, $expectedLocation ) {
		$this->overrideConfigValues( [
			'MobileUrlCallback' => null,
			MainConfigNames::Server => '//en.example.org',
			MainConfigNames::ArticlePath => '/wiki/$1',
			MainConfigNames::ScriptPath => '/w',
		] );
		$context = $this->makeContext( $url );
		$context->getContext()->setTitle( Title::newFromText( $page ) );
		$context->checkToggleView();
		$context->doToggling();
		$location = $context->getOutput()->getRedirect();
		$this->assertEquals( $expectedLocation, $location );
	}

	public static function provideToggleView() {
		return [
			[ 'Foo', '/', '' ],
			[ 'Main Page', '/wiki/Main_Page', '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=mobile', '' ],
			[ 'Main Page', '/wiki/Main_Page?useformat=desktop', '' ],
			[ 'Foo', '/?mobileaction=toggle_view_desktop', 'http://en.example.org/wiki/Foo' ],
			[ 'Foo', '/?mobileaction=toggle_view_mobile', 'http://en.example.org/wiki/Foo' ],
			[ 'Page', '/wiki/Page?mobileaction=toggle_view_desktop', 'http://en.example.org/wiki/Page' ],
		];
	}

	/**
	 * @codeCoverageIgnore
	 * @coversNothing
	 */
	public function testT73329() {
		$services = $this->getServiceContainer();
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
