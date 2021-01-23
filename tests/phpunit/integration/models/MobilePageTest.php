<?php

use MediaWiki\Revision\RevisionRecord;
use MediaWiki\Revision\RevisionStore;
use MobileFrontend\Models\MobilePage;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\Models\MobilePage
 * @covers ::__construct()
 */
class MobilePageTest extends MediaWikiTestCase {
	// Timestamp from MW format to Unix format
	// TS_MW is '20181028200709' and to Unix gives
	// '1540757229' using the wfTimestamp() function.
	private const TS_MW_TO_TS_UNIX = '1540757229';

	// Example timestamp in MediaWiki format
	private const TS_MW = '20181028200709';

	/**
	 * Creates an instance of `File`.
	 * By default, let the picture height be less than it's width.
	 *
	 * @param int $height
	 * @return File
	 */
	private function mockFileFactory( $height ) {
		$file = $this->getMockBuilder( 'File' )
			->disableOriginalConstructor()
			->onlyMethods( [ 'getUrl', 'getHeight', 'getWidth', 'transform' ] )
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
	 * Mock the RevisionStore class
	 * @param Title $title
	 * @param TestUser|null $testUser
	 * @return RevisionStore
	 */
	private function mockRevisionStore( Title $title, TestUser $testUser = null ) {
		// Create a mock of the RevisionRecord class.
		$revisionRecordMock = $this->getMockForAbstractClass(
			RevisionRecord::class,
			[],
			'',
			false,
			false,
			false,
			[ 'getTimestamp', 'getUser' ]
		);

		$revisionRecordMock->expects( $this->any() )
			->method( 'getTimestamp' )
			->willReturn( self::TS_MW );

		if ( $testUser ) {
			$userId = $testUser->getUser()->getId();

			$userIdentity = $this->createMock( \MediaWiki\User\UserIdentity::class );

			$userIdentity->expects( $this->any() )
				->method( 'getId' )
				->willReturn( $userId );

			$revisionRecordMock->expects( $this->atLeastOnce() )
				->method( 'getUser' )
				->willReturn( $userIdentity );
		}

		// Create a mock of the RevisionStore class that returns the RevisionRecord
		// mock when getRevisionByTitle() method is called.
		$revisionStoreMock = $this->getMockBuilder( RevisionStore::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'getRevisionByTitle' ] )
			->getMock();

		$revisionStoreMock->expects( $this->once() )
			->method( 'getRevisionByTitle' )
			->with( $title )
			->willReturn( $revisionRecordMock );

		return $revisionStoreMock;
	}

	/**
	 * Mock RevisionStore class with title that returns null
	 * @param Title $title
	 * @return RevisionStore
	 */
	private function mockRevisionStoreWithTitleReturnNullRevision( $title ) {
		$mock = $this->getMockBuilder( RevisionStore::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'getRevisionByTitle' ] )
			->getMock();

		$mock->expects( $this->once() )
			->method( 'getRevisionByTitle' )
			->with( $title )
			->willReturn( null );

		return $mock;
	}

	/**
	 * Helper function to create object of class MobilePage
	 * @param Title $title Mobile page title
	 * @param File|bool $file File object or false if not present
	 * @return MobilePage
	 */
	private function makeMobilePageFactory( Title $title, $file ) {
		return new MobilePage( $title, $file );
	}

	/**
	 * Create test title helper function
	 * @return Title
	 */
	private function createTestTitle() {
		return Title::newFromText( 'Image', NS_MAIN );
	}

	/**
	 * @covers ::setLatestTimestamp
	 * @covers ::getLatestTimestamp
	 */
	public function testLatestTimestamp() {
		$mobilePage = $this->makeMobilePageFactory( $this->createTestTitle(), false );
		$tsNow = wfTimestamp( TS_MW );
		$mobilePage->setLatestTimestamp( $tsNow );

		$actual = $mobilePage->getLatestTimestamp();

		$this->assertSame( $tsNow, $actual );
	}

	/**
	 * @covers ::getLatestTimestamp
	 */
	public function testLatestTimestampWithNullTitle() {
		$title = $this->createTestTitle();
		$mock = $this->mockRevisionStoreWithTitleReturnNullRevision( $title );

		$this->setService( 'RevisionStore', $mock );
		$mobilePage = $this->makeMobilePageFactory( $title, false );
		$actual = $mobilePage->getLatestTimestamp();

		$this->assertFalse( $actual );
	}

	/**
	 * @covers ::getLatestTimestamp
	 */
	public function testLatestTimestampWhenNoRevision() {
		$title = $this->createTestTitle();

		$revMock = $this->mockRevisionStore( $title );

		$this->setService( 'RevisionStore', $revMock );
		$mobilePage = $this->makeMobilePageFactory( $title, false );
		$actual = $mobilePage->getLatestTimestamp();

		$this->assertSame( self::TS_MW, $actual );
	}

	/**
	 * @covers ::getRevision
	 * @covers ::getLatestEdit
	 */
	public function testGetLatestEdit() {
		$title = $this->createTestTitle();
		$testUser = self::getTestUser();
		$revMock = $this->mockRevisionStore( $title, $testUser );

		$mobilePage = new MobilePage( $title, false );
		$this->setService( 'RevisionStore', $revMock );
		$actual = $mobilePage->getLatestEdit();

		$this->assertIsArray( $actual );
		$this->assertArrayHasKey( 'timestamp', $actual );
		$this->assertArrayHasKey( 'name', $actual );
		$this->assertArrayHasKey( 'gender', $actual );
		$this->assertSame( self::TS_MW_TO_TS_UNIX, $actual['timestamp'] );
		$this->assertSame( $testUser->getUser()->getName(), $actual['name'] );
		$this->assertSame( 'unknown', $actual['gender'] );
	}

	/**
	 * @covers ::getRevision
	 * @covers ::getLatestEdit
	 */
	public function testGetLatestEditWithTitleReturnNullRevision() {
		$title = $this->createTestTitle();
		$revMock = $this->mockRevisionStoreWithTitleReturnNullRevision( $title );
		$mobilePage = new MobilePage( $title, false );
		$this->setService( 'RevisionStore', $revMock );
		$actual = $mobilePage->getLatestEdit();

		$this->assertIsArray( $actual );
		$this->assertArrayHasKey( 'timestamp', $actual );
		$this->assertArrayHasKey( 'name', $actual );
		$this->assertArrayHasKey( 'gender', $actual );
		$this->assertFalse( $actual['timestamp'] );
		$this->assertSame( '', $actual['name'] );
		$this->assertSame( '', $actual['gender'] );
	}

	/**
	 * @covers ::getTitle
	 */
	public function testGetTitle() {
		$title = $this->createTestTitle();
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
		$mPageWithNoFile = $this->makeMobilePageFactory( $this->createTestTitle(), false );
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

		$mPageWithFile = $this->makeMobilePageFactory(
			$this->createTestTitle(), $fileWidthGreatThanHeight
		);
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

		$mPageWithFile = $this->makeMobilePageFactory(
			$this->createTestTitle(), $fileWidthLessThanHeight
		);

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
		$mPageWithFile = $this->makeMobilePageFactory(
			$this->createTestTitle(), $fileWidthGreatThanHeight
		);
		$actual = $mPageWithFile->getSmallThumbnailHtml( $useBackgroundImage );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * When no file is provided, always return an empty string.
	 * @covers ::getSmallThumbnailHtml
	 * @covers ::getPageImageHtml
	 * @dataProvider getSmallThumbnailHtmlWithNoFileDataProvider
	 */
	public function testGetSmallThumbnailHtmlWithNoFile( $useBackgroundImage, $expected ) {
		$mPageWithNoFile = $this->makeMobilePageFactory( $this->createTestTitle(), false );
		$actual = $mPageWithNoFile->getSmallThumbnailHtml( $useBackgroundImage );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * When file is provided but thumb couldn't be generated upon
	 * calling $thumb->transform(). So we don't have a thumb here.
	 * @covers ::getSmallThumbnailHtml
	 * @covers ::getPageImageHtml
	 * @dataProvider getSmallThumbnailHtmlWithNoThumbDataProvider
	 */
	public function testGetSmallThumbnailHtmlWithNoThumb( $useBackgroundImage, $expected ) {
		$thumb = $this->getMockBuilder( File::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'transform' ] )
			->getMock();

		$thumb->method( 'transform' )
			->willReturn( null );

		$mobilePage = $this->makeMobilePageFactory( $this->createTestTitle(), $thumb );
		$actual = $mobilePage->getSmallThumbnailHtml( $useBackgroundImage );

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
	 * Data provider for testGetSmallThumbnailHtmlWithNoFile()
	 *
	 * @return array
	 */
	public function getSmallThumbnailHtmlWithNoFileDataProvider() {
		return [
			[ false, '' ],
			[ true, '' ]
		];
	}

	/**
	 * Data provider for testGetSmallThumbnailHtmlWithNoThumb()
	 *
	 * @return array
	 */
	public function getSmallThumbnailHtmlWithNoThumbDataProvider() {
		return [
			[ false, '' ],
			[ true, '' ]
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
