<?php

use MobileFrontend\ContentProviders\DefaultContentProvider;

/**
 * @group MobileFrontend
 * @covers \MobileFrontend\ContentProviders\DefaultContentProvider
 */
class DefaultContentProviderTest extends \MediaWikiUnitTestCase {
	/**
	 * @dataProvider getHtmlDataProvider
	 */
	public function testGetHtml( string $expected ) {
		$defaultContentProvider = new DefaultContentProvider( $expected );
		$actual = $defaultContentProvider->getHTML();

		$this->assertSame( $expected, $actual );
	}

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
