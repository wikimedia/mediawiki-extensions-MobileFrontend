<?php

/**
 * @group MobileFrontend
 */
class MobileFrontendHooksTest extends MediaWikiTestCase {
	/**
	 * Test headers and alternate/canonical links to be set or not
	 *
	 * @dataProvider onBeforePageDisplayDataProvider
	 */
	public function testOnBeforePageDisplay( $mobileUrlTemplate, $mfNoindexPages,
		$mfEnableXAnalyticsLogging, $mfXAnalyticsItems, $isAlternateCanonical, $isXAnalytics
	) {
		// set globals
		$this->setMwGlobals( array(
			'wgMobileUrlTemplate' => $mobileUrlTemplate,
			'wgMFNoindexPages' => $mfNoindexPages,
			'wgMFEnableXAnalyticsLogging' => $mfEnableXAnalyticsLogging,
		) );

		// test with forced mobile view
		$param = $this->getContextSetup( 'mobile', $mfXAnalyticsItems );
		$out = $param['out'];
		$sk = $param['sk'];

		// run the test
		MobileFrontendHooks::onBeforePageDisplay( $out, $sk );

		// test, if alternate or canonical link is added, but not both
		$links = $out->getLinkTags();
		$this->assertEquals( $isAlternateCanonical, count( $links ) );
		// if there should be an alternate or canonical link, check, if it's the correct one
		if ( $isAlternateCanonical ) {
			// should be canonical link, not alternate in mobile view
			$this->assertEquals( 'canonical', $links[0]['rel'] );
		}

		// check, if XAnalytics is set, if it should be
		$resp = $param['context']->getRequest()->response();
		$this->assertEquals( $isXAnalytics, (bool)$resp->getHeader( 'X-Analytics' ) );

		// test with forced desktop view
		$param = $this->getContextSetup( 'desktop', $mfXAnalyticsItems );
		$out = $param['out'];
		$sk = $param['sk'];

		// run the test
		MobileFrontendHooks::onBeforePageDisplay( $out, $sk );
		// test, if alternate or canonical link is added, but not both
		$links = $out->getLinkTags();
		$this->assertEquals( $isAlternateCanonical, count( $links ) );
		// if there should be an alternate or canonical link, check, if it's the correct one
		if ( $isAlternateCanonical ) {
			// should be alternate link, not canonical in desktop view
			$this->assertEquals( 'alternate', $links[0]['rel'] );
		}
		// there should never be an XAnalytics header in desktop mode
		$resp = $param['context']->getRequest()->response();
		$this->assertEquals( false, (bool)$resp->getHeader( 'X-Analytics' ) );
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
			// wgMobileUrlTemplate, wgMFNoindexPages, wgMFEnableXAnalyticsLogging,
			// XanalyticsItems, alternate & canonical link, XAnalytics
			array( true, true, true, array( 'mf-m' => 'a', 'zero' => '502-13' ), 1, true ),
			array( true, false, true, array( 'mf-m' => 'a', 'zero' => '502-13' ), 0, true ),
			array( false, true, true, array( 'mf-m' => 'a', 'zero' => '502-13' ), 0, true ),
			array( false, false, true, array( 'mf-m' => 'a', 'zero' => '502-13' ), 0, true ),
			array( true, true, false, array(), 1, false ),
			array( true, false, false, array(), 0, false ),
			array( false, true, false, array(), 0, false ),
			array( false, false, false, array(), 0, false ),
		);
	}
}
