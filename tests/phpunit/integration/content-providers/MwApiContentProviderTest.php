<?php

use MediaWiki\Http\HttpRequestFactory;
use MobileFrontend\ContentProviders\MwApiContentProvider;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\ContentProviders\MwApiContentProvider
 * @covers ::__construct
 */
class MwApiContentProviderTest extends MediaWikiTestCase {
	private const BASE_URL = '/w/api.php';
	private const SKIN_NAME = 'testSkin';
	private const REV_ID = 1;

	/**
	 * Create an object of the MwApiContentProvider class
	 * See MwApiContentProvider::__construct() for param docs
	 * @return MwApiContentProvider
	 */
	private function makeMwApiContentProvider(
		$baseUrl, OutputPage $outputPage, $skinName, $revId = null, $provideTagline = false
	) {
		return new MwApiContentProvider( $baseUrl, $outputPage, $skinName, $revId, $provideTagline );
	}

	/**
	 * Create test title helper function
	 * @return Title
	 */
	private function createTestTitle() {
		return Title::newFromText( 'Test Title' );
	}

	private function mockHTTPFactory( $rawResponse ) {
		$httpRequestMock = $this->createMock( MWHttpRequest::class );

		$httpRequestMock->expects( $this->at( 0 ) )
			->method( 'execute' )
			->willReturn( StatusValue::newGood() );

		$httpRequestMock->expects( $this->at( 1 ) )
			->method( 'getContent' )
			->willReturn( $rawResponse );

		$factoryMock = $this->createMock( HttpRequestFactory::class );
		$factoryMock->expects( $this->once() )
			->method( 'create' )
			->willReturn( $httpRequestMock );

		return $factoryMock;
	}

	/**
	 * Mock bad HTTP factory so ->isOK() returns false
	 * @param string $rawResponse
	 * @return HttpRequestFactory
	 */
	private function mockBadHTTPFactory( $rawResponse ) {
		$badHttpRequestMock = $this->createMock( MWHttpRequest::class );
		$badHttpRequestMock->method( 'execute' )
			->willReturn( StatusValue::newFatal( 'fatal' ) );
		$badHttpRequestMock->expects( $this->never() )
			->method( 'getContent' )
			->willReturn( '{}' );

		$badFactoryMock = $this->createMock( HttpRequestFactory::class );
		$badFactoryMock->method( 'create' )
			->willReturn( $badHttpRequestMock );

		return $badFactoryMock;
	}

	/**
	 * @param Title $title
	 * @return OutputPage
	 */
	private function mockOutputPage( Title $title ) {
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'getTitle' ] )
			->getMock();
		$mockOutputPage->method( 'getTitle' )
			->willReturn( $title );

		return $mockOutputPage;
	}

	/**
	 * Test path when HTTP request is not OK
	 * @covers ::getHTML
	 * @covers ::fileGetContents
	 */
	public function testHttpRequestIsNotOK() {
		$rawResponse = '{"key":"test"}';
		$mockOutputPage = $this->mockOutputPage( $this->createTestTitle() );

		$this->setService( 'HttpRequestFactory', $this->mockBadHTTPFactory( $rawResponse ) );
		$mwApiContentProvider = $this->makeMwApiContentProvider(
			self::BASE_URL, $mockOutputPage, self::SKIN_NAME, self::REV_ID
		);
		$actual = $mwApiContentProvider->getHTML();

		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 */
	public function testGetHtmlWithNoTitle() {
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'getTitle' ] )
			->getMock();
		$mockOutputPage->method( 'getTitle' )
			->willReturn( null );

		$mwApiContentProvider = $this->makeMwApiContentProvider(
			self::BASE_URL, $mockOutputPage, self::SKIN_NAME
		);

		$actual = $mwApiContentProvider->getHTML();
		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 */
	public function testGetHtmlWithNoRevIdAndValidTitle() {
		$mockOutputPage = $this->mockOutputPage( $this->createTestTitle() );

		$rawResponse = '{"key":"test"}';
		$this->setService( 'HttpRequestFactory', $this->mockHTTPFactory( $rawResponse ) );
		$mwApiContentProvider = $this->makeMwApiContentProvider(
			self::BASE_URL, $mockOutputPage, self::SKIN_NAME
		);
		$actual = $mwApiContentProvider->getHTML();

		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 * @covers ::fileGetContents
	 */
	public function testGetHtmlWithIncorrectResponse() {
		$rawResponse = '{"key":"test"}';
		$mockOutputPage = $this->mockOutputPage( $this->createTestTitle() );

		$this->setService( 'HttpRequestFactory', $this->mockHTTPFactory( $rawResponse ) );
		$mwApiContentProvider = $this->makeMwApiContentProvider(
			self::BASE_URL, $mockOutputPage, self::SKIN_NAME, self::REV_ID
		);
		$actual = $mwApiContentProvider->getHTML();

		$this->assertSame( '', $actual );
	}

	/**
	 * @covers ::getHTML
	 * @covers ::fileGetContents
	 */
	public function testGetHtmlWithCorrectResponse() {
		$rawResponse = '{"parse": {"title": "MobileFrontend", "pageid": 2, "revid": 123, ' .
			'"text": "Some text", "langlinks": [{"lang": "test", "title": "MF"}], "modules": ["site", ' .
			'"test", "test1"], "modulescripts": [], ' .
			'"modulestyles": ["test", "test1", "test2", "skins.random"], ' .
			'"properties": {"noexternallanglinks": "test", "noeditsection": "", "notoc": "", ' .
			'"wikibase_item": "QXXX", "wikibase-shortdesc": "No desc"}}}';

		// Should be in sync with $rawResponse (pageid and revid)
		$jsConfigVars = [
			'wgArticleId' => 2,
			'wgRevisionId' => 123,
		];
		// Mock the output page this special case to verify the add*
		// methods of the output page mock.
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->onlyMethods( [
					'getTitle',
					'addModules',
					'addModuleStyles',
					'addJsConfigVars'
				] )
			->getMock();
		$title = Title::newFromText( 'Test Title' );
		$mockOutputPage->method( 'getTitle' )
			->willReturn( $title );
		$mockOutputPage->expects( $this->atLeastOnce() )
			->method( 'addModules' )
			->with( [ "site", "test", "test1" ] );
		$mockOutputPage->expects( $this->atLeastOnce() )
			->method( 'addModuleStyles' )
			->with( [ "test", "test1", "test2" ] );
		$mockOutputPage->expects( $this->atLeastOnce() )
			->method( 'addJsConfigVars' )
			->with( $jsConfigVars );

		$this->setService( 'HttpRequestFactory', $this->mockHTTPFactory( $rawResponse ) );
		// Set tagline to "true" here to test code path with "wgMFDescription"
		$mwApiContentProvider = $this->makeMwApiContentProvider(
			self::BASE_URL, $mockOutputPage, self::SKIN_NAME, self::REV_ID, true
			);
		$actual = $mwApiContentProvider->getHTML();

		$this->assertSame( 'Some text', $actual );

		// Also, this should be in sync with the $rawResponse above (langlinks)
		$this->assertContains( 'test:MF', $mockOutputPage->getLanguageLinks() );
		$this->assertSame( 'No desc', $mockOutputPage->getProperty( 'wgMFDescription' ) );
	}
}
