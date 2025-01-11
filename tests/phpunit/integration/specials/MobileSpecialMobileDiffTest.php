<?php

use MediaWiki\Context\RequestContext;
use MediaWiki\MainConfigNames;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;

/**
 * @group MobileFrontend
 */
class MobileSpecialMobileDiffTest extends MediaWikiIntegrationTestCase {
	protected function setUp(): void {
		parent::setUp();
		$this->overrideConfigValues( [
			MainConfigNames::Script => '/wiki/index.php',
			MainConfigNames::Server => 'https://example.org',
		] );
	}

	public static function mobileDiffProvider() {
		return [
			[
				'100',
				[ 'foo' => 'bar' ],
				'https://example.org/wiki/index.php?diff=100',
			],
			[
				'100...101',
				[ 'mobileaction' => 'toggle_view_mobile', 'unhide' => 1 ],
				'https://example.org/wiki/index.php?oldid=100&diff=101&unhide=1',
			],
			[
				'100...102',
				[ 'unhide' => 'yes' ],
				'https://example.org/wiki/index.php?oldid=100&diff=102&unhide=1',
			],
			[
				'',
				[],
				'https://example.org/wiki/Special:Diff',
			],
		];
	}

	/**
	 * @param string $subPage
	 * @param array $params
	 * @param string $expectedUrl
	 * @covers SpecialMobileDiff
	 * @dataProvider mobileDiffProvider
	 */
	public function testMobileDiff( $subPage, array $params, $expectedUrl ) {
		$page = new SpecialMobileDiff();

		$context = new RequestContext();
		$context->setRequest( new FauxRequest( $params ) );

		$output = new OutputPage( $context );
		$context->setOutput( $output );

		$page->setContext( $context );

		$page->execute( $subPage );

		$redirectUrl = $page->getOutput()->getRedirect();
		$expandedRedirectUrl = $this->getServiceContainer()->getUrlUtils()->expand( $redirectUrl, PROTO_HTTPS );

		$this->assertEquals( $expectedUrl, $expandedRedirectUrl );
	}
}
