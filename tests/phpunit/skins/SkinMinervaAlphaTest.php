<?php

require_once __DIR__ . '/SkinTest.php';

/**
 * @group MobileFrontend
 * @group Database
 */
class SkinMinervaAlphaTest extends SkinTest {
	/**
	 * Check, if context modules aren't arrays. They will be added as an array with modules to
	 * to load, which doesn't allow arrays as values.
	 */
	public function testGetContextSpecificModules() {
		// try to cover all possible modules (maybe extent, if other modules added)
		$values = array(
			'wgMFEnableBeta' => true
		);
		$this->setMwGlobals( $values );

		// UTSysop will be a logged in user
		$user = User::newFromName( 'UTSysop' );
		$user->load();

		// create a new RequestContext for this test case and set User and title
		$context = new RequestContext;
		$context->setUser( $user );
		// UTPage is an existing page in the main namespace
		$context->setTitle( Title::newFromText( 'UTPage' ) );
		MobileContext::singleton()->setMobileMode( 'alpha' );

		$skin = $this->getSkin();
		$skin->setContext( $context );

		$modules = $skin->getContextSpecificModules();

		foreach ( $modules as $module ) {
			$this->assertFalse( is_array( $module ), 'Context specific modules can\'t be a arrays.' );
		}
	}

	public function providerShowRedLinks() {
		return array(
			// $wgShowRedLinks, $wgShowRedLinksAnon, $username, $expected
			array( false, false, 'UTSysop', true ),
			array( true, false, 'UTSysop', true ),
			array( false, true, 'UTSysop', true ),
			array( true, true, 'UTSysop', true ),
			array( false, false, 'NotLoggedIn', true ),
			array( true, false, 'NotLoggedIn', true ),
			array( false, true, 'NotLoggedIn', true ),
			array( true, true, 'NotLoggedIn', true ),
		);
	}

	protected function getSkin() {
		return new SkinMinervaAlpha();
	}

	protected function getMode() {
		return 'alpha';
	}
}
