<?php

class MockApiMobileView extends ApiMobileView {
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
			throw new MWException( 'Must specify page text' );
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
	private $savedGlobals;

	public function setUp() {
		$this->savedGlobals = $GLOBALS;
		parent::setUp();
	}

	public function tearDown() {
		parent::tearDown();
		$GLOBALS = $this->savedGlobals;
	}

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

	/**
	 * @dataProvider provideView
	 */
	public function testView( array $input, array $expected ) {
		global $wgAPIModules;
		$wgAPIModules['mobileview'] = 'MockApiMobileView';

		$request = new FauxRequest( $input );
		$context = new RequestContext();
		$context->setRequest( $request );
		$api = new MockApiMobileView( new ApiMain( $context ), 'mobileview' );
		$api->execute();
		$result = $api->getResultData();
		$this->assertTrue(
			isset( $result['mobileview'] ),
			'API output should be encloded in mobileview element'
		);
		$this->assertArrayEquals( $expected, $result['mobileview'], false, true );
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
		);
	}
}
