<?php

use MobileFrontend\ContentProviders\ContentProviderFactory;
use MobileFrontend\ContentProviders\DefaultContentProvider;
use MobileFrontend\ContentProviders\McsContentProvider;
use MobileFrontend\ContentProviders\MwApiContentProvider;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\ContentProviders\ContentProviderFactory
 */
class ContentProviderFactoryTest extends MediaWikiTestCase {
	// Test HTML
	const TEST_HTML = '<a>Anchor</a>';

	/**
	 * Mock OutputPage class
	 */
	private function mockOutputPage() {
		// Mock Title class
		$mockTitle = $this->createMock( Title::class );
		$mockTitle->method( 'exists' )->willReturn( true );

		// Mock Skin class
		$mockSkin = $this->createMock( Skin::class );
		$mockSkin->method( 'getSkinName' )->willReturn( 'testSkin' );

		// Mock the FauxRequest class
		$mockFauxRequest = $this->createMock( FauxRequest::class );
		$mockFauxRequest->method( 'getIntOrNull' )->willReturn( 12345 );

		// Mock OutputPage class
		$mockOutputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'getTitle', 'getRequest', 'getSkin' ] )
			->getMock();

		$mockOutputPage->method( 'getTitle' )
			->willReturn( $mockTitle );

		$mockOutputPage->method( 'getRequest' )
			->willReturn( $mockFauxRequest );

		$mockOutputPage->method( 'getSkin' )
			->willReturn( $mockSkin );

		return $mockOutputPage;
	}

	/**
	 * Mock the OutputPage class where title doesn't exist
	 */
	private function mockOutputPageWithNoTitle() {
		// Mock Title class
		$mockTitle = $this->createMock( Title::class );
		$mockTitle->method( 'exists' )->willReturn( false );

		// Mock OutputPage class.
		$mockOutputPageNoTitle = $this->createMock( OutputPage::class );
		$mockOutputPageNoTitle->method( 'getTitle' )->willReturn( $mockTitle );

		return $mockOutputPageNoTitle;
	}

	/**
	 * @covers ::getProvider
	 */
	public function testGetProviderWithNoMFContentProvider() {
		$mockOutputPage = $this->mockOutputPage();
		$config = new HashConfig( [
			'MFContentProviderClass' => ''
		] );
		$factory = new ContentProviderFactory( $config );
		$this->expectException( RuntimeException::class );
		$factory->getProvider( $mockOutputPage, self::TEST_HTML );
	}

	/**
	 * @covers ::getDefaultParser
	 * @covers ::getProvider
	 */
	public function testGetProviderWithDefaultContentProvider() {
		$mockOutputPage = $this->mockOutputPage();
		// Set config for the MFContentProviderClass and
		// MFContentProviderTryLocalContentFirst is true
		$config = new HashConfig( [
			'MFContentProviderClass' => DefaultContentProvider::class,
			'MFContentProviderTryLocalContentFirst' => true
		] );
		$factory = new ContentProviderFactory( $config );
		$provider = $factory->getProvider( $mockOutputPage, self::TEST_HTML
		);
		$actual = $provider->getHTML();

		$this->assertSame( self::TEST_HTML, $actual );
	}

	/**
	 * @covers ::getDefaultParser
	 * @covers ::getProvider
	 */
	public function testGetProviderWithDefaultContentProviderWithNoTitle() {
		$mockOutputPageNoTitle = $this->mockOutputPageWithNoTitle();
		// Set config for the MFContentProviderClass and
		// MFContentProviderTryLocalContentFirst is false
		$config = new HashConfig( [
			'MFContentProviderClass' => DefaultContentProvider::class,
			'MFContentProviderTryLocalContentFirst' => false,
			'MFContentProviderScriptPath' => false
		] );

		$factory = new ContentProviderFactory( $config );
		$provider = $factory->getProvider( $mockOutputPageNoTitle, self::TEST_HTML );
		$actual = $provider->getHTML();

		$this->assertSame( self::TEST_HTML, $actual );
	}

	/**
	 * @covers ::getProvider
	 */
	public function testGetProviderWithInvalidContentProvider() {
		$mockOutputPage = $this->mockOutputPage();
		$config = new HashConfig( [
			'MFContentProviderClass' => ContentProviderFactory::class,
			'MFContentProviderTryLocalContentFirst' => false,
			'MFContentProviderScriptPath' => false
		] );
		$factory = new ContentProviderFactory( $config );
		$this->expectException( RuntimeException::class );
		$factory->getProvider( $mockOutputPage, self::TEST_HTML );
	}

	/**
	 * This test suite tests the use of various MFContentProviderClass and
	 * MFContentProviderTryLocalContentFirst on different scenarios. When
	 * true or false for MFContentProviderTryLocalContentFirst.
	 * @covers ::getDefaultParser
	 * @covers ::getProvider
	 * @dataProvider contentProvidersDataProvider
	 */
	public function testGetProvider( $contentProvider, $localContent, $expected ) {
		$mockOutputPage = $this->mockOutputPage();
		$config = new HashConfig( [
			'MFContentProviderClass' => $contentProvider,
			'MFContentProviderTryLocalContentFirst' => $localContent,
			'MFContentProviderScriptPath' => false,
			'MFMcsContentProviderBaseUri' => 'http://localhost/',
			'MFMwApiContentProviderBaseUri' => 'http://localhost/'
		] );
		$factory = new ContentProviderFactory( $config );
		$provider = $factory->getProvider( $mockOutputPage, self::TEST_HTML );

		$this->assertInstanceOf( $expected, $provider );
	}

	/**
	 * Data provider for testGetProviderWithDefaultContentProviderWithNoTitle()
	 * @return array
	 */
	public function contentProvidersDataProvider() {
		return [
			[ McsContentProvider::class, true, DefaultContentProvider::class ],
			[ MwApiContentProvider::class, true, DefaultContentProvider::class ],
			[ DefaultContentProvider::class, false, DefaultContentProvider::class ],
			[ McsContentProvider::class, false, McsContentProvider::class ],
			[ MwApiContentProvider::class, false, MwApiContentProvider::class ]
		];
	}
}
