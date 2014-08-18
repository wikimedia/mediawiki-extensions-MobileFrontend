<?php

/**
 * @group MobileFrontend
 * @group Database
 */
class SkinMinervaTest extends MediaWikiTestCase {
	/**
	 * @dataProvider providerShowRedLinks
	 */
	public function testGetSkinConfigVariables( $showRedLinks, $showRedLinksAnon,
		$mode, $username, $expected
	) {
		// set config variables, which we test here
		$values = array(
			'wgMFShowRedLinks' => $showRedLinks,
			'wgMFShowRedLinksAnon' => $showRedLinksAnon,
			'wgMFEnableBeta' => true
		);
		$this->setMwGlobals( $values );

		// create our specific user object
		$user = User::newFromName( $username );
		$user->load();

		// create a new RequestContext for this test case and set User and title
		$context = new RequestContext;
		$context->setUser( $user );
		$context->setTitle( Title::newFromText( 'Main_page' ) );

		// create SkinMinerva to test
		$skin = new SkinMinerva;
		$skin->setContext( $context );

		// set the fake mobile mode
		MobileContext::singleton()->setMobileMode( $mode );

		// test now
		$vars = $skin->getSkinConfigVariables();
		$this->assertEquals( $expected, $vars['wgMFShowRedLinks'] );
	}

	/**
	 * Provides test data for testgetSkinConfigVariables()
	 */
	public function providerShowRedLinks() {
		// UTSysop is logged in, NotLoggedIn isn't
		// $wgMFShowRedLinks, $wgMFShowRedLinksAnon, mobile mode, user, expected
		return array(
			// test in stable mode
			array( false, false, 'stable', 'UTSysop', false ),
			array( true, false, 'stable', 'UTSysop', true ),
			array( false, true, 'stable', 'UTSysop', false ),
			array( true, true, 'stable', 'UTSysop', true ),
			array( false, false, 'stable', 'NotLoggedIn', false ),
			array( true, false, 'stable', 'NotLoggedIn', false ),
			array( false, true, 'stable', 'NotLoggedIn', true ),
			array( true, true, 'stable', 'NotLoggedIn', true ),

			// test in beta mode
			array( false, false, 'beta', 'NotLoggedIn', false ),
			array( true, false, 'beta', 'NotLoggedIn', false ),
			array( false, true, 'beta', 'NotLoggedIn', false ),
			array( true, true, 'beta', 'NotLoggedIn', false ),
			array( false, false, 'beta', 'UTSysop', true ),
			array( true, false, 'beta', 'UTSysop', true ),
			array( false, true, 'beta', 'UTSysop', true ),
			array( true, true, 'beta', 'UTSysop', true ),
		);
	}
}
