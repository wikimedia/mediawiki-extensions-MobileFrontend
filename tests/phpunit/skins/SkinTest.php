<?php

/**
 * A set of test cases that all skin tests must perform.
 */
abstract class SkinTest extends MediaWikiTestCase {

	/**
	 * @dataProvider providerShowRedLinks
	 */
	public function testRedLinks( $showRedLinks, $showRedLinksAnon, $username, $expected ) {
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
		$skin = $this->getSkin();
		$skin->setContext( $context );

		// set the fake mobile mode
		MobileContext::singleton()->setMobileMode( $this->getMode() );

		// test now
		$vars = $skin->getSkinConfigVariables();
		$this->assertEquals( $expected, $vars['wgMFShowRedLinks'] );
	}

	public function providerGetSitename() {
		return array(
			// test case 1
			array(
				false,
				'MyWiki'
			),
			// test case 2
			array(
				'registered',
				'MyWiki<sup>®</sup>'
			),
			// test case 3
			array(
				'unregistered',
				'MyWiki<sup>™</sup>'
			),
		);
	}

	/**
	 * @dataProvider providerGetSitename
	 */
	public function testGetSitename( $configValue, $expected ) {
		// set config variables
		$values = array(
			'wgMFTrademarkSitename' => $configValue,
			'wgSitename' => 'MyWiki'
		);
		$this->setMwGlobals( $values );

		$sitename = SkinMinerva::getSitename( true );
		$this->assertEquals( $sitename, $expected );
	}

	abstract public function providerShowRedLinks();

	abstract protected function getSkin();

	abstract protected function getMode();
}
