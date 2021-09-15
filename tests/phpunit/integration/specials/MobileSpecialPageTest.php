<?php

/**
 * @group MobileFrontend
 */
class MobileSpecialPageTest extends MediaWikiTestCase {
	protected function setUp(): void {
		parent::setUp();
		$this->setMwGlobals( 'wgScript', '/wiki/index.php' );
	}

	public function provideGetDesktopUrlForMobileHistory() {
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
		];
	}

	/**
	 * @param string $class
	 * @param string $subPage
	 * @param array $params
	 * @param string|null $expected
	 * @covers SpecialMobileHistory::getDesktopUrl
	 * @covers SpecialMobileDiff::getDesktopUrl
	 * @dataProvider provideGetDesktopUrlForMobileHistory
	 */
	public function testGetDesktopUrlWithMobileHistory( $class, $subPage, array $params, $expected ) {
		$context = new RequestContext();
		$context->setRequest( new FauxRequest( $params ) );
		$page = new $class( $this->getServiceContainer()->getRevisionLookup() );
		$page->setContext( $context );
		$this->assertEquals( $expected, $page->getDesktopUrl( $subPage ) );
	}
}
