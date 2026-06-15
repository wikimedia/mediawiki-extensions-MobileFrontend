<?php

use MediaWiki\Title\Title;
use MobileFrontend\Models\MobileCollection;
use MobileFrontend\Models\MobilePage;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\Models\MobileCollection
 */
class MobileCollectionTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers ::count
	 */
	public function testCountZeroPages() {
		$mobileCollection = new MobileCollection();

		// Should return 0 by default as $pages = [];
		$actual = $mobileCollection->count();

		$this->assertSame( 0, $actual );
	}

	/**
	 * @covers ::count
	 * @covers ::add
	 */
	public function testAddAndCountPages() {
		$mobileCollection = new MobileCollection();
		$mobilePage = new MobilePage( Title::newMainPage(), false );
		$mobileCollection->add( $mobilePage );
		$actual = $mobileCollection->count();

		$this->assertSame( 1, $actual );

		$mobileCollection->add( $mobilePage );
		$actual = $mobileCollection->count();

		$this->assertSame( 2, $actual );
	}

	/**
	 * @covers ::getIterator
	 */
	public function testGetIterator() {
		$expected = Title::makeTitle( NS_MAIN, 'Page_test' );
		$mobilePage = new MobilePage(
			$expected, false
		);

		$mobileCollection = new MobileCollection();

		// Let's have say 3 pages and check it's actually 3 pages
		// before we move on.
		$mobileCollection->add( $mobilePage );
		$mobileCollection->add( $mobilePage );
		$mobileCollection->add( $mobilePage );

		$actual = $mobileCollection->count();
		$this->assertSame( 3, $actual );

		foreach ( $mobileCollection as $mbPage ) {
			$actual = $mbPage->getTitle();
			$this->assertSame( $expected, $actual );
		}
	}
}
