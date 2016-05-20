<?php

/**
 * @group MobileFrontend
 */
class MobileFrontendHooksTest extends MediaWikiTestCase {
	/**
	 * Test headers and alternate/canonical links to be set or not
	 *
	 * @dataProvider onBeforePageDisplayDataProvider
	 * @covers MobileFrontendHooks::OnBeforePageDisplay
	 */
	public function testOnBeforePageDisplay( $mobileUrlTemplate, $mfNoindexPages,
		$mfEnableXAnalyticsLogging, $mfAutoDetectMobileView, $mfVaryOnUA, $mfXAnalyticsItems,
		$isAlternateCanonical, $isXAnalytics, $mfVaryHeaderSet
	) {
		// set globals
		$this->setMwGlobals( array(
			'wgMobileUrlTemplate' => $mobileUrlTemplate,
			'wgMFNoindexPages' => $mfNoindexPages,
			'wgMFEnableXAnalyticsLogging' => $mfEnableXAnalyticsLogging,
			'wgMFAutodetectMobileView' => $mfAutoDetectMobileView,
			'wgMFVaryOnUA' => $mfVaryOnUA,
		) );

		// test with forced mobile view
		$param = $this->getContextSetup( 'mobile', $mfXAnalyticsItems );
		$out = $param['out'];
		$sk = $param['sk'];

		// run the test
		MobileFrontendHooks::onBeforePageDisplay( $out, $sk );

		// test, if alternate or canonical link is added, but not both
		$links = $out->getLinkTags();
		$this->assertEquals( $isAlternateCanonical, count( $links ),
			'test, if alternate or canonical link is added, but not both' );
		// if there should be an alternate or canonical link, check, if it's the correct one
		if ( $isAlternateCanonical ) {
			// should be canonical link, not alternate in mobile view
			$this->assertEquals( 'canonical', $links[0]['rel'],
				'should be canonical link, not alternate in mobile view' );
		}
		$varyHeader = $out->getVaryHeader();
		$this->assertEquals( $mfVaryHeaderSet, strpos( $varyHeader, 'User-Agent' ) !== false,
			'check the status of the User-Agent vary header when wgMFVaryOnUA is enabled' );

		// check, if XAnalytics is set, if it should be
		$resp = $param['context']->getRequest()->response();
		$this->assertEquals( $isXAnalytics, (bool)$resp->getHeader( 'X-Analytics' ),
			'check, if XAnalytics is set, if it should be' );

		// test with forced desktop view
		$param = $this->getContextSetup( 'desktop', $mfXAnalyticsItems );
		$out = $param['out'];
		$sk = $param['sk'];

		// run the test
		MobileFrontendHooks::onBeforePageDisplay( $out, $sk );
		// test, if alternate or canonical link is added, but not both
		$links = $out->getLinkTags();
		$this->assertEquals( $isAlternateCanonical, count( $links ),
			'test, if alternate or canonical link is added, but not both' );
		// if there should be an alternate or canonical link, check, if it's the correct one
		if ( $isAlternateCanonical ) {
			// should be alternate link, not canonical in desktop view
			$this->assertEquals( 'alternate', $links[0]['rel'],
				'should be alternate link, not canonical in desktop view' );
		}
		$varyHeader = $out->getVaryHeader();
		// check, if the vary header is set in desktop mode
		$this->assertEquals( $mfVaryHeaderSet, strpos( $varyHeader, 'User-Agent' ) !== false,
			'check, if the vary header is set in desktop mode' );
		// there should never be an XAnalytics header in desktop mode
		$resp = $param['context']->getRequest()->response();
		$this->assertEquals( false, (bool)$resp->getHeader( 'X-Analytics' ),
			'there should never be an XAnalytics header in desktop mode' );
	}

	/**
	 * Creates a new set of object for the actual test context, including a new
	 * outputpage and skintemplate.
	 *
	 * @param string $mode The mode for the test cases (desktop, mobile)
	 * @return array Array of objects, including MobileContext (context),
	 * SkinTemplate (sk) and OutputPage (out)
	 */
	protected function getContextSetup( $mode, $mfXAnalyticsItems ) {
		// Create a new MobileContext object for this test
		MobileContext::setInstance( null );
		// create a new instance of MobileContext
		$context = MobileContext::singleton();
		// create a DerivativeContext to use in MobileContext later
		$mainContext = new DerivativeContext( RequestContext::getMain() );
		// create a new, empty OutputPage
		$out = new OutputPage( $context );
		// create a new, empty SkinTemplate
		$sk = new SkinTemplate();
		// create a new Title (main page)
		$title = Title::newMainPage();
		// create a FauxRequest to use instead of a WebRequest object (FauxRequest forces
		// the creation of a FauxResponse, which allows to investigate sent header values)
		$request = new FauxRequest();
		// set the new request object to the context
		$mainContext->setRequest( $request );
		// set the main page title to the context
		$mainContext->setTitle( $title );
		// set the context to the SkinTemplate
		$sk->setContext( $mainContext );
		// set the OutputPage to the context
		$mainContext->setOutput( $out );
		// set the DerivativeContext as a base to MobileContext
		$context->setContext( $mainContext );
		// set the mode to MobileContext
		$context->setUseFormat( $mode );
		// if there are any XAnalytics items, add them
		foreach ( $mfXAnalyticsItems as $key => $val ) {
			$context->addAnalyticsLogItem( $key, $val );
		}
		// set the newly created MobileContext object as the current instance to use
		MobileContext::setInstance( $context );

		// return the stuff
		return array(
			'out' => $out,
			'sk' => $sk,
			'context' => $context,
		);
	}

	/**
	 * Dataprovider fro testOnBeforePageDisplay
	 */
	public function onBeforePageDisplayDataProvider() {
		return array(
			// wgMobileUrlTemplate, wgMFNoindexPages, wgMFEnableXAnalyticsLogging, wgMFAutodetectMobileView,
			// wgMFVaryOnUA, XanalyticsItems, alternate & canonical link, XAnalytics, Vary header User-Agent
			array( true, true, true, true, true,
				array( 'mf-m' => 'a', 'zero' => '502-13' ), 1, true, false, ),
			array( true, false, true, false, false,
				array( 'mf-m' => 'a', 'zero' => '502-13' ), 0, true, false, ),
			array( false, true, true, true, true,
				array( 'mf-m' => 'a', 'zero' => '502-13' ), 0, true, true, ),
			array( false, false, true, false, false,
				array( 'mf-m' => 'a', 'zero' => '502-13' ), 0, true, false, ),
			array( true, true, false, true, true, array(), 1, false, false, ),
			array( true, false, false, false, false, array(), 0, false, false, ),
			array( false, true, false, true, true, array(), 0, false, true, ),
			array( false, false, false, false, false, array(), 0, false, false, ),
			array( false, false, false, false, true, array(), 0, false, false, ),
		);
	}

	public function testOnTitleSquidURLs() {
		$this->setMwGlobals( array(
			'wgMobileUrlTemplate' => '%h0.m.%h1.%h2',
			'wgServer' => 'http://en.wikipedia.org',
			'wgArticlePath' => '/wiki/$1',
			'wgScriptPath' => '/w',
			'wgScript' => '/w/index.php',
		) );
		MobileContext::setInstance( null );

		$title = Title::newFromText( 'PurgeTest' );

		$urls = $title->getCdnUrls();

		$expected = array(
			'http://en.wikipedia.org/wiki/PurgeTest',
			'http://en.wikipedia.org/w/index.php?title=PurgeTest&action=history',
			'http://en.m.wikipedia.org/w/index.php?title=PurgeTest&action=history',
			'http://en.m.wikipedia.org/wiki/PurgeTest',
		);

		$this->assertArrayEquals( $expected, $urls );
	}
}
