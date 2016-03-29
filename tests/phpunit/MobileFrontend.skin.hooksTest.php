<?php

/**
 * @group MobileFrontend
 */
class SkinMinervaTest extends MediaWikiTestCase {
	/**
	 * @dataProvider getGetPluralLicenseInfo
	 * @covers MobileFrontendSkinHooks::getPluralLicenseInfo
	 */
	public function testGetPluralLicenseInfo( $isDisabledValue, $license, $expectedResult ) {
		$msgObj = $this->getMockBuilder( 'Message' )
			->disableOriginalConstructor()
			->getMock();

		$msgObj->expects( $this->once() )
			->method( 'isDisabled' )
			->will( $this->returnValue( $isDisabledValue ) );

		$msgObj->expects( $this->once() )
			->method( 'inContentLanguage' )
			->will( $this->returnValue( $msgObj ) );

		$msgObj->expects( $this->any() )
			->method( 'text' )
			->will( $this->returnValue( 'and ' ) );

		$this->assertEquals(
			$expectedResult,
			MobileFrontendSkinHooks::getPluralLicenseInfo( $license, $msgObj )
		);
	}

	public function getGetPluralLicenseInfo() {
		return array(
			// message disabled, license message, result
			array( false, 'test and test', 2 ),
			array( true, 'test and test', 1 ),
			array( false, 'test', 1 ),
			array( true, 'test', 1 ),
		);
	}
}
