<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass MobileFrontendSkinHooks
 */
class MobileFrontendSkinHooksTest extends MediaWikiLangTestCase {
	/**
	 * @dataProvider providePluralLicenseInfoData
	 * @covers ::getPluralLicenseInfo
	 */
	public function testGetPluralLicenseInfo( $isDisabledValue, $license, $expectedResult ) {
		$msgObj = $this->createMock( Message::class );
		$msgObj->expects( $this->once() )
			->method( 'isDisabled' )
			->will( $this->returnValue( $isDisabledValue ) );
		$msgObj->expects( $this->once() )
			->method( 'inContentLanguage' )
			->will( $this->returnValue( $msgObj ) );
		$msgObj->expects( $this->any() )
			->method( 'text' )
			->will( $this->returnValue( 'and ' ) );

		$this->assertSame(
			$expectedResult,
			MobileFrontendSkinHooks::getPluralLicenseInfo( $license, $msgObj )
		);
	}

	/**
	 * @dataProvider providePluralLicenseInfoWithNullMessageObjectData
	 * @covers ::getPluralLicenseInfo
	 */
	public function testGetPluralLicenseInfoWithNullMessageObject( $license, $expected ) {
		$this->assertSame(
			$expected, MobileFrontendSkinHooks::getPluralLicenseInfo( $license )
		);
	}

	public function providePluralLicenseInfoData() {
		return [
			// message disabled, license message, result
			[ false, 'test and test', 2 ],
			[ true, 'test and test', 1 ],
			[ false, 'test', 1 ],
			[ true, 'test', 1 ],
			[ false, null, 1 ],
			[ true, null, 1 ]
		];
	}

	public function providePluralLicenseInfoWithNullMessageObjectData() {
		return [
			// license message, expected results
			[ 'test and test', 2 ],
			[ 'test', 1 ]
		];
	}

	/**
	 * @dataProvider provideGetTermsLinkData
	 * @covers ::getTermsLink
	 */
	public function testGetTermsLink( $isDisabled, $expected ) {
		$messageMock = $this->createMock( Message::class );
		$messageMock->method( 'inContentLanguage' )
			->willReturnSelf();
		$messageMock->method( 'isDisabled' )
			->willReturn( $isDisabled );
		$messageMock->method( 'plain' )
			->willReturn( 'https://wiki.mobilefrontend.mf' );
		$messageMock->method( 'text' )
			->willReturn( 'Text should escape <' );

		$messageLocalizerMock = $this->createMock( MessageLocalizer::class );
		$messageLocalizerMock->method( 'msg' )
			->willReturn( $messageMock );

		$actual = MobileFrontendSkinHooks::getTermsLink( $messageLocalizerMock );
		$this->assertSame( $expected, $actual );
	}

	public function provideGetTermsLinkData() {
		return [
			[ true, null ],
			[ false, '<a href="https://wiki.mobilefrontend.mf">Text should escape &lt;</a>' ]
		];
	}
}
