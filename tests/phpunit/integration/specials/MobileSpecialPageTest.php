<?php

use MediaWiki\MainConfigNames;
use MediaWiki\Request\FauxRequest;

/**
 * @group MobileFrontend
 */
class MobileSpecialPageTest extends MediaWikiIntegrationTestCase {
	protected function setUp(): void {
		parent::setUp();
		$this->overrideConfigValue( MainConfigNames::Script, '/wiki/index.php' );
	}

	public static function provideGetDesktopUrlForMobileDiff() {
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
