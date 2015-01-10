<?php

/**
 * @group MobileFrontend
 */
class SpecialMobileDiffTest extends MediaWikiTestCase {
	/** Keeps track of request variables that should be unset on teardown **/
	private $unsetReqVals = array();

	public function tearDown() {
		foreach ( $this->unsetReqVals as $v ) {
			MobileContext::singleton()->getRequest()->unsetVal( $v );
		}
		MobileContext::setInstance( null ); // refresh MobileContext instance
		parent::tearDown();
	}
	/**
	 * @dataProvider providerTestNames
	 */
	public function testNames( $par, $expected ) {
		$page = new MockSpecialMobileDiff();
		$rendered = $page->executeWhenAvailable( $par );
		$this->assertEquals( $expected, $rendered );
	}

	public function providerTestNames() {
		return array(
			array( '123', true ),
			array( '123...124', true ),
			array( '4...123', true ),
			// same
			array( '123...123', false ),
			// cases where a revision doesn't exist (revisions over 200 don't exist in our mock)
			array( '123...500', false ),
			array( '500...550', false ),
			array( '500...100', false ),
			array( '500', false ),
			// bad parameters
			array( '123...', false ),
			array( '...123...', false ),
			array( '452...123...', false ),
			array( '...123', false ),
			array( 'prev...123', false ),
			array( '123...next', false ),
			array( 'prev...next', false ),
		);
	}

	/**
	 * @dataProvider redirectFromDesktopDiffProvider
	 */
	public function testRedirectFromDesktopDiff( array $query, $expected ) {
		foreach ( $query as $k => $v ) {
			MobileContext::singleton()->getRequest()->setVal( $k, $v );
			$this->unsetReqVals[] = $k;
		}
		if ( $expected ) {
			$expected = Title::newFromText( $expected )->getLocalURL();
		}
		$redirectUrl = MockSpecialMobileDiff::getMobileUrlFromDesktop();
		$this->assertEquals( $expected, $redirectUrl );
	}

	public function redirectFromDesktopDiffProvider() {
		return array(
			array( array(), false ),
			// this makes no sense but this is the url for newly created pages (oldid but no diff)
			array( array( 'oldid' => 5 ), 'Special:MobileDiff/5' ),
			array( array( 'diff' => 123 ), 'Special:MobileDiff/123' ),
			// some more complicated cases...
			array( array( 'oldid' => 90, 'diff' => 100 ), 'Special:MobileDiff/90...100' ),
			array( array( 'oldid' => 123, 'diff' => 'next' ), 'Special:MobileDiff/123...124' ),
			array( array( 'oldid' => 123, 'diff' => 'prev' ), 'Special:MobileDiff/122...123' ),
			// bad id given (revisions older than 200 do not exist in our MockRevision)
			array( array( 'diff' => 208, 'oldid' => 50 ), '' ),
			array( array( 'diff' => 50, 'oldid' => 208 ), '' ),
			array( array( 'diff' => 'prev', 'oldid' => 201 ), '' ),
			// weird edge case comparing identical things
			array( array( 'oldid' => 101, 'diff' => 101 ), 'Special:MobileDiff/101...101' ),
			// https://bugzilla.wikimedia.org/63999
			array( array( 'oldid' => 'prev', 'diff' => 5 ), 'Special:MobileDiff/5' ),
		);
	}

	public function testInlineDiffs() {
		// Test that covers all possibilities, must match 004.phpt from wikidiff2
		$x = <<<END
foo bar
baz
quux
bang
END;
		$y = <<<END
foo test
baz
bang
END;
		$diffExpected = <<<END
<div class="mw-diff-inline-header"><!-- LINES 1,1 --></div>
<div class="mw-diff-inline-changed">foo <del>bar</del><ins>test</ins></div>
<div class="mw-diff-inline-context">baz</div>
<div class="mw-diff-inline-deleted"><del>quux</del></div>
<div class="mw-diff-inline-context">bang</div>

END;
		$diff = new InlineDifferenceEngine;
		$this->assertEquals(
			$this->strip( $diffExpected ),
			$diff->generateTextDiffBody( $this->strip( $x ), $this->strip( $y ) )
		);
	}

	private function strip( $text ) {
		return str_replace( "\r", '', $text ); // Windows, $@#!%#!
	}
}

class MockSpecialMobileDiff extends SpecialMobileDiff {
	public static function getRevision( $id ) {
		return MFMockRevision::newFromId( $id );
	}
	public function executeBadQuery() {
		return false;
	}
}

class MFMockRevision extends Revision {
	private $id;

	public function getId() {
		return $this->id;
	}

	public function __construct( $revisionId ) {
		if ( $revisionId > 200 ) {
			throw new Exception( 'Unknown revision ID' );
		}
		$this->id = $revisionId;
	}

	public static function newFromId( $revisionId, $flags = 0 ) {
		if ( $revisionId <= 200 ) {
			return new MFMockRevision( $revisionId );
		}
	}

	public function getTitle() {
		return new Title( "page_$this->id" );
	}

	public function getPrevious() {
		return new MFMockRevision( $this->id - 1 );
	}

	/**
	 * Get next revision for this title
	 *
	 * @return Revision or null
	 */
	public function getNext() {
		return new MFMockRevision( $this->id + 1 );
	}
}

