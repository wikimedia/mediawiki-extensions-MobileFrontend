<?php

/**
 * @group MobileFrontend
 */
class MobileSpecialPageTest extends MediaWikiTestCase {
	protected function setUp() : void {
		parent::setUp();
		$this->setMwGlobals( 'wgScript', '/wiki/index.php' );
	}

	/**
	 * @dataProvider provideGetDesktopUrl
	 * @covers SpecialMobileHistory::getDesktopUrl
	 * @covers SpecialMobileDiff::getDesktopUrl
	 * @param string $class
	 * @param string $subPage
	 * @param array $params
	 * @param string|null $expected
	 */
	public function testGetDesktopUrl( $class, $subPage, array $params, $expected ) {
		$context = new RequestContext();
		$context->setRequest( new FauxRequest( $params ) );
		$page = new $class;
		$page->setContext( $context );
		$this->assertEquals( $expected, $page->getDesktopUrl( $subPage ) );
	}

	public function provideGetDesktopUrl() {
		return [
			[
				'SpecialMobileHistory',
				'Pagename',
				[],
				'/wiki/index.php?title=Pagename&action=history',
			],
			[
				'SpecialMobileHistory',
				'Pagename',
				[ 'mobileaction' => 'beta' ],
				'/wiki/index.php?title=Pagename&action=history',
			],
			[
				'SpecialMobileHistory',
				'Pagename',
				[ 'offset' => '100500' ],
				'/wiki/index.php?title=Pagename&action=history&offset=100500',
			],
			[
				'SpecialMobileDiff',
				'100',
				[ 'foo' => 'bar' ],
				'/wiki/index.php?diff=100',
			],
			[
				'SpecialMobileDiff',
				'100...101',
				[ 'mobileaction' => 'toggle_view_mobile', 'unhide' => 1 ],
				'/wiki/index.php?diff=101&oldid=100&unhide=1',
			],
		];
	}
}
