<?php

// FIXME: That this class exists is an indicator that at least SkinMinerva#isAllowedPageAction
// should be extracted from SkinMinerva.
class TestSkinMinerva extends SkinMinerva {
	public function isAllowedPageAction( $action ) {
		return parent::isAllowedPageAction( $action );
	}

	public function setContentHandler( ContentHandler $contentHandler ) {
		$this->contentHandler = $contentHandler;
	}

	public function setDoesPageHaveLanguages( $doesPageHaveLanguages ) {
		$this->doesPageHaveLanguages = $doesPageHaveLanguages;
	}

	public function overWriteUserPageHelper( $helper ) {
		$this->userPageHelper = $helper;
	}
}

/**
 * @group MobileFrontend
 */
class SkinMinervaPageActionsTest extends MediaWikiTestCase {

	/**
	 * @var TestSkinMinerva
	 */
	private $skin;

	protected function setUp() {
		parent::setUp();

		$this->skin = $this->getSkin( Title::newFromText( 'SkinMinervaPageActionsTest' ) );
	}

	/**
	 * @param Title $title
	 * @return TestSkinMinerva
	 */
	private function getSkin( Title $title ) {
		$requestContext = new RequestContext();
		$requestContext->setTitle( $title );

		$result = new TestSkinMinerva();
		$result->setContext( $requestContext );

		return $result;
	}

	/**
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function test_page_actions_arent_allowed_when_on_the_main_page() {
		$skin = $this->getSkin( Title::newMainPage() );

		$this->assertFalse( $skin->isAllowedPageAction( 'watch' ) );
	}

	/**
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function test_invalid_page_actions_arent_allowed() {
		$this->setMwGlobals( 'wgMinervaPageActions', [] );

		// By default, the "talk" and "watch" page actions are allowed but are now deemed invalid.
		$this->assertFalse( $this->skin->isAllowedPageAction( 'talk' ) );
		$this->assertFalse( $this->skin->isAllowedPageAction( 'watch' ) );
	}

	/**
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function test_valid_page_actions_are_allowed() {
		$this->assertTrue( $this->skin->isAllowedPageAction( 'talk' ) );
		$this->assertTrue( $this->skin->isAllowedPageAction( 'watch' ) );
	}

	public static function editPageActionProvider() {
		return [
			[ false, false, false ],
			[ true, false, false ],
			[ true, true, true ]
		];
	}

	/**
	 * The "edit" page action is allowed when the page doesn't support direct editing via the API.
	 *
	 * @dataProvider editPageActionProvider
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function test_edit_page_action(
		$supportsDirectEditing,
		$supportsDirectApiEditing,
		$expected
	) {
		$contentHandler = $this->getMockBuilder( 'ContentHandler' )
			->disableOriginalConstructor()
			->getMock();

		$contentHandler->method( 'supportsDirectEditing' )
			->will( $this->returnValue( $supportsDirectEditing ) );

		$contentHandler->method( 'supportsDirectApiEditing' )
			->will( $this->returnValue( $supportsDirectApiEditing ) );

		$this->skin->setContentHandler( $contentHandler );

		$this->assertEquals( $expected, $this->skin->isAllowedPageAction( 'edit' ) );
	}

	/**
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function testPageActionsWhenOnUserPage() {
		$userPageHelper = $this->getMockBuilder( \MediaWiki\Minerva\SkinUserPageHelper::class )
			->disableOriginalConstructor()
			->getMock();

		$userPageHelper->expects( $this->once() )
			->method( 'isUserPage' )
			->willReturn( true );

		$skin = $this->getSkin( Title::newFromText( 'User:Admin' ) );
		$skin->overWriteUserPageHelper( $userPageHelper );

		$this->assertFalse( $skin->isAllowedPageAction( 'talk' ) );
	}

	/**
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function testPageActionsWhenNotOnUserPage() {
		$userPageHelper = $this->getMockBuilder( \MediaWiki\Minerva\SkinUserPageHelper::class )
			->disableOriginalConstructor()
			->getMock();

		$userPageHelper->expects( $this->once() )
			->method( 'isUserPage' )
			->willReturn( false );

		$skin = $this->getSkin( Title::newFromText( 'User:Admin' ) );
		$skin->overWriteUserPageHelper( $userPageHelper );

		$this->assertTrue( $skin->isAllowedPageAction( 'talk' ) );
	}

	public static function switchLanguagePageActionProvider() {
		return [
			[ true, false, true ],
			[ false, true, true ],
			[ false, false, false ],
			[ true, false, true ],
		];
	}

	/**
	 * The "switch-language" page action is allowed when: v2 of the page action bar is enabled and
	 * if the page has interlanguage links or if the <code>$wgMinervaAlwaysShowLanguageButton</code>
	 * configuration variable is set to truthy.
	 *
	 * @dataProvider switchLanguagePageActionProvider
	 * @covers SkinMinerva::isAllowedPageAction
	 */
	public function test_switch_language_page_action(
		$doesPageHaveLanguages,
		$minervaAlwaysShowLanguageButton,
		$expected
	) {
		$this->skin->setDoesPageHaveLanguages( $doesPageHaveLanguages );
		$this->setMwGlobals( [
			'wgMinervaAlwaysShowLanguageButton' => $minervaAlwaysShowLanguageButton,
		] );

		$this->assertEquals( $expected, $this->skin->isAllowedPageAction( 'switch-language' ) );
	}
}
