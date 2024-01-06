<?php

use MediaWiki\Config\HashConfig;
use MediaWiki\User\User;
use MobileFrontend\Amc\Manager;

/**
 * @coversDefaultClass \MobileFrontend\Amc\Manager
 * @group MobileFrontend
 */
class ManagerTest extends MediaWikiUnitTestCase {

	private function createManager( $mfAmcConfig, $shouldDisplayMobileView, $userIsAnon ): Manager {
		$config = new HashConfig( [ 'MFAdvancedMobileContributions' => $mfAmcConfig ] );

		$mobileContext = $this->createNoOpMock(
			MobileContext::class,
			[ 'shouldDisplayMobileView', 'getUser' ]
		);
		$mobileContext->method( 'shouldDisplayMobileView' )->willReturn( $shouldDisplayMobileView );

		$user = $this->createNoOpMock( User::class, [ 'isAnon' ] );
		$user->method( 'isAnon' )->willReturn( $userIsAnon );

		$mobileContext->method( 'getUser' )->willReturn( $user );

		return new Manager( $config, $mobileContext );
	}

	public static function provideIsAvailable() {
		yield 'MF AMC config: true, display mobile view: true, user is anon: false' => [ true, true, false, true ];

		yield 'MF AMC config: false, display mobile view: true, user is anon: false' => [ false, true, false, false ];

		yield 'MF AMC config: true, display mobile view: false, user is anon: false' => [ true, false, false, false ];

		yield 'MF AMC config: true, display mobile view: true, user is anon: true' => [ true, true, true, false ];

		yield 'MF AMC config: false, display mobile view: false, user is anon: true' => [ false, false, true, false ];

		yield 'MF AMC config: false, display mobile view: false, user is anon: false' =>
			[ false, false, false, false ];

		yield 'MF AMC config: false, display mobile view: true, user is anon: true' => [ false, true, true, false ];

		yield 'MF AMC config: true, display mobile view: false, user is anon: true' => [ true, false, true, false ];
	}

	/**
	 * @covers ::__construct
	 * @covers ::isAvailable
	 * @dataProvider provideIsAvailable
	 */
	public function testIsAvailable( $mfAmcConfig, $shouldDisplayMobileView, $userIsAnon, $expected ) {
		$manager = $this->createManager( $mfAmcConfig, $shouldDisplayMobileView, $userIsAnon );

		$this->assertSame( $expected, $manager->isAvailable() );
	}

	/**
	 * @covers ::getModeIdentifier
	 */
	public function testGetModeIdentifier() {
		$manager = $this->createManager( true, true, false );

		$this->assertSame( 'amc', $manager->getModeIdentifier() );
	}

}
