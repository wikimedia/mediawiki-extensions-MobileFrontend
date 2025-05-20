<?php

use MobileFrontend\ContentProviders\DefaultContentProvider;

/**
 * @group MobileFrontend
 * @coversDefaultClass \MobileFrontend\ContentProviders\DefaultContentProvider
 * @covers ::__construct
 */
class DefaultContentProviderTest extends \MediaWikiUnitTestCase {
	/**
	 * @covers ::getHTML
	 * @dataProvider getHtmlDataProvider
	 */
	public function testGetHtml( string $expected ) {
		$defaultContentProvider = new DefaultContentProvider( $expected );
		$actual = $defaultContentProvider->getHTML();

		$this->assertSame( $expected, $actual );
	}

	/**
	 * Data provider for testGetHtml()
	 */
	public static function getHtmlDataProvider() {
		return [
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
