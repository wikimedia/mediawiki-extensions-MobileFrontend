<?php

use MediaWiki\MediaWikiServices;
use MediaWiki\User\UserIdentity;
use MediaWiki\User\UserOptionsLookup;
use Psr\Container\ContainerInterface;
use Wikimedia\ObjectFactory\ObjectFactory;

/**
 * @group MobileFrontend
 */
class MobileFrontendHooksTest extends MediaWikiIntegrationTestCase {
	protected function setUp(): void {
		parent::setUp();

		MobileContext::resetInstanceForTesting();
	}

	/**
	 * Test findTagline when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenNoElementsPresent() {
		$po = new ParserOutput();
		$fallback = function () {
			$this->fail( 'Fallback shouldn\'t be called' );
		};
		$this->assertNull( MobileFrontendHooks::findTagline( $po, $fallback ) );
	}

	/**
	 * Test findTagline when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenItemIsNotPresent() {
		$poWithDesc = new ParserOutput();
		$poWithDesc->setPageProperty( 'wikibase-shortdesc', 'desc' );

		$fallback = function () {
			$this->fail( 'Fallback shouldn\'t be called' );
		};
		$this->assertSame( 'desc', MobileFrontendHooks::findTagline( $poWithDesc, $fallback ) );
	}

	/**
	 * Test findTagline when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenOnlyItemIsPresent() {
		$fallback = function ( $item ) {
			$this->assertSame( 'W2', $item );
			return 'Hello Wikidata';
		};

		$poWithItem = new ParserOutput();
		$poWithItem->setPageProperty( 'wikibase_item', 'W2' );
		$this->assertSame(
			'Hello Wikidata',
			MobileFrontendHooks::findTagline( $poWithItem, $fallback )
		);
	}

	/**
	 * Test findTagline when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenWikibaseAttrsArePresent() {
		$fallback = function () {
			$this->fail( 'Fallback shouldn\'t be called' );
		};

		$poWithBoth = new ParserOutput();
		$poWithBoth->setPageProperty( 'wikibase-shortdesc', 'Hello world' );
		$poWithBoth->setPageProperty( 'wikibase_item', 'W2' );
		$this->assertSame(
			'Hello world',
			MobileFrontendHooks::findTagline( $poWithBoth, $fallback )
		);
	}

	/**
	 * Test headers and alternate/canonical links to be set or not
	 *
	 * @covers MobileFrontendHooks::onBeforePageDisplay
	 * @dataProvider onBeforePageDisplayDataProvider
	 */
	public function testOnBeforePageDisplay( $mobileUrlTemplate, $mfNoindexPages,
		$mfEnableXAnalyticsLogging, $mfAutoDetectMobileView, $mfVaryOnUA, $mfXAnalyticsItems,
		$isAlternateCanonical, $isXAnalytics, $mfVaryHeaderSet
	) {
		$this->setMwGlobals( [
			'wgMFEnableManifest' => false,
			'wgMobileUrlTemplate' => $mobileUrlTemplate,
			'wgMFNoindexPages' => $mfNoindexPages,
			'wgMFEnableXAnalyticsLogging' => $mfEnableXAnalyticsLogging,
			'wgMFAutodetectMobileView' => $mfAutoDetectMobileView,
			'wgMFVaryOnUA' => $mfVaryOnUA,
		] );

		// test with forced mobile view
		$param = $this->getContextSetup( 'mobile', $mfXAnalyticsItems );
		$out = $param['out'];
		$skin = $param['sk'];

		// run the test
		MobileFrontendHooks::onBeforePageDisplay( $out, $skin );

		// test, if alternate or canonical link is added, but not both
		$links = $out->getLinkTags();
		$this->assertCount( $isAlternateCanonical, $links,
			'test, if alternate or canonical link is added, but not both' );
		// if there should be an alternate or canonical link, check, if it's the correct one
		if ( $isAlternateCanonical ) {
			// should be canonical link, not alternate in mobile view
			$this->assertSame( 'canonical', $links[0]['rel'],
				'should be canonical link, not alternate in mobile view' );
		}
		$varyHeader = $out->getVaryHeader();
		$this->assertSame( $mfVaryHeaderSet, strpos( $varyHeader, 'User-Agent' ) !== false,
			'check the status of the User-Agent vary header when wgMFVaryOnUA is enabled' );

		// check, if XAnalytics is set, if it should be
		$resp = $param['context']->getRequest()->response();
		$this->assertSame( $isXAnalytics, $resp->getHeader( 'X-Analytics' ),
			'check, if XAnalytics is set, if it should be' );

		// test with forced desktop view
		$param = $this->getContextSetup( 'desktop', $mfXAnalyticsItems );
		$out = $param['out'];
		$skin = $param['sk'];

		// run the test
		MobileFrontendHooks::onBeforePageDisplay( $out, $skin );
		// test, if alternate or canonical link is added, but not both
		$links = $out->getLinkTags();
		$this->assertCount( $isAlternateCanonical, $links,
			'test, if alternate or canonical link is added, but not both' );
		// if there should be an alternate or canonical link, check, if it's the correct one
		if ( $isAlternateCanonical ) {
			// should be alternate link, not canonical in desktop view
			$this->assertSame( 'alternate', $links[0]['rel'],
				'should be alternate link, not canonical in desktop view' );
		}
		$varyHeader = $out->getVaryHeader();
		// check, if the vary header is set in desktop mode
		$this->assertSame( $mfVaryHeaderSet, strpos( $varyHeader, 'User-Agent' ) !== false,
			'check, if the vary header is set in desktop mode' );
		// there should never be an XAnalytics header in desktop mode
		$resp = $param['context']->getRequest()->response();
		$this->assertNull( $resp->getHeader( 'X-Analytics' ),
			'there should never be an XAnalytics header in desktop mode' );
	}

	/**
	 * Creates a new set of object for the actual test context, including a new
	 * outputpage and skintemplate.
	 *
	 * @param string $mode The mode for the test cases (desktop, mobile)
	 * @param array $mfXAnalyticsItems
	 * @param Title|null $title
	 * @return array Array of objects, including MobileContext (context),
	 * SkinTemplate (sk) and OutputPage (out)
	 */
	protected function getContextSetup( $mode, $mfXAnalyticsItems, $title = null ) {
		MobileContext::resetInstanceForTesting();
		$context = MobileContext::singleton();

		$mainContext = new DerivativeContext( RequestContext::getMain() );
		$out = new OutputPage( $context );
		$skin = new SkinTemplate();
		if ( $title === null ) {
			$title = Title::newMainPage();
		}
		// create a FauxRequest to use instead of a WebRequest object (FauxRequest forces
		// the creation of a FauxResponse, which allows to investigate sent header values)
		$request = new FauxRequest();
		$mainContext->setRequest( $request );
		$mainContext->setTitle( $title );
		$skin->setContext( $mainContext );
		$mainContext->setOutput( $out );
		$context->setContext( $mainContext );
		$request->setVal( 'useformat', $mode );
		foreach ( $mfXAnalyticsItems as $key => $val ) {
			$context->addAnalyticsLogItem( $key, $val );
		}

		return [
			'out' => $out,
			'sk' => $skin,
			'context' => $context,
		];
	}

	/**
	 * Dataprovider for testOnBeforePageDisplay
	 */
	public function onBeforePageDisplayDataProvider() {
		return [
			// wgMobileUrlTemplate, wgMFNoindexPages, wgMFEnableXAnalyticsLogging, wgMFAutodetectMobileView,
			// wgMFVaryOnUA, XanalyticsItems, alternate & canonical link, XAnalytics, Vary header User-Agent
			[ true, true, true, true, true,
				[ 'mf-m' => 'a' ], 1, 'mf-m=a', false, ],
			[ true, false, true, false, false,
				[ 'mf-m' => 'a' ], 0, 'mf-m=a', false, ],
			[ false, true, true, true, true,
				[ 'mf-m' => 'a' ], 0, 'mf-m=a', true, ],
			[ false, false, true, false, false,
				[ 'mf-m' => 'a' ], 0, 'mf-m=a', false, ],
			[ true, true, false, true, true, [], 1, null, false, ],
			[ true, false, false, false, false, [], 0, null, false, ],
			[ false, true, false, true, true, [], 0, null, true, ],
			[ false, false, false, false, false, [], 0, null, false, ],
			[ false, false, false, false, true, [], 0, null, false, ],
		];
	}

	/**
	 * @covers MobileFrontendHooks::onTitleSquidURLs
	 */
	public function testOnTitleSquidURLs() {
		$this->setMwGlobals( [
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
			'wgServer' => 'http://en.wikipedia.org',
			'wgArticlePath' => '/wiki/$1',
			'wgScriptPath' => '/w',
			'wgScript' => '/w/index.php',
		] );
		$title = Title::newFromText( 'PurgeTest' );

		$htmlCacheUpdater = MediaWikiServices::getInstance()->getHtmlCacheUpdater();
		$urls = $htmlCacheUpdater->getUrls( $title );

		$expected = [
			'http://en.wikipedia.org/wiki/PurgeTest',
			'http://en.wikipedia.org/w/index.php?title=PurgeTest&action=history',
			'http://en.m.wikipedia.org/w/index.php?title=PurgeTest&action=history',
			'http://en.m.wikipedia.org/wiki/PurgeTest',
		];

		$this->assertArrayEquals( $expected, $urls );
	}

	/**
	 * @covers MobileFrontendHooks::onPageRenderingHash
	 * @dataProvider provideOnPageRenderingHash
	 */
	public function testOnPageRenderingHash(
		$shouldConfstrChange,
		$stripResponsiveImages
	) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$context->setStripResponsiveImages( $stripResponsiveImages );

		$expectedConfstr = $confstr = '';

		if ( $shouldConfstrChange ) {
			$expectedConfstr = '!responsiveimages=0';
		}

		$user = new User();
		$forOptions = [];

		MobileFrontendHooks::onPageRenderingHash( $confstr, $user, $forOptions );

		$this->assertSame( $expectedConfstr, $confstr );
	}

	public static function provideShouldMobileFormatSpecialPages() {
		return [
			[
				// should format
				true,
				// anon
				true,
				// feature disabled
				false
			],
			[
				// should format
				true,
				// anon
				true,
				// feature enabled
				true
			],
			[
				// should format
				true,
				// logged in user
				false,
				// feature enabled
				true
			],
			[
				// should not format
				false,
				// logged in user
				false,
				// feature enabled
				true,
				// preference enabled
				true
			]
		];
	}

	/**
	 * @covers MobileFrontendHooks::shouldMobileFormatSpecialPages
	 * @dataProvider provideShouldMobileFormatSpecialPages
	 */
	public function testShouldMobileFormatSpecialPages(
		$expected,
		$isAnon,
		$enabled,
		$userpref = false
	) {
		// set globals
		$this->setMwGlobals( [
			'wgMFEnableMobilePreferences' => $enabled,
		] );

		$user = $isAnon ? new User() : $this->getMutableTestUser()->getUser();
		if ( !$isAnon && $userpref ) {
			$userOptionsManager = MediaWikiServices::getInstance()->getUserOptionsManager();
			$userOptionsManager->setOption(
				$user,
				MobileFrontendHooks::MOBILE_PREFERENCES_SPECIAL_PAGES,
				true
			);
		}
		$this->assertSame(
			$expected,
			MobileFrontendHooks::shouldMobileFormatSpecialPages( $user )
		);
	}

	public static function provideOnPageRenderingHash() {
		return [
			[ true, true ],
			[ false, false ],
		];
	}

	/**
	 * @covers MobileFrontendHooks::onPageRenderingHash
	 * @dataProvider provideDoThumbnailBeforeProduceHTML
	 */
	public function testDoThumbnailBeforeProduceHTML(
		$expected,
		$mimeType,
		$stripResponsiveImages = true
	) {
		$file = $mimeType ? $this->factoryFile( $mimeType ) : null;
		$thumbnail = new ThumbnailImage(
			$file,

			// The following is stub data that stops `ThumbnailImage#__construct`,
			// triggering a warning.
			'/foo.svg',
			false,
			[
				'width' => 375,
				'height' => 667
			]
		);

		MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' )
			->setStripResponsiveImages( $stripResponsiveImages );

		// We're only asserting that the `srcset` attribute is unset.
		$attribs = [ 'srcset' => 'bar' ];

		$linkAttribs = [];

		MobileFrontendHooks::onThumbnailBeforeProduceHTML(
			$thumbnail,
			$attribs,
			$linkAttribs
		);

		$this->assertSame( $expected, array_key_exists( 'srcset', $attribs ) );
	}

	/**
	 * Creates an instance of `File` which has the given MIME type.
	 *
	 * @param string $mimeType
	 * @return File
	 */
	private function factoryFile( $mimeType ) {
		$file = $this->getMockBuilder( File::class )
			->disableOriginalConstructor()
			->getMock();

		$file->method( 'getMimeType' )
			->willReturn( $mimeType );

		return $file;
	}

	public static function provideDoThumbnailBeforeProduceHTML() {
		return [
			[ false, 'image/jpg' ],

			// `ThumbnailImage#getFile` can return `null`.
			[ false, null ],

			// It handles an image with a whitelisted MIME type.
			[ true, 'image/svg+xml' ],

			// It handles the stripping of responsive image variants from the parser
			// output being disabled.
			[ true, 'image/jpg', false ],
		];
	}

	/**
	 * @covers MobileFrontendHooks::onRequestContextCreateSkin
	 * @dataProvider provideDefaultMobileSkin
	 */
	public function testGetDefaultMobileSkin(
		?string $fakeMobileSkin,
		string $fakeDefaultSkin,
		string $expectedSkin
	): void {
		$userOptionLookup = $this->createMock( UserOptionsLookup::class );
		$mediaWikiServices = $this->createMock( MediaWikiServices::class );
		$mediaWikiServices->method( 'getUserOptionsLookup' )->willReturn( $userOptionLookup );

		$webRequest = $this->createMock( WebRequest::class );
		$webRequest->method( 'getHeader' )->willReturn( false );
		$webRequest->method( 'getVal' )->willReturn( false );

		$mobileContext = $this->createMock( MobileContext::class );
		$mobileContext->method( 'shouldDisplayMobileView' )->willReturn( true );
		$mobileContext->method( 'getRequest' )->willReturn( $webRequest );

		$context = $this->createMock( IContextSource::class );
		$context->method( 'getRequest' )->willReturn( $webRequest );
		$context->method( 'getUser' )->willReturn(
			$this->createMock( UserIdentity::class )
		);

		$skinFactory = new SkinFactory(
			new ObjectFactory( $this->createMock( ContainerInterface::class ) ), []
		);

		foreach ( [ $fakeMobileSkin, $fakeDefaultSkin ] as $skinName ) {
			if ( $skinName === null ) {
				continue;
			}
			$skinFactory->register( $skinName, strtoupper( $skinName ), [
					'class' => SkinFallback::class
				],
				true
			);
		}

		$config = $this->createMock( Config::class );
		$config->method( 'get' )->willReturnMap( [
			[ 'DefaultMobileSkin', $fakeMobileSkin ],
			[ 'DefaultSkin', $fakeDefaultSkin ],
		] );

		$this->setService( 'SkinFactory', $skinFactory );
		$this->setService( 'MobileFrontend.Config', $config );
		$this->setService( 'MobileFrontend.Context', $mobileContext );

		/**	@var Skin $skin */
		$skin = null;
		MobileFrontendHooks::onRequestContextCreateSkin( $context, $skin );

		self::assertSame( $expectedSkin, $skin->getSkinName() );
	}

	public function provideDefaultMobileSkin(): array {
		return [
			[ 'mobile-skin', 'default-skin', 'mobile-skin' ],
			[ null, 'default-skin', 'default-skin' ]
		];
	}
}
