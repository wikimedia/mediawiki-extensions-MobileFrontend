<?php

/**
 * @group MobileFrontend
 */
class MobileSpecialPageTest extends MediaWikiTestCase {
	public function setUp() {
		parent::setUp();
		$this->setMwGlobals( 'wgScript', '/wiki/index.php' );
	}

	/**
	 * @dataProvider provideGetDesktopUrl
	 * @param string $class
	 * @param string $subPage
	 * @param array $params
	 * @param string|null $expected
	 */
	public function testGetDesktopUrl( $class, $subPage, array $params, $expected ) {
		$context = new RequestContext();
		$context->setRequest( new FauxRequest( $params ) );
		$page = new $class;
		$page->setContext( $context );
		$this->assertEquals( $expected, $page->getDesktopUrl( $subPage ) );
	}

	public function provideGetDesktopUrl() {
		return array(
			array(
				'SpecialMobileHistory',
				'Pagename',
				array(),
				'/wiki/index.php?title=Pagename&action=history',
			),
			array(
				'SpecialMobileHistory',
				'Pagename',
				array( 'mobileaction' => 'beta' ),
				'/wiki/index.php?title=Pagename&action=history',
			),
			array(
				'SpecialMobileHistory',
				'Pagename',
				array( 'offset' => '100500' ),
				'/wiki/index.php?title=Pagename&action=history&offset=100500',
			),
			array(
				'SpecialMobileDiff',
				'100',
				array( 'foo' => 'bar' ),
				'/wiki/index.php?diff=100',
			),
			array(
				'SpecialMobileDiff',
				'100...101',
				array( 'mobileaction' => 'toggle_view_mobile', 'unhide' => 1 ),
				'/wiki/index.php?diff=101&oldid=100&unhide=1',
			),
		);
	}
}
