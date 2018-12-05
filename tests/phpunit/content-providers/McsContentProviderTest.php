<?php

use MobileFrontend\ContentProviders\McsContentProvider;
use MediaWiki\Http\HttpRequestFactory;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\ContentProviders\McsContentProvider
 * @covers ::__construct
 */
class McsContentProviderTest extends MediaWikiTestCase {
	const BASE_URL = '/w/api.php';

	/**
	 * Create an object of the McsContentProvider class
	 * @param string $baseUrl
	 * @param OutputPage $outputPage
	 * @return McsContentProvider
	 */
	private function makeMcsContentProvider( $baseUrl, OutputPage $outputPage ) {
		return new McsContentProvider( $baseUrl, $outputPage );
	}

	/**
	 * Create test title helper function
	 */
	private function createTestTitle() {
		return Title::newFromText( 'Test Title' );
	}

	private function mockHTTPFactory( $url, $rawResponse ) {
		$mockStatus = $this->createMock( StatusValue::class );
		$mockStatus->method( 'isOK' )
			->willReturn( true );

		$httpRequestMock = $this->getMockForAbstractClass(
			MWHttpRequest::class,
			[],
			'',
			false,
			false,
			false,
			[ 'execute', 'getContent' ]
		);

		$httpRequestMock->expects( $this->at( 0 ) )
			->method( 'execute' )
			->willReturn( $mockStatus );

		$httpRequestMock->expects( $this->at( 1 ) )
			->method( 'getContent' )
			->willReturn( $rawResponse );

		$factoryMock = $this->createMock( HttpRequestFactory::class );
		$factoryMock->expects( $this->once() )
			->method( 'create' )
			->with( $url )
			->willReturn( $httpRequestMock );

		return $factoryMock;
	}

	/**
	 * @param Title $title
	 * @return OutputPage Mocked OutputPage
	 */
	private function mockOutputPage( Title $title ) {
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->setMethods( [ 'getTitle', 'getPrefixedDBKey' ] )
			->getMock();
		$mockOutputPage->method( 'getTitle' )
			->willReturn( $title );
		$mockOutputPage->method( 'getPrefixedDBKey' )
			->willReturn( $title->getPrefixedDBkey() );
		return $mockOutputPage;
	}

	/**
	 * @covers ::getHTML
	 */
	public function testGetHtmlWithNoTitle() {
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->setMethods( [ 'getTitle' ] )
			->getMock();

		$mockOutputPage->method( 'getTitle' )
			->willReturn( null );

		$mcsContentProvider = $this->makeMcsContentProvider( self::BASE_URL, $mockOutputPage );

		$actual = $mcsContentProvider->getHTML();
		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 */
	public function testGetHtmlWithNoResponse() {
		$title = $this->createTestTitle();
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->setMethods( [ 'getTitle' ] )
			->getMock();

		$mockOutputPage->method( 'getTitle' )
			->willReturn( $title );

		$mcsContentProvider = $this->makeMcsContentProvider( self::BASE_URL, $mockOutputPage );

		$actual = $mcsContentProvider->getHTML();
		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 */
	public function testGetHtmlWithOperationNotOkay() {
		$mockStatusFalse = $this->createMock( StatusValue::class );
		$mockStatusFalse->method( 'isOK' )
			->willReturn( false );

		$httpFalseRequestMock = $this->getMockForAbstractClass(
			MWHttpRequest::class,
			[],
			'',
			false,
			false,
			false,
			[ 'execute' ]
		);

		$httpFalseRequestMock->method( 'execute' )
			->willReturn( $mockStatusFalse );

		$factoryMock = $this->createMock( HttpRequestFactory::class );
		$factoryMock->expects( $this->once() )
			->method( 'create' )
			->with( self::BASE_URL . '/page/mobile-sections/Test_Title' )
			->willReturn( $httpFalseRequestMock );

		$mockOutputPage = $this->mockOutputPage( $this->createTestTitle() );

		$this->setService( 'HttpRequestFactory', $factoryMock );
		$mcsContentProvider = $this->makeMcsContentProvider( self::BASE_URL, $mockOutputPage );
		$actual = $mcsContentProvider->getHTML();

		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 * @covers ::fileGetContents
	 */
	public function testGetHtmlWithResponseDecodedNotArray() {
		$mockOutputPage = $this->mockOutputPage( $this->createTestTitle() );

		$url = self::BASE_URL . '/page/mobile-sections/Test_Title';
		$this->setService( 'HttpRequestFactory', $this->mockHTTPFactory( $url, 'text' ) );
		$mcsContentProvider = $this->makeMcsContentProvider( self::BASE_URL, $mockOutputPage );
		$actual = $mcsContentProvider->getHTML();

		$this->assertSame( '', $actual );
	}

	/**
	 * Test all paths in buildHtmlFromResponse()
	 * @covers ::buildHtmlFromResponse
	 * @covers ::getHTML
	 * @covers ::fileGetContents
	 */
	public function testGetHtmlWithValidResponse() {
		$sampleResponse = '{"lead": {"sections": [{"text": "value"}]}, "remaining": {"sections": ' .
			'[{"line": "l", "toclevel": 1, "text": "t"}]}}';
		$mockOutputPage = $this->mockOutputPage( $this->createTestTitle() );

		$url = self::BASE_URL . '/page/mobile-sections/Test_Title';
		$this->setService( 'HttpRequestFactory', $this->mockHTTPFactory( $url, $sampleResponse ) );
		$mcsContentProvider = $this->makeMcsContentProvider( self::BASE_URL, $mockOutputPage );
		$actual = $mcsContentProvider->getHTML();

		$expected = "value<h2>l</h2>t";
		$this->assertSame( $expected, $actual );
	}
}
