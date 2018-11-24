<?php

use MobileFrontend\ContentProviders\DefaultContentProvider;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\ContentProviders\DefaultContentProvider
 * @covers ::__construct
 */
class DefaultContentProviderTest extends MediaWikiTestCase {
	/**
	 * @param string $html An html string
	 * @return DefaultContentProvider
	 */
	public function createDefaultContentProvider( $html ) {
		return new DefaultContentProvider( $html );
	}

	/**
	 * @covers ::getHTML
	 * @dataProvider getHtmlDataProvider
	 */
	public function testGetHtml( $expected ) {
		$defaultContentProvider = $this->createDefaultContentProvider( $expected );
		$actual = $defaultContentProvider->getHTML();

		$this->assertSame( $expected, $actual );
	}

	/**
	 * Data provider for testGetHtml()
	 */
	public function getHtmlDataProvider() {
		return [
			[ null ],
			[ "<a>anchor</a>" ],
			[ "<html>I'm here</html>" ],
			[ "<img src='...' />" ],
			[ "<b></b>" ],
			[ "<body>Body here</body>" ],
			[ " " ],
			[ "" ]
		];
	}
}
