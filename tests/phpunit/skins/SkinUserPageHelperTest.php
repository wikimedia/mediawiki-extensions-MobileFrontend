<?php
use MediaWiki\Minerva\SkinUserPageHelper;

/**
 * @group MobileFrontend
 * @coversDefaultClass MediaWiki\Minerva\SkinUserPageHelper
 */
class SkinUserPageHelperTest extends MediaWikiTestCase {

	private function getContextMock( Title $title ) {
		$context = $this->getMock( IContextSource::class );

		$context->expects( $this->once() )
			->method( 'getTitle' )
			->willReturn( $title );

		return $context;
	}

	/**
	 * @covers ::isUserPage
	 * @covers ::fetchData
	 * @covers ::__construct
	 */
	public function testTitleNotInUserNamespace() {
		$title = Title::newFromText( 'Test Page', NS_MAIN );

		$helper = new SkinUserPageHelper( $this->getContextMock( $title ) );
		$this->assertEquals( false, $helper->isUserPage() );
	}

	/**
	 * @covers ::isUserPage
	 * @covers ::fetchData
	 */
	public function testTitleisASubpage() {
		$title = Title::newFromText( 'User:TestUser/subpage', NS_USER );

		$helper = new SkinUserPageHelper( $this->getContextMock( $title ) );
		$this->assertEquals( false, $helper->isUserPage() );
	}

	/**
	 * @covers ::fetchData
	 */
	public function testTitleProcessingIsCached() {
		$titleMock = $this->getMockBuilder( Title::class )
			->getMock();
		$titleMock->expects( $this->once() )
			->method( 'inNamespace' )
			->with( NS_USER )
			->willReturn( true );

		$titleMock->expects( $this->once() )
			->method( 'isSubpage' )
			->willReturn( false );

		$titleMock->expects( $this->once() )
			->method( 'getText' )
			->willReturn( 'Test' );

		$helper = new SkinUserPageHelper( $this->getContextMock( $titleMock ) );
		$helper->isUserPage();
		$helper->isUserPage();
		$helper->getPageUser();
		$helper->getPageUser();
	}

	/**
	 * @covers ::fetchData
	 * @covers ::getPageUser
	 * @covers ::isUserPage
	 */
	public function testGetPageUserWhenOnUserPage() {
		$testUser = $this->getTestUser()->getUser();
		$title = $testUser->getUserPage();

		$helper = new SkinUserPageHelper( $this->getContextMock( $title ) );
		$this->assertEquals( true, $helper->isUserPage() );
		$this->assertEquals( $testUser->getId(), $helper->getPageUser()->getId() );
	}

	/**
	 * @covers ::fetchData
	 * @covers ::getPageUser
	 * @covers ::isUserPage
	 */
	public function testGetPageUserWhenOnUserPageReturnsCorrectUser() {
		$testUser = $this->getTestUser()->getUser();
		$testUserTitle = $testUser->getUserPage();

		$secondTestUser = $this->getTestSysop()->getUser();
		$secondTestUserTitle = $secondTestUser->getUserPage();

		$helper = new SkinUserPageHelper( $this->getContextMock( $secondTestUserTitle ) );
		$this->assertEquals( true, $helper->isUserPage() );
		$this->assertNotEquals( $testUser->getId(), $helper->getPageUser()->getId() );
		$this->assertNotEquals( $helper->getPageUser()->getUserPage(), $testUserTitle );
	}

}
