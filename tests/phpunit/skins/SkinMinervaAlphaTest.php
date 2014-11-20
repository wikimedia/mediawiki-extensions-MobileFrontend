<?php

/**
 * @group MobileFrontend
 */
class SkinMinervaAlphaTest extends MediaWikiTestCase {
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

		$skin = new SkinMinervaAlpha;
		$skin->setContext( $context );

		$modules = $skin->getContextSpecificModules();

		foreach ( $modules as $module ) {
			$this->assertFalse( is_array( $module ), 'Context specific modules can\'t be a arrays.' );
		}
	}
}
