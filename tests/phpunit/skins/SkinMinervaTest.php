<?php

namespace Tests\MobileFrontend\Skins;

use MediaWikiTestCase;
use MobileUI;
use MWTimestamp;
use OutputPage;
use QuickTemplate;
use RequestContext;
use SkinMinerva;
use SpecialPage;
use Title;
use User;
use Wikimedia\TestingAccessWrapper;

class Template extends QuickTemplate {
	public function execute() {
	}
}

class EchoNotifUser {
	public function __construct( $echoLastUnreadNotificationTime, $echoNotificationCount ) {
		$this->echoLastUnreadNotificationTime = $echoLastUnreadNotificationTime;
		$this->echoNotificationCount = $echoNotificationCount;
	}
	public function getLastUnreadNotificationTime() {
		return $this->echoLastUnreadNotificationTime;
	}
	public function getNotificationCount() {
		return $this->echoNotificationCount;
	}
}

/**
 * @coversDefaultClass  SkinMinerva
 * @group MobileFrontend
 */
class SkinMinervaTest extends MediaWikiTestCase {

	/**
	 * @covers ::addToBodyAttributes
	 */
	public function testAddToBodyAttributes() {
		// The `class` attribute gets set to the "bodyClassName" property by
		// default.
		$this->assertContains(
			'no-js',
			$this->addToBodyAttributes( 'no-js', false )
		);

		$classes = $this->addToBodyAttributes( 'no-js', true );

		$this->assertContains( 'no-js', $classes );
	}

	private function addToBodyAttributes(
		$bodyClassName
	) {
		$context = new RequestContext();
		$context->setTitle( Title::newFromText( 'Test' ) );

		$outputPage = $context->getOutput();
		$outputPage->setProperty( 'bodyClassName', $bodyClassName );

		$bodyAttrs = [ 'class' => '' ];

		$skin = new SkinMinerva();
		$skin->setContext( $context );
		$skin->addToBodyAttributes( $outputPage, $bodyAttrs );

		return explode( ' ', $bodyAttrs[ 'class' ] );
	}

	/**
	 * @covers ::setContext
	 * @covers ::setSkinOptions
	 * @covers ::hasCategoryLinks
	 */
	public function testHasCategoryLinksWhenOptionIsOff() {
		$outputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPage->expects( $this->never() )
			->method( 'getCategoryLinks' );

		$context = new RequestContext();
		$context->setTitle( Title::newFromText( 'Test' ) );
		$context->setOutput( $outputPage );

		$skin = new SkinMinerva();
		$skin->setContext( $context );
		$skin->setSkinOptions( [ SkinMinerva::OPTION_CATEGORIES => false ] );

		$skin = TestingAccessWrapper::newFromObject( $skin );

		$this->assertEquals( $skin->hasCategoryLinks(), false );
	}

	/**
	 * @dataProvider provideHasCategoryLinks
	 * @param array $categoryLinks
	 * @param bool $expected
	 * @covers ::setContext
	 * @covers ::setSkinOptions
	 * @covers::hasCategoryLinks
	 */
	public function testHasCategoryLinks( array $categoryLinks, $expected ) {
		$outputPage = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPage->expects( $this->once() )
			->method( 'getCategoryLinks' )
			->will( $this->returnValue( $categoryLinks ) );

		$context = new RequestContext();
		$context->setTitle( Title::newFromText( 'Test' ) );
		$context->setOutput( $outputPage );

		$skin = new SkinMinerva();
		$skin->setContext( $context );
		$skin->setSkinOptions( [ SkinMinerva::OPTION_CATEGORIES => true ] );

		$skin = TestingAccessWrapper::newFromObject( $skin );

		$this->assertEquals( $skin->hasCategoryLinks(), $expected );
	}

	public function provideHasCategoryLinks() {
		return [
			[ [], false ],
			[
				[
					'normal' => '<ul><li><a href="/wiki/Category:1">1</a></li></ul>'
				],
				true
			],
			[
				[
					'hidden' => '<ul><li><a href="/wiki/Category:Hidden">Hidden</a></li></ul>'
				],
				true
			],
			[
				[
					'normal' => '<ul><li><a href="/wiki/Category:1">1</a></li></ul>',
					'hidden' => '<ul><li><a href="/wiki/Category:Hidden">Hidden</a></li></ul>'
				],
				true
			],
			[
				[
					'unexpected' => '<ul><li><a href="/wiki/Category:1">1</a></li></ul>'
				],
				false
			],
		];
	}

	/**
	 * Test whether the font changer module is correctly added to the list context modules
	 *
	 * @covers       ::getContextSpecificModules
	 * @dataProvider provideGetContextSpecificModules
	 * @param string $fontchangerValue whether font changer feature is enabled
	 * @param mixed  $backToTopValue whether back to top feature is enabled
	 * @param string $moduleName Module name that is being tested
	 * @param bool $expected Whether the module is expected to be returned by the function being tested
	 */
	public function testGetContextSpecificModules( $fontchangerValue, $backToTopValue,
		$moduleName, $expected
	) {
		$skin = TestingAccessWrapper::newFromObject(
			$this->getMockBuilder( SkinMinerva::class )
				->disableOriginalConstructor()
				->setMethods( [ 'getTitle' ] )
				->getMock()
		);
		$title = Title::newFromText( 'Test' );
		$skin->expects( $this->any() )
			->method( 'getTitle' )
			->will( $this->returnValue( $title ) );

		$skin->setSkinOptions( [
			'fontChanger' => $fontchangerValue,
			'backToTop' => $backToTopValue,
		] );

		if ( $expected ) {
			$this->assertContains( $moduleName, $skin->getContextSpecificModules() );
		} else {
			$this->assertNotContains( $moduleName, $skin->getContextSpecificModules() );
		}
	}

	public function provideGetContextSpecificModules() {
		return [
			[ true, false, 'skins.minerva.fontchanger', true ],
			[ false, true, 'skins.minerva.fontchanger', false ],
			[ false, true, 'skins.minerva.backtotop', true ],
			[ false, false, 'skins.minerva.backtotop', false ],
		];
	}

	/**
	 * Test the notification user button
	 *
	 * @covers ::prepareUserButton
	 * @dataProvider providePrepareUserButton
	 * @param array|string $expectedSecondaryButtonData Expected test case outcome
	 * @param string $message Test message
	 * @param Title $title
	 * @param bool $useEcho Whether to use Extension:Echo
	 * @param bool $isUserLoggedIn
	 * @param string $newtalks New talk page messages for the current user
	 * @param MWTimestamp|bool $echoLastUnreadNotificationTime Timestamp or false
	 * @param int|bool $echoNotificationCount
	 * @param string|bool $echoSeenTime String in format TS_ISO_8601 or false
	 * @param string|bool $formattedEchoNotificationCount
	 */
	public function testPrepareUserButton(
		$expectedSecondaryButtonData, $message, $title, $useEcho, $isUserLoggedIn,
		$newtalks, $echoLastUnreadNotificationTime = false,
		$echoNotificationCount = false, $echoSeenTime = false,
		$formattedEchoNotificationCount = false
	) {
		$user = $this->getMockBuilder( User::class )
			->disableOriginalConstructor()
			->setMethods( [ 'isLoggedIn' ] )
			->getMock();
		$user->expects( $this->any() )
			->method( 'isLoggedIn' )
			->will( $this->returnValue( $isUserLoggedIn ) );

		$skin = TestingAccessWrapper::newFromObject(
			$this->getMockBuilder( SkinMinerva::class )
				->disableOriginalConstructor()
				->setMethods( [ 'getTitle', 'getUser', 'getNewtalks', 'useEcho',
								'getEchoNotifUser', 'getEchoSeenTime',
								'getFormattedEchoNotificationCount' ] )
				->getMock()
		);
		$skin->expects( $this->any() )
			->method( 'getTitle' )
			->will( $this->returnValue( $title ) );
		$skin->expects( $this->any() )
			->method( 'getUser' )
			->will( $this->returnValue( $user ) );
		$skin->expects( $this->any() )
			->method( 'getNewtalks' )
			->will( $this->returnValue( $newtalks ) );
		$skin->expects( $this->any() )
			->method( 'useEcho' )
			->will( $this->returnValue( $useEcho ) );
		$skin->expects( $this->any() )
			->method( 'getEchoNotifUser' )
			->will( $this->returnValue(
				new EchoNotifUser(
					$echoLastUnreadNotificationTime, $echoNotificationCount
				)
			) );
		$skin->expects( $this->any() )
			->method( 'getEchoSeenTime' )
			->will( $this->returnValue( $echoSeenTime ) );
		$skin->expects( $this->any() )
			->method( 'getFormattedEchoNotificationCount' )
			->will( $this->returnValue( $formattedEchoNotificationCount ) );

		$tpl = new Template();
		$skin->prepareUserButton( $tpl );
		$this->assertEquals(
			$expectedSecondaryButtonData,
			$tpl->get( 'secondaryButtonData' ),
			$message
		);
	}

	/**
	 * Utility function that returns the expected secondary button data given parameters
	 * @param Title $title Page title
	 * @param string $notificationsMsg
	 * @param string $notificationsTitle
	 * @param string $countLabel
	 * @param bool $isZero
	 * @param bool $hasUnseen
	 * @return array
	 */
	private function getSecondaryButtonExpectedResult(
		$title,
		$notificationsMsg,
		$notificationsTitle,
		$countLabel,
		$isZero,
		$hasUnseen
	) {
		return [
			'notificationIconClass' => MobileUI::iconClass( 'notifications' ),
			'title' => $notificationsMsg,
			'url' => SpecialPage::getTitleFor( $notificationsTitle )
				->getLocalURL(
					[ 'returnto' => $title->getPrefixedText() ] ),
			'notificationCount' => $countLabel,
			'isNotificationCountZero' => $isZero,
			'hasNotifications' => $hasUnseen,
			'hasUnseenNotifications' => $hasUnseen
		];
	}

	/**
	 * Data provider for the test case testPrepareUserButton with Echo enabled
	 * @param Title @title Page title
	 * @return array
	 */
	private function providePrepareUserButtonEcho( Title $title ) {
		return [
			[ '', 'Echo, not logged in, no talk page alerts',
				$title, true, false, '' ],
			[ '', 'Echo, logged in, no talk page alerts',
				Title::newFromText( 'Special:Notifications' ), true, true, '' ],
			[ '', 'Echo, logged in, talk page alert',
				Title::newFromText( 'Special:Notifications' ), true, true,
				'newtalks alert' ],
			[ $this->getSecondaryButtonExpectedResult(
				$title,
				'Show my notifications',
				'Notifications',
				'99+',
				false,
				true
			), 'Echo, logged in, no talk page alerts, 110 notifications, ' +
				'last un-read nofication time after last echo seen time',
			$title, true, true, '',
			MWTimestamp::getInstance( strtotime( '2017-05-11T21:23:20Z' ) ),
			110, '2017-05-11T20:23:20Z', '99+' ],
			[ $this->getSecondaryButtonExpectedResult(
				$title,
				'Show my notifications',
				'Notifications',
				'3',
				false,
				false
			), 'Echo, logged in, no talk page alerts, 3 notifications, ' +
			'last un-read nofication time before last echo seen time',
			$title, true, true, '',
			MWTimestamp::getInstance( strtotime( '2017-05-11T21:23:20Z' ) ),
			3, '2017-05-11T22:23:20Z', '3' ],
			[ $this->getSecondaryButtonExpectedResult(
				$title,
				'Show my notifications',
				'Notifications',
				'5',
				false,
				false
			), 'Echo, logged in, no talk page alerts, 5 notifications, ' +
				'no last un-read nofication time',
			$title, true, true, '', false, 5, '2017-05-11T22:23:20Z', '5' ],
			[ $this->getSecondaryButtonExpectedResult(
				$title,
				'Show my notifications',
				'Notifications',
				'0',
				true,
				false
			), 'Echo, logged in, no talk page alerts, 0 notifications, ' +
				'no last echo seen time',
			$title, true, true, '',
			MWTimestamp::getInstance( strtotime( '2017-05-11T21:23:20Z' ) ),
			0, false, '0' ]
		];
	}

	/**
	 * Data provider for the test case testPrepareUserButton with Echo disabled
	 * @param Title @title Page title
	 * @return array
	 */
	private function providePrepareUserButtonNoEcho( Title $title ) {
		return [
			[ '', 'No Echo, not logged in, no talk page alerts',
				$title, false, false, '' ],
			[ '', 'No Echo, logged in, no talk page alerts',
				$title, false, true, '' ],
			[ $this->getSecondaryButtonExpectedResult(
				$title,
				'You have new messages on your talk page',
				'Mytalk',
				'',
				true,
				false
			), 'No Echo, not logged in, talk page alert',
			$title, false, false, 'newtalks alert' ],
		];
	}

	/**
	 * Data provider for the test case testPrepareUserButton
	 * @return array
	 */
	public function providePrepareUserButton() {
		$title = Title::newFromText( 'Test' );
		return array_merge(
			$this->providePrepareUserButtonEcho( $title ),
			$this->providePrepareUserButtonNoEcho( $title )
		);
	}
}
