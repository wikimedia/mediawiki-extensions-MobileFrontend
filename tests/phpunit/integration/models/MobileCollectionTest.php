<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileCollection
 */
class MobileCollectionTest extends MediaWikiTestCase {
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
		$mobilePage = new MobilePage(
			Title::newFromText( 'Page_test', NS_MAIN ), false
		);

		$mobileCollection = new MobileCollection();

		// Let's have say 3 pages and check it's actually 3 pages
		// before we move on.
		$mobileCollection->add( $mobilePage );
		$mobileCollection->add( $mobilePage );
		$mobileCollection->add( $mobilePage );

		$actual = $mobileCollection->count();
		$this->assertSame( 3, $actual );

		// Create a page of type Title and assert on it.
		$expected = Title::newFromText( 'Page_test', NS_MAIN );

		foreach ( $mobileCollection as $mbPage ) {
			$actual = $mbPage->getTitle();
			$this->assertSame( $expected, $actual );
		}
	}
}
