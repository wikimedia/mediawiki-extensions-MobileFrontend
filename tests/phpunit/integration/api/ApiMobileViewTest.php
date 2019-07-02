<?php

use MediaWiki\MediaWikiServices;

/**
 * @group MobileFrontend
 */
class ApiMobileViewTest extends MediaWikiTestCase {

	public function setUp() {
		parent::setUp();

		$this->setMwGlobals( 'wgAPIModules', [ 'mobileview' => MockApiMobileView::class ] );
	}

	/**
	 * @dataProvider provideGetRequestedSectionIds
	 * @covers ApiMobileView::getRequestedSectionIds
	 */
	public function testGetRequestedSectionIds( $expectedSections, $expectedMissing, $str ) {
		$data = [
			'sections' => range( 0, 9 ),
			'refsections' => [ 5 => 1, 7 => 1 ],
		];

		$missing = [];
		$sections = array_keys(
			ApiMobileView::getRequestedSectionIds( $str, $data, $missing )
		);
		$this->assertEquals( $expectedSections, $sections, 'Check sections' );
		$this->assertEquals( $expectedMissing, $missing, 'Check missing' );
	}

	public function provideGetRequestedSectionIds() {
		return [
			[ [], [], '' ],
			[ [], [], '  ' ],
			[ [], [ -1 ], '-1' ],
			[ range( 0, 10 ), [], 'all' ],
			[ range( 0, 10 ), [], ' all ' ],
			[ [], [ 'all!' ], 'all!' ],
			[ [], [ 'foo' ], ' foo ' ],
			[ [ 0 ], [], '0' ],
			[ [ 1 ], [], ' 1 ' ],
			[ [ 0, 2 ], [], ' 0 | 2 ' ],
			[ range( 3, 10 ), [], '3-' ],
			[ [ 3, 4, 5 ], [], '3-5' ],
			[ [ 7 ], [], '7-7' ],
			[ range( 1, 5 ), [], '5-1' ],
			[ [ 5, 7 ], [], 'references ' ],
			[ [ 0, 5, 7 ], [], '0|references' ],
			[ [ 1, 2 ], [ 11 ], '1|1|2|1|11|2|1' ],
			[ [ 1, 3, 4, 5 ], [], '1|3-5|4' ],
			[ [ 10 ], [], '10-' ],
			# https://bugzilla.wikimedia.org/show_bug.cgi?id=61868
			[ [], [ '20-' ], '20-' ],
		];
	}

	private function getMobileViewApi( $input ) {
		$request = new FauxRequest( $input );
		$context = RequestContext::getMain();
		$skinFactory = MediaWikiServices::getInstance()->getSkinFactory();
		// to test this is working we force the fallback skin which makes zero changes to the
		// parser result. This means tests will reliably pass no matter what the default skin is
		// T170624 has the background
		$context->setSkin( $skinFactory->makeSkin( 'fallback' ) );
		$context->setOutput( new OutputPage( $context ) );
		$this->setMwGlobals( 'wgOut', $context->getOutput() );
		$context->setRequest( $request );

		return new MockApiMobileView( new ApiMain( $context ), 'mobileview' );
	}

	private function executeMobileViewApi( $api, $expected ) {
		$api->execute();
		$result = $api->getResult()->getResultData( null, [
			'BC' => [],
			'Types' => [],
			'Strip' => 'all',
		] );
		$this->assertTrue(
			isset( $result['mobileview'] ),
			'API output should be encloded in mobileview element'
		);
		$this->assertArrayEquals( $expected, $result['mobileview'], false, true );
	}

	/**
	 * @dataProvider provideView
	 * @covers ApiMobileView::execute
	 * @covers ApiMobileView::makeTitle
	 * @covers ApiMobileView::getPageImage
	 * @covers ApiMobileView::isMainPage
	 * @covers ApiMobileView::stringSplitter
	 * @covers ApiMobileView::prepareSection
	 * @covers ApiMobileView::getRequestedSectionIds
	 * @covers ApiMobileView::getParserOutput
	 * @covers ApiMobileView::parseSectionsData
	 * @covers ApiMobileView::getData
	 * @covers ApiMobileView::getFilePage
	 * @covers ApiMobileView::addPageImage
	 * @covers ApiMobileView::addProtection
	 * @covers ApiMobileView::getAllowedParams
	 * @covers ApiMobileView::getResult
	 */
	public function testView( array $input, array $expected ) {
		$api = $this->getMobileViewApi( $input );
		$this->executeMobileViewApi( $api, $expected );
	}

	/**
	 * @dataProvider provideViewWithTransforms
	 * @covers ApiMobileView::execute
	 * @covers ApiMobileView::makeTitle
	 * @covers ApiMobileView::getPageImage
	 * @covers ApiMobileView::isMainPage
	 * @covers ApiMobileView::stringSplitter
	 * @covers ApiMobileView::prepareSection
	 * @covers ApiMobileView::getRequestedSectionIds
	 * @covers ApiMobileView::getParserOutput
	 * @covers ApiMobileView::parseSectionsData
	 * @covers ApiMobileView::getData
	 * @covers ApiMobileView::getFilePage
	 * @covers ApiMobileView::addPageImage
	 * @covers ApiMobileView::addProtection
	 * @covers ApiMobileView::getAllowedParams
	 * @covers ApiMobileView::getResult
	 */
	public function testViewWithTransforms( array $input, array $expected ) {
		if ( version_compare(
			PHPUnit_Runner_Version::id(),
			'4.0.0',
			'<'
		) ) {
			$this->markTestSkipped( 'testViewWithTransforms requires PHPUnit 4.0.0 or greater.' );
		}

		$api = $this->getMobileViewApi( $input );
		$api->mockFile = $this->getMock( 'MockFSFile',
			[ 'getWidth', 'getHeight', 'getTitle', 'getMimeType', 'transform' ],
			[], '', false
		);
		$api->mockFile->method( 'getWidth' )->will( $this->returnValue( 640 ) );
		$api->mockFile->method( 'getHeight' )->will( $this->returnValue( 480 ) );
		$api->mockFile->method( 'getTitle' )
			->will( $this->returnValue( Title::newFromText( 'File:Foo.jpg' ) ) );
		if ( array_key_exists( 'type', $input ) ) {
			$api->mockFile->method( 'getMimeType' )->will( $this->returnValue(
				$input[ 'type' ] === 'image/svg' ? 'image/svg' : 'image/png' )
			);
		}
		$api->mockFile->method( 'transform' )
			->will( $this->returnCallback( [ $this, 'mockTransform' ] ) );

		$this->executeMobileViewApi( $api, $expected );
	}

	public function mockTransform( array $params ) {
		$thumb = $this->getMock( 'MediaTransformOutput' );
		$thumb->method( 'getUrl' )->will( $this->returnValue( 'http://dummy' ) );
		$thumb->method( 'getWidth' )->will( $this->returnValue( $params['width'] ) );
		$thumb->method( 'getHeight' )->will( $this->returnValue( $params['height'] ) );

		return $thumb;
	}

	public function provideView() {
		$baseIn = [
			'action' => 'mobileview',
			'page' => 'Foo',
			'sections' => '1-',
			'noheadings' => '',
			'text' => 'Lead
== Section 1 ==
Text 1
== Section 2 ==
Text 2
',
		];
		$baseOut = [
			'sections' => [
				0 => [ 'id' => 0 ],
				1 => [
					'toclevel' => 1,
					'line' => 'Section 1',
					'id' => 1,
					'*' => '<p>Text 1</p>'
				],
				2 => [
					'toclevel' => 1,
					'line' => 'Section 2',
					'id' => 2,
					'*' => '<p>Text 2</p>'
				],
			],
		];

		return [
			[
				$baseIn,
				$baseOut,
			],
			[
				$baseIn + [ 'prop' => 'text' ],
				[
					'sections' => [
						[
							'id' => 1,
							'*' => '<p>Text 1</p>'
						],
						[
							'id' => 2,
							'*' => '<p>Text 2</p>'
						],
					],
				],
			],
			[
				[ 'sections' => 1, 'onlyrequestedsections' => '' ] + $baseIn,
				[
					'sections' => [
						$baseOut['sections'][1],
					],
				],
			],
			[
				[
					'page' => 'Main Page',
					'sections' => 1,
					'onlyrequestedsections' => ''
				] + $baseIn,
				[
					'mainpage' => '',
					'sections' => [],
				],
			],
			[
				[
					'page' => 'Redirected',
					'redirect' => 'yes',
				] + $baseIn,
				[
					'redirected' => 'Special:BlankPage',
					'viewable' => 'no',
				],
			],
			[
				[
					'text' => '__NOTOC__',
					'prop' => 'pageprops',
				] + $baseIn,
				[
					'sections' => [],
					'pageprops' => [ 'notoc' => '' ],
				],
			],

			// T123580
			[
				[
					'page' => 'Main Page',
					'sections' => 1,
					'onlyrequestedsections' => true,

					// When the namespace is requested...
					'prop' => 'namespace',
				] + $baseIn,
				[
					'mainpage' => '',
					'sections' => [],

					// ... then it is returned.
					'ns' => 0,
				],
			]
		];
	}

	public function provideViewWithTransforms() {
		// Note that the dimensions are values passed to #transform, not actual
		// thumbnail dimensions.
		return [
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 50,
						'height' => 50,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbsize' => 55,
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 55,
						'height' => 55,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbwidth' => 100,
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 100,
						'height' => 480,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbheight' => 200,
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 640,
						'height' => 200,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbwidth' => 200,

					// contrived but needed for testing
					'type' => 'image/svg'
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 200,
						'height' => 150,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbheight' => 200,

					// contrived but needed for testing
					'type' => 'image/svg'
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 267,
						'height' => 200,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbwidth' => 800,

					// contrived but needed for testing
					'type' => 'image/svg'
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 800,
						'height' => 600,
					]
				],
			],
			[
				[
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbheight' => 800,

					// contrived but needed for testing
					'type' => 'image/svg'
				],
				[
					'sections' => [],
					'thumb' => [
						'url' => 'http://dummy',
						'width' => 1067,
						'height' => 800,
					]
				],
			],
		];
	}

	/**
	 * @covers ApiMobileView::execute
	 * @covers ApiMobileView::getResult
	 */
	public function testRedirectToSpecialPageDoesntTriggerNotices() {
		$props = [
			'lastmodified',
			'lastmodifiedby',
			'revision',
			'id',
			'languagecount',
			'hasvariants',
			'displaytitle'
		];

		$this->setMwGlobals( 'wgAPIModules', [ 'mobileview' => 'MockApiMobileView' ] );

		$request = new FauxRequest( [
			'action' => 'mobileview',
			'page' => 'Foo',
			'sections' => '1-',
			'noheadings' => '',
			'text' => 'Lead
== Section 1 ==
Text 1
== Section 2 ==
Text 2
',
			'prop' => implode( '|', $props ),
			'page' => 'Redirected',
			'redirect' => 'yes',
		] );
		$context = new RequestContext();
		$context->setRequest( $request );
		$api = new MockApiMobileView( new ApiMain( $context ), 'mobileview' );

		$api->execute();

		$result = $api->getResult()->getResultData();

		foreach ( $props as $prop ) {
			$this->assertFalse(
				isset( $result[$prop] ),
				"{$prop} isn't included in the response when it can't be fetched."
			);
		}
	}

	/**
	 * @covers ApiMobileView::execute
	 * @covers ApiMobileView::makeTitle
	 * @covers ApiMobileView::getPageImage
	 * @covers ApiMobileView::isMainPage
	 * @covers ApiMobileView::stringSplitter
	 * @covers ApiMobileView::prepareSection
	 * @covers ApiMobileView::getRequestedSectionIds
	 * @covers ApiMobileView::getParserOutput
	 * @covers ApiMobileView::parseSectionsData
	 * @covers ApiMobileView::getData
	 * @covers ApiMobileView::getFilePage
	 * @covers ApiMobileView::addPageImage
	 * @covers ApiMobileView::addProtection
	 * @covers ApiMobileView::getAllowedParams
	 * @covers ApiMobileView::getResult
	 */
	public function testEmptyResultArraysAreAssociative() {
		$this->setMwGlobals( 'wgAPIModules', [ 'mobileview' => MockApiMobileView::class ] );

		$request = new FauxRequest( [
			'action' => 'mobileview',
			'page' => 'Foo',
			'text' => 'foo',
			'onlyrequestedsections' => '',
			'sections' => 1,
			'prop' => 'protection|pageprops',

			// intentionally nonexistent
			'pageprops' => 'foo',
		] );

		$context = new RequestContext();
		$context->setRequest( $request );
		$api = new MockApiMobileView( new ApiMain( $context ), 'mobileview' );

		$api->execute();

		$result = $api->getResult()->getResultData();

		$protection = $result['mobileview']['protection'];
		$pageprops = $result['mobileview']['pageprops'];

		$this->assertTrue( $protection[ApiResult::META_TYPE] === 'assoc' );
		// the only element is the array type flag
		$this->assertTrue( count( $protection ) === 1 );
		$this->assertTrue( $pageprops[ApiResult::META_TYPE] === 'assoc' );
		// the only element is the array type flag
		$this->assertTrue( count( $pageprops ) === 1 );
	}

	/**
	 * @covers ApiMobileView::addDescriptionToResult
	 */
	public function testLocalDescription() {
		$api = new ApiMobileView( new ApiMain( new RequestContext() ), 'mobileview' );
		$addDescriptionToResult = $this->getNonPublicMethod(
			'ApiMobileView',
			'addDescriptionToResult'
		);
		$resultObj = new ApiResult( false );
		$pageprops = [ 'wikibase-shortdesc' => 'my local description' ];
		$addDescriptionToResult->invokeArgs( $api, [ $resultObj, $pageprops, 'mobileview' ] );
		$mobileview = $resultObj->getResultData( 'mobileview' );
		$this->assertEquals( 'my local description', $mobileview[ 'description' ] );
		$this->assertEquals( 'local', $mobileview[ 'descriptionsource' ] );
	}

	/**
	 * @covers ApiMobileView::addDescriptionToResult
	 */
	public function testNoDescription() {
		$api = new ApiMobileView( new ApiMain( new RequestContext() ), 'mobileview' );
		$addDescriptionToResult = $this->getNonPublicMethod(
			'ApiMobileView',
			'addDescriptionToResult'
		);
		$resultObj = new ApiResult( false );
		$pageprops = [];
		$addDescriptionToResult->invokeArgs( $api, [ $resultObj, $pageprops, 'mobileview' ] );
		$mobileview = $resultObj->getResultData( 'mobileview' );
		$this->assertEmpty( $mobileview[ 'description' ] );
		$this->assertEmpty( $mobileview[ 'descriptionsource' ] );
	}

	/**
	 * @covers ApiMobileView::getScaledDimen
	 */
	public function testImageScaling() {
		$api = new ApiMobileView( new ApiMain( new RequestContext() ), 'mobileview' );
		$scale = $this->getNonPublicMethod( 'ApiMobileView', 'getScaledDimen' );
		$this->assertEquals( $scale->invokeArgs( $api, [ 100, 50, 20 ] ), 10, 'Check scaling downward' );
		$this->assertEquals( $scale->invokeArgs( $api, [ 50, 100, 20 ] ), 40, 'Check scaling downward' );
		$this->assertEquals( $scale->invokeArgs( $api, [ 100, 50, 200 ] ), 100, 'Check scaling upward' );
		$this->assertEquals( $scale->invokeArgs( $api, [ 50, 100, 200 ] ), 400, 'Check scaling upward' );
		$this->assertEquals( $scale->invokeArgs( $api, [ 0, 1, 2 ] ), 0, 'Check divide by zero' );
	}

	/**
	 * @covers ApiMobileView::isSVG
	 */
	public function testIsSVG() {
		$api = new ApiMobileView( new ApiMain( new RequestContext() ), 'mobileview' );
		$isSVG = $this->getNonPublicMethod( 'ApiMobileView', 'isSVG' );
		$this->assertTrue( $isSVG->invokeArgs( $api, [ 'image/svg' ] ) );
		$this->assertTrue( $isSVG->invokeArgs( $api, [ 'image/svg+xml' ] ) );
		$this->assertFalse( $isSVG->invokeArgs( $api, [ ' image/svg' ] ) );
		$this->assertFalse( $isSVG->invokeArgs( $api, [ 'image/png' ] ) );
		$this->assertFalse( $isSVG->invokeArgs( $api, [ null ] ) );
	}

	public function provideGetMobileViewPageProps() {
		return [
			// Request all available page properties
			[
				'*',
				[
					'pageprops' => [ 'wikibase_item' => 'Q76', 'notoc' => true ],
				],
				[ 'wikibase_item' => 'Q76', 'notoc' => true ],
			],
			// Request non-existent property
			[
				'monkey',
				[
					'pageprops' => [ 'wikibase_item' => 'Q76', 'notoc' => true ],
				],
				[],
			],
			// Filter out available page properties with '|'
			[
				'wikibase_item|notoc',
				[
					'pageprops' => [ 'wikibase_item' => 'Q76', 'notoc' => true ],
				],
				[ 'wikibase_item' => 'Q76', 'notoc' => true ],
			],
			// Filter out available page properties without '|'
			[
				'wikibase_item',
				[
					'pageprops' => [ 'wikibase_item' => 'Q76', 'notoc' => true ],
				],
				[ 'wikibase_item' => 'Q76' ],
			],
			// When no page properties available (T161026)
			[
				'wikibase_item',
				[
					'title' => 'Foo'
				],
				[],
			],
			// Request all from nothing
			[
				'*',
				[],
				[],
			]
		];
	}

	/**
	 * @dataProvider provideGetMobileViewPageProps
	 * @covers ApiMobileView::getMobileViewPageProps
	 */
	public function testGetMobileViewPageProps( $requested, $available, $returned ) {
		$context = new RequestContext();
		$api = new ApiMobileView( new ApiMain( $context ), 'mobileview' );
		$actual = $api->getMobileViewPageProps( $requested, $available );

		$this->assertEquals( $returned, $actual );
	}

	private static function getNonPublicMethod( $className, $methodName ) {
		$reflectionClass = new ReflectionClass( $className );
		$method = $reflectionClass->getMethod( $methodName );
		$method->setAccessible( true );
		return $method;
	}
}
