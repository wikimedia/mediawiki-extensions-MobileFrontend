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

	abstract public function providerShowRedLinks();

	abstract protected function getSkin();

	abstract protected function getMode();
}
