<?php

require_once __DIR__ . '/SkinTest.php';

/**
 * @group MobileFrontend
 * @group Database
 */
class SkinMinervaBetaTest extends SkinTest
{
	public function providerShowRedLinks() {
		return array(
			// $wgShowRedLinks, $wgShowRedLinksAnon, $username, $expected
			array( false, false, 'UTSysop', false ),
			array( true, false, 'UTSysop', true ),
			array( false, true, 'UTSysop', false ),
			array( true, true, 'UTSysop', true ),
			array( false, false, 'NotLoggedIn', false ),
			array( true, false, 'NotLoggedIn', false ),
			array( false, true, 'NotLoggedIn', true ),
			array( true, true, 'NotLoggedIn', true ),
		);
	}

	protected function getSkin() {
		return new SkinMinervaBeta();
	}

	protected function getMode() {
		return 'beta';
	}
}
