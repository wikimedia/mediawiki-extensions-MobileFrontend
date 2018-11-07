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
		$expected = $mobileCollection->count();

		$this->assertSame( $expected, 0 );
	}

	/**
	 * @covers ::count
	 * @covers ::add
	 */
	public function testAddAndCountPages() {
		$mobileCollection = new MobileCollection();
		$mobilePage = new MobilePage( Title::newMainPage(), false );
		$mobileCollection->add( $mobilePage );
		$expected = $mobileCollection->count();

		$this->assertSame( $expected, 1 );

		$mobileCollection->add( $mobilePage );
		$expected = $mobileCollection->count();

		$this->assertSame( $expected, 2 );
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

		$expected = $mobileCollection->count();
		$this->assertSame( $expected, 3 );

		// Create a page of type Title and assert on it.
		$actual = Title::newFromText( 'Page_test', NS_MAIN );

		foreach ( $mobileCollection as $mbPage ) {
			$expected = $mbPage->getTitle();
			$this->assertSame( $expected, $actual );
		}
	}
}
