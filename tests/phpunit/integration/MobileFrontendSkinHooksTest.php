<?php

use MediaWiki\Message\Message;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontendSkinHooks
 */
class MobileFrontendSkinHooksTest extends MediaWikiLangTestCase {
	private function getInstance(): MobileFrontendSkinHooks {
		return new MobileFrontendSkinHooks(
			$this->getServiceContainer()->getUrlUtils()
		);
	}

	/**
	 * @covers ::getTermsLink
	 * @dataProvider provideGetTermsLinkData
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

		$actual = $this->getInstance()->getTermsLink( $messageLocalizerMock );
		$this->assertSame( $expected, $actual );
	}

	public static function provideGetTermsLinkData() {
		return [
			[ true, null ],
			[ false, '<a href="https://wiki.mobilefrontend.mf">Text should escape &lt;</a>' ]
		];
	}
}
