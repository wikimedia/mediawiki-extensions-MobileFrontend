<?php

use MediaWiki\Config\HashConfig;
use MediaWiki\User\User;
use MobileFrontend\Amc\Manager;
use MobileFrontend\Amc\Outreach;
use MobileFrontend\Amc\UserMode;

/**
 * @coversDefaultClass \MobileFrontend\Amc\Outreach
 * @group MobileFrontend
 */
class OutreachTest extends MediaWikiUnitTestCase {

	/**
	 * @param bool $mfAmcOutreach
	 *
	 * @return Outreach
	 */
	private function createOutreach( bool $mfAmcOutreach ): Outreach {
		$userMode = $this->createNoOpMock( UserMode::class, [ 'isEnabled' ] );
		$userMode->method( 'isEnabled' )->willReturn( false );

		$mobileContext = $this->createNoOpMock(
			MobileContext::class,
			[ 'shouldDisplayMobileView', 'getUser' ]
		);
		$mobileContext->method( 'shouldDisplayMobileView' )->willReturn( true );

		$user = $this->createNoOpMock( User::class, [ 'isAnon', 'getEditCount', 'isBot' ] );
		$user->method( 'isAnon' )->willReturn( false );
		$user->method( 'getEditCount' )->willReturn( 0 );
		$user->method( 'isBot' )->willReturn( false );

		$mobileContext->method( 'getUser' )->willReturn( $user );

		$amcManager = new Manager(
			new HashConfig( [ 'MFAdvancedMobileContributions' => true ] ),
			$mobileContext
		);

		$config = new HashConfig( [
			'MFAmcOutreach' => $mfAmcOutreach,
			'MFAmcOutreachMinEditCount' => 0,
		] );

		return new Outreach( $userMode, $amcManager, $user, $config );
	}

	/** @return Generator */
	public static function provideIsCampaignActive(): Generator {
		yield '$mfAmcOutreach config enabled, expects campaign to be active' => [ true, true ];
		yield '$mfAmcOutreach config disabled, expects campaign to be inactive' => [ false, false ];
	}

	/**
	 * @covers ::__construct
	 * @covers ::isCampaignActive
	 * @dataProvider provideIsCampaignActive
	 */
	public function testIsCampaignActive( $mfAmcOutreach, $expected ) {
		$outreach = $this->createOutreach( $mfAmcOutreach );

		$this->assertSame( $expected, $outreach->isCampaignActive() );
	}

	/** @return Generator */
	public static function provideIsUserEligible(): Generator {
		yield '$mfAmcOutreach config enabled, user is eligible' => [ true, true ];
		yield '$mfAmcOutreach config disabled, user is not eligible' => [ false, false ];
	}

	/**
	 * @covers ::__construct
	 * @covers ::isUserEligible
	 * @dataProvider provideIsUserEligible
	 */
	public function testIsUserEligible( $mfAmcOutreach, $expected ) {
		$outreach = $this->createOutreach( $mfAmcOutreach );

		$this->assertSame( $expected, $outreach->isUserEligible() );
	}

}
