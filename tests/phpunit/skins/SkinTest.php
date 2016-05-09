<?php

/**
 * A set of test cases that all skin tests must perform.
 */
abstract class SkinTest extends MediaWikiTestCase {
	public function providerGetSitename() {
		return [
			// test case 1
			[
				false,
				'MyWiki'
			],
			// test case 2
			[
				'registered',
				'MyWiki<sup>®</sup>'
			],
			// test case 3
			[
				'unregistered',
				'MyWiki<sup>™</sup>'
			],
		];
	}

	/**
	 * @dataProvider providerGetSitename
	 * @covers SkinMinerva::getSitename
	 */
	public function testGetSitename( $configValue, $expected ) {
		// set config variables
		$values = [
			'wgMFTrademarkSitename' => $configValue,
			'wgSitename' => 'MyWiki'
		];
		$this->setMwGlobals( $values );

		$sitename = SkinMinerva::getSitename( true );
		$this->assertEquals( $sitename, $expected );
	}

	abstract protected function getSkin();

	abstract protected function getMode();
}
