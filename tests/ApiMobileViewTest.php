<?php

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
		);
	}
}