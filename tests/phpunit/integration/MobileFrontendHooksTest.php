<?php

use MediaWiki\MediaWikiServices;

/**
 * @group MobileFrontend
 */
class MobileFrontendHooksTest extends MediaWikiTestCase {
	protected function setUp() : void {
		parent::setUp();

		MobileContext::resetInstanceForTesting();
	}

	/**
	 * Test findTagLine when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenNoElementsPresent() {
		$po = new ParserOutput();
		$fallback = function () {
			$this->fail( 'Fallback shouldn\'t be called' );
		};
		$this->assertFalse( MobileFrontendHooks::findTagline( $po, $fallback ) );
	}

	/**
	 * Test findTagLine when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenItemIsNotPresent() {
		$poWithDesc = new ParserOutput();
		$poWithDesc->setProperty( 'wikibase-shortdesc', 'desc' );

		$fallback = function () {
			$this->fail( 'Fallback shouldn\'t be called' );
		};
		$this->assertSame( 'desc', MobileFrontendHooks::findTagline( $poWithDesc, $fallback ) );
	}

	/**
	 * Test findTagLine when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenOnlyItemIsPresent() {
		$fallback = function ( $item ) {
			$this->assertSame( 'W2', $item );
			return 'Hello Wikidata';
		};

		$poWithItem = new ParserOutput();
		$poWithItem->setProperty( 'wikibase_item', 'W2' );
		$this->assertSame(
			'Hello Wikidata',
			MobileFrontendHooks::findTagline( $poWithItem, $fallback )
		);
	}

	/**
	 * Test findTagLine when output has no wikibase elements
	 *
	 * @covers MobileFrontendHooks::findTagline
	 */
	public function testFindTaglineWhenWikibaseAttrsArePresent() {
		$fallback = function () {
			$this->fail( 'Fallback shouldn\'t be called' );
		};

		$poWithBoth = new ParserOutput();
		$poWithBoth->setProperty( 'wikibase-shortdesc', 'Hello world' );
		$poWithBoth->setProperty( 'wikibase_item', 'W2' );
		$this->assertSame(
			'Hello world',
			MobileFrontendHooks::findTagline( $poWithBoth, $fallback )
		);
	}

	/**
	 * Test headers and alternate/canonical links to be set or not
	 *
	 * @dataProvider onBeforePageDisplayDataProvider
	 * @covers MobileFrontendHooks::onBeforePageDisplay
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
	 * @param Title $title
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

		$urls = $title->getCdnUrls();

		$expected = [
			'http://en.wikipedia.org/wiki/PurgeTest',
			'http://en.wikipedia.org/w/index.php?title=PurgeTest&action=history',
			'http://en.m.wikipedia.org/w/index.php?title=PurgeTest&action=history',
			'http://en.m.wikipedia.org/wiki/PurgeTest',
		];

		$this->assertArrayEquals( $expected, $urls );
	}

	/**
	 * @dataProvider provideOnPageRenderingHash
	 * @covers MobileFrontendHooks::onPageRenderingHash
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
	 * @dataProvider provideShouldMobileFormatSpecialPages
	 * @covers MobileFrontendHooks::shouldMobileFormatSpecialPages
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
			$user->setOption( MobileFrontendHooks::MOBILE_PREFERENCES_SPECIAL_PAGES, true );
		}
		$this->assertSame( $expected,
			MobileFrontendHooks::shouldMobileFormatSpecialPages( $user ) );
	}

	public static function provideOnPageRenderingHash() {
		return [
			[ true, true ],
			[ false, false ],
		];
	}

	/**
	 * @dataProvider provideDoThumbnailBeforeProduceHTML
	 * @covers MobileFrontendHooks::onPageRenderingHash
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
}
