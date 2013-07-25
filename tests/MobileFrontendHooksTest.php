<?php

/**
 * @group MobileFrontend
 */
class MobileFrontendHooksTest extends MediaWikiTestCase {
	/**
	 * @dataProvider onBeforePageDisplayData
	 */
	public function testOnBeforePageDisplay( $mobileView, $expectedheader ) {
		MobileContext::setInstance( null );
		$ctx = MobileContext::singleton();
		$ctx->getContext()->setRequest( new FauxRequest() );
		if ( $mobileView ) {
			$ctx->getRequest()->setHeader( 'X-WAP', 'yessir!' );
		}
		$ctx->setForceMobileView( $mobileView );
		$out = $ctx->getOutput();
		$skin = $ctx->getSkin();
		MobileFrontendHooks::onBeforePageDisplay( $out, $skin );
		$this->assertEquals( $expectedheader, $ctx->getRequest()->response()->getheader( 'X-WAP' ) );
	}

	public function onBeforePageDisplayData() {
		return array(
			array( true, 'yessir!' ),
			array( false, null ),
		);
	}
}