<?php

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontendSkinHooks
 */
class MobileFrontendSkinHooksTest extends MediaWikiLangTestCase {
	/**
	 * @covers ::interimTogglingSupport
	 */
	public function testInterimTogglingSupport() {
		$nonce = RequestContext::getMain()->getOutput()->getCSP()->getNonce();
		$js = MobileFrontendSkinHooks::interimTogglingSupport( $nonce );

		$this->assertStringContainsString(
			'function mfTempOpenSection(',
			$js,
			'creates global function called from MobileFormatter::prepareHeading'
		);
		$this->assertStringContainsString(
			'mf-section-',
			$js,
			'uses (partial) ID set in MobileFormatter::createSectionBodyElement'
		);
		$this->assertStringContainsString(
			'open-block',
			$js,
			'contains class name to be toggled'
		);
	}

	/**
	 * @covers ::gradeCImageSupport
	 */
	public function testGradeCImageSupport() {
		$js = MobileFrontendSkinHooks::gradeCImageSupport();

		$this->assertStringContainsString(
			'noscript',
			$js,
			'gain the widest possible browser support, scan for noscript tag'
		);
		$this->assertStringContainsString(
			'lazy-image-placeholder',
			$js,
			'check if sibling has the lazy-image-placeholder class gotten from ns[i].nextSibling;'
		);
		$this->assertStringContainsString(
			'parentNode.replaceChild( img, p );',
			$js,
			'make sure the replacement to image tag was properly done'
		);
	}

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

	/**
	 * @covers ::getPluralLicenseInfo
	 * @covers ::getLicense
	 * @dataProvider provideGetLicenseData
	 */
	public function testGetLicense( $context, $config, $expected ) {
		$this->setMwGlobals( $config );
		$actual = MobileFrontendSkinHooks::getLicense( $context );
		$this->assertSame( $expected, $actual );
	}

	/**
	 * NOTE: Due to the links being long, we would ignore PHPCS 100 chars limit
	 * @return array
	 */
	public function provideGetLicenseData() {
		$context = RequestContext::getMain();

		return [
			[
				$context,
				[
					'wgRightsText' => null,
					'wgRightsUrl' => null,
					'wgRightsPage' => null
				],
				[
					'msg' => 'mobile-frontend-copyright',
					'link' => '',
					'plural' => 1
				]
			],
			[
				$context,
				[
					'wgRightsText' => 'Creative Commons Attribution',
					'wgRightsUrl' => null,
					'wgRightsPage' => null
				],
				[
					'msg' => 'mobile-frontend-copyright',
					'link' => 'CC BY',
					'plural' => 1
				]
			],
			[
				$context,
				[
					'wgRightsText' => 'Creative Commons Attribution 3.0',
					'wgRightsUrl' => 'https://creativecommons.org/licenses/by/3.0/',
					'wgRightsPage' => null
				],
				[
					'msg' => 'mobile-frontend-copyright',
					// @codingStandardsIgnoreLine
					'link' => '<a class="external" rel="nofollow" href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>',
					'plural' => 1
				]
			],
			[
				$context,
				[
					'wgRightsText' => 'Creative Commons Attribution 2.5',
					'wgRightsUrl' => 'https://creativecommons.org/licenses/by/2.5/',
					'wgRightsPage' => 'Rights Page',
					'wgArticlePath' => '/wiki/Rights_Page'
				],
				[
					'msg' => 'mobile-frontend-copyright',
					// @codingStandardsIgnoreLine
					'link' => '<a href="/wiki/Rights_Page" title="Rights Page">CC BY 2.5</a>',
					'plural' => 1
				]
			]
		];
	}
}
