<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobilePage
 */
class MobilePageTest extends MediaWikiTestCase {
	/**
	 * Creates an instance of `File`.
	 * By default, let the picture height be less than it's width.
	 *
	 * @return File
	 */
	private function mockFileFactory( $height ) {
		$file = $this->getMockBuilder( 'File' )
			->disableOriginalConstructor()
			->setMethods( [ 'getUrl', 'getHeight', 'getWidth', 'transform' ] )
			->getMock();

		$file->method( 'getUrl' )
			->willReturn( 'https://commons.wikimedia.org/wiki/File:Image.jpg' );

		$file->method( 'getHeight' )
			->willReturn( $height );

		$file->method( 'getWidth' )
			->willReturn( 150 );

		$file->method( 'transform' )
			->willReturn(
				new ThumbnailImage(
					$file, 'https://commons.wikimedia.org/wiki/File:Image.jpg',
					false, [ 'width' => 150, 'height' => $height ]
				)
			);

		return $file;
	}

	/**
	 * Helper function to create object of class MobilePage
	 * @param $file
	 * @return MobilePage
	 */
	private function makeMobilePageFactory( $file ) {
		$mobilePage = new MobilePage( Title::newFromText( 'Image', NS_MAIN ), $file );

		return $mobilePage;
	}

	/**
	 * @covers ::getTitle
	 */
	public function testGetTitle() {
		$title = Title::newMainPage();
		$mPageWithNoFile = new MobilePage( $title, false );
		$actual = $mPageWithNoFile->getTitle();

		$this->assertSame( $title, $actual );
	}

	/**
	 * @covers ::getPlaceHolderThumbnailHtml
	 * @dataProvider getPlaceHolderThumbnailHtmlDataProvider
	 */
	public function testGetPlaceHolderThumbnailHtml( $className, $iconClassName, $expected ) {
		$actual = MobilePage::getPlaceHolderThumbnailHtml( $className, $iconClassName );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * @covers ::hasThumbnail
	 */
	public function testHasNoThumbnail() {
		$mPageWithNoFile = $this->makeMobilePageFactory( false );
		$actual = $mPageWithNoFile->hasThumbnail();
		$this->assertFalse( $actual );
	}

	/**
	 * Requires PageImages extension to be installed else, $file will
	 * always default to "false" when creating the Mobile Page object
	 * making the test to fail.
	 *
	 * @covers ::hasThumbnail
	 */
	public function testHasThumbnail() {
		$fileWidthGreatThanHeight = $this->mockFileFactory( 100 );

		$mPageWithFile = $this->makeMobilePageFactory( $fileWidthGreatThanHeight );
		$actual = $mPageWithFile->hasThumbnail();
		$this->assertTrue( $actual );
	}

	/**
	 * @covers ::getPageImageHtml
	 * @covers ::getSmallThumbnailHtml
	 * @dataProvider getSmallThumbnailHtmlWidthLessThanHeightDataProvider
	 */
	public function testGetSmallThumbnailHtmlWidthLessThanHeight( $useBackgroundImage, $expected ) {
		// Meant for testing  MobilePage::getPageImageHtml() when width
		// is less than height for generating the appropriate element class.
		$fileWidthLessThanHeight = $this->mockFileFactory( 300 );

		$mPageWithFile = $this->makeMobilePageFactory( $fileWidthLessThanHeight );

		$actual = $mPageWithFile->getSmallThumbnailHtml( $useBackgroundImage );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * @covers ::getPageImageHtml
	 * @covers ::getSmallThumbnailHtml
	 * @dataProvider getSmallThumbnailHtmlWidthGreaterThanHeightDataProvider
	 */
	public function testGetSmallThumbnailHtmlWidthGreaterThanHeight(
		$useBackgroundImage, $expected
	) {
		$fileWidthGreatThanHeight = $this->mockFileFactory( 100 );
		$mPageWithFile = $this->makeMobilePageFactory( $fileWidthGreatThanHeight );
		$actual = $mPageWithFile->getSmallThumbnailHtml( $useBackgroundImage );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * Data provider for testGetPlaceHolderThumbnailHtml()
	 *
	 * @return array
	 */
	public function getPlaceHolderThumbnailHtmlDataProvider() {
		return [
			[
				'', '',
				'<div class="list-thumb list-thumb-placeholder"></div>'
			],
			[
				'', 'testicon',
				'<div class="list-thumb list-thumb-placeholder testicon"></div>'
			],
			[
				'test', '',
				'<div class="list-thumb list-thumb-placeholder test"></div>'
			],
			[
				'test', 'testicon',
				'<div class="list-thumb list-thumb-placeholder testicon test"></div>'
			]
		];
	}

	/**
	 * Data provider for testGetSmallThumbnailHtmlWidthLessThanHeight()
	 *
	 * @return array
	 */
	public function getSmallThumbnailHtmlWidthLessThanHeightDataProvider() {
		return [
			// With width < height
			[
				false,
				'<img class="list-thumb list-thumb-x" src="https://commons.wikimedia.org/wiki/File:Image.jpg"/>'
			],
			[
				true,
				'<div class="list-thumb list-thumb-x" style="background-image: url(' .
				'&quot;https://commons.wikimedia.org/wiki/File:Image.jpg&quot;)"></div>'
			]
		];
	}

	/**
	 * Data provider for testGetSmallThumbnailHtmlWidthGreaterThanHeight()
	 *
	 * @return array
	 */
	public function getSmallThumbnailHtmlWidthGreaterThanHeightDataProvider() {
		return [
			// With width > height
			[
				false,
				'<img class="list-thumb list-thumb-y" src="https://commons.wikimedia.org/wiki/File:Image.jpg"/>'
			],
			[
				true,
				'<div class="list-thumb list-thumb-y" style="background-image: url(' .
				'&quot;https://commons.wikimedia.org/wiki/File:Image.jpg&quot;)"></div>'
			]
		];
	}
}
