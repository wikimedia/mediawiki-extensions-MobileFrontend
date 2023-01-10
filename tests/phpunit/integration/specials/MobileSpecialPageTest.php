<?php

use MediaWiki\MainConfigNames;

/**
 * @group MobileFrontend
 */
class MobileSpecialPageTest extends MediaWikiIntegrationTestCase {
	protected function setUp(): void {
		parent::setUp();
		$this->overrideConfigValue( MainConfigNames::Script, '/wiki/index.php' );
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
		$page = new $class(
			$this->getServiceContainer()->getDBLoadBalancer(),
			$this->getServiceContainer()->getNamespaceInfo(),
			$this->getServiceContainer()->getRevisionFactory()
		);
		$page->setContext( $context );
		$this->assertEquals( $expected, $page->getDesktopUrl( $subPage ) );
	}

	public function provideGetDesktopUrlForMobileDiff() {
		return [
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

	/**
	 * @param string $class
	 * @param string $subPage
	 * @param array $params
	 * @param string|null $expected
	 * @covers SpecialMobileHistory::getDesktopUrl
	 * @covers SpecialMobileDiff::getDesktopUrl
	 * @dataProvider provideGetDesktopUrlForMobileDiff
	 */
	public function testGetDesktopUrlWithMobileDiff( $class, $subPage, array $params, $expected ) {
		$context = new RequestContext();
		$context->setRequest( new FauxRequest( $params ) );
		$page = new $class( $this->getServiceContainer()->getRevisionLookup() );
		$page->setContext( $context );
		$this->assertEquals( $expected, $page->getDesktopUrl( $subPage ) );
	}
}
