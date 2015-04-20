<?php

class MockApiMobileView extends ApiMobileView {
	/** @var PHPUnit_Framework_MockObject_MockObject */
	public $mockFile;

	protected function makeTitle( $name ) {
		$t = Title::newFromText( $name );
		$row = new stdClass();
		$row->page_id = 1;
		$row->page_title = $t->getDBkey();
		$row->page_namespace = $t->getNamespace();

		return Title::newFromRow( $row );
	}

	protected function getParserOutput( WikiPage $wp, ParserOptions $parserOptions ) {
		$params = $this->extractRequestParams();
		if ( !isset( $params['text'] ) ) {
			throw new Exception( 'Must specify page text' );
		}
		$parser = new Parser();
		$po = $parser->parse( $params['text'], $wp->getTitle(), $parserOptions );
		$po->setTOCEnabled( false );
		$po->setText( str_replace( array( "\r", "\n" ), '', $po->getText() ) );

		return $po;
	}

	protected function makeWikiPage( Title $title ) {
		return new MockWikiPage( $title );
	}

	protected function makeParserOptions( WikiPage $wp ) {
		return new ParserOptions( $this->getUser() );
	}

	public function getAllowedParams() {
		return array_merge( parent::getAllowedParams(), array( 'text' => null ) );
	}

	protected function findFile( $title, $options = array() ) {
		return $this->mockFile;
	}

	protected function getPageImage( Title $title ) {
		return $this->findFile( $title );
	}
}

class MockWikiPage extends WikiPage {
	public function getLatest() {
		return 123;
	}

	public function isRedirect() {
		return $this->getTitle()->getPrefixedText() === 'Redirected';
	}

	public function getRedirectTarget() {
		if ( $this->getTitle()->getPrefixedText() === 'Redirected' ) {
			return SpecialPage::getTitleFor( 'Blankpage' );
		}
		return null;
	}
}

/**
 * @group MobileFrontend
 */
class ApiMobileViewTest extends MediaWikiTestCase {

	/**
	 * @dataProvider provideSections
	 */
	public function testParseSections( $expectedSections, $expectedMissing, $str ) {
		$data = array(
			'sections' => range( 0, 9 ),
			'refsections' => array( 5 => 1, 7 => 1 ),
		);

		$missing = array();
		$sections = array_keys( ApiMobileView::parseSections( $str, $data, $missing ) );
		$this->assertEquals( $expectedSections, $sections, 'Check sections' );
		$this->assertEquals( $expectedMissing, $missing, 'Check missing' );
	}

	public function provideSections() {
		return array(
			array( array(), array(), '' ),
			array( array(), array(), '  ' ),
			array( array(), array( -1 ), '-1' ),
			array( range( 0, 10 ), array(), 'all' ),
			array( range( 0, 10 ), array(), ' all ' ),
			array( array(), array( 'all!' ), 'all!' ),
			array( array(), array( 'foo' ), ' foo ' ),
			array( array( 0 ), array(), '0' ),
			array( array( 1 ), array(), ' 1 ' ),
			array( array( 0, 2 ), array(), ' 0 | 2 ' ),
			array( range( 3, 10 ), array(), '3-' ),
			array( array( 3, 4, 5 ), array(), '3-5' ),
			array( array( 7 ), array(), '7-7' ),
			array( range( 1, 5 ), array(), '5-1' ),
			array( array( 5, 7 ), array(), 'references ' ),
			array( array( 0, 5, 7 ), array(), '0|references' ),
			array( array( 1, 2 ), array( 11 ), '1|1|2|1|11|2|1' ),
			array( array( 1, 3, 4, 5 ), array(), '1|3-5|4' ),
			array( array( 10 ), array(), '10-' ),
			array( array(), array( '20-' ), '20-' ), # https://bugzilla.wikimedia.org/show_bug.cgi?id=61868
		);
	}

	public function setUp() {
		parent::setUp();

		$this->setMwGlobals( 'wgAPIModules', array( 'mobileview' => 'MockApiMobileView' ) );
	}

	private function getMobileViewApi( $input ) {
		$request = new FauxRequest( $input );
		$context = new RequestContext();
		$context->setRequest( $request );

		if ( !defined( 'PAGE_IMAGES_INSTALLED' ) ) {
			define( 'PAGE_IMAGES_INSTALLED', true );
		}

		return new MockApiMobileView( new ApiMain( $context ), 'mobileview' );
	}

	private function executeMobileViewApi( $api, $expected ) {
		$api->execute();
		if ( defined( 'ApiResult::META_CONTENT' ) ) {
			$result = $api->getResult()->getResultData( null, array(
				'BC' => array(),
				'Types' => array(),
				'Strip' => 'all',
			) );
		} else {
			$result = $api->getResultData();
		}
		$this->assertTrue(
			isset( $result['mobileview'] ),
			'API output should be encloded in mobileview element'
		);
		$this->assertArrayEquals( $expected, $result['mobileview'], false, true );
	}

	/**
	 * @dataProvider provideView
	 */
	public function testView( array $input, array $expected ) {
		$api = $this->getMobileViewApi( $input );
		$this->executeMobileViewApi( $api, $expected );
	}

	/**
	 * @dataProvider provideViewWithTransforms
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
			array( 'getWidth', 'getHeight', 'getTitle', 'transform' ),
			array(), '', false
		);
		$api->mockFile->method( 'getWidth' )->will( $this->returnValue( 640 ) );
		$api->mockFile->method( 'getHeight' )->will( $this->returnValue( 480 ) );
		$api->mockFile->method( 'getTitle' )
			->will( $this->returnValue( Title::newFromText( 'File:Foo.jpg' ) ) );
		$api->mockFile->method( 'transform' )
			->will( $this->returnCallback( array( $this, 'mockTransform' ) ) );

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
		$baseIn = array(
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
		);
		$baseOut = array(
			'sections' => array(
				0 => array( 'id' => 0 ),
				1 => array(
					'toclevel' => 1,
					'line' => 'Section 1',
					'id' => 1,
					'*' => '<p>Text 1</p>'
				),
				2 => array(
					'toclevel' => 1,
					'line' => 'Section 2',
					'id' => 2,
					'*' => '<p>Text 2</p>'
				),
			),
		);

		return array(
			array(
				$baseIn,
				$baseOut,
			),
			array(
				$baseIn + array( 'prop' => 'text' ),
				array(
					'sections' => array(
						array(
							'id' => 1,
							'*' => '<p>Text 1</p>'
						),
						array(
							'id' => 2,
							'*' => '<p>Text 2</p>'
						),
					),
				),
			),
			array(
				array( 'sections' => 1, 'onlyrequestedsections' => '' ) + $baseIn,
				array(
					'sections' => array(
						$baseOut['sections'][1],
					),
				),
			),
			array(
				array(
					'page' => 'Main Page',
					'sections' => 1,
					'onlyrequestedsections' => ''
				) + $baseIn,
				array(
					'mainpage' => '',
					'sections' => array(),
				),
			),
			array(
				array(
					'page' => 'Redirected',
					'redirect' => 'yes',
				) + $baseIn,
				array(
					'redirected' => 'Special:BlankPage',
					'viewable' => 'no',
				),
			),
			array(
				array(
					'text' => '__NOTOC__',
					'prop' => 'pageprops',
				) + $baseIn,
				array(
					'sections' => array(),
					'pageprops' => array( 'notoc' => '' ),
				),
			),
		);
	}

	public function provideViewWithTransforms() {

		// Note that the dimensions are values passed to #transform, not actual
		// thumbnail dimensions.
		return array(
			array(
				array(
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
				),
				array(
					'sections' => array(),
					'thumb' => array(
						'url' => 'http://dummy',
						'width' => 50,
						'height' => 50,
					)
				),
			),
			array(
				array(
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbsize' => 55,
				),
				array(
					'sections' => array(),
					'thumb' => array(
						'url' => 'http://dummy',
						'width' => 55,
						'height' => 55,
					)
				),
			),
			array(
				array(
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbwidth' => 100,
				),
				array(
					'sections' => array(),
					'thumb' => array(
						'url' => 'http://dummy',
						'width' => 100,
						'height' => 480,
					)
				),
			),
			array(
				array(
					'page' => 'Foo',
					'text' => '',
					'prop' => 'thumb',
					'thumbheight' => 200,
				),
				array(
					'sections' => array(),
					'thumb' => array(
						'url' => 'http://dummy',
						'width' => 640,
						'height' => 200,
					)
				),
			),
		);
	}

	public function testRedirectToSpecialPageDoesntTriggerNotices() {
		$props = array(
			'lastmodified',
			'lastmodifiedby',
			'revision',
			'id',
			'languagecount',
			'hasvariants',
			'displaytitle'
		);

		$this->setMwGlobals( 'wgAPIModules', array( 'mobileview' => 'MockApiMobileView' ) );

		$request = new FauxRequest( array(
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
		) );
		$context = new RequestContext();
		$context->setRequest( $request );
		$api = new MockApiMobileView( new ApiMain( $context ), 'mobileview' );

		$api->execute();

		if ( defined( 'ApiResult::META_CONTENT' ) ) {
			$result = $api->getResult()->getResultData();
		} else {
			$result = $api->getResultData();
		}

		foreach ( $props as $prop ) {
			$this->assertFalse(
				isset( $result[$prop] ),
				"{$prop} isn't included in the response when it can't be fetched."
			);
		}
	}
}
