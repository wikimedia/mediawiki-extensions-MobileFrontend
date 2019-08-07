<?php

use MediaWiki\MediaWikiServices;

/**
 * @group MobileFrontend
 */
class SpecialMobileDiffTest extends MediaWikiLangTestCase {
	/** Keeps track of request variables that should be unset on teardown **/
	private $unsetReqVals = [];

	public function tearDown() {
		parent::tearDown();

		$ctx = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		foreach ( $this->unsetReqVals as $v ) {
			$ctx->getRequest()->unsetVal( $v );
		}
		MobileContext::resetInstanceForTesting();
	}

	/**
	 * @dataProvider providerTestNames
	 * @covers SpecialMobileDiff::executeWhenAvailable
	 */
	public function testNames( $par, $expected ) {
		$page = new MockSpecialMobileDiff();
		$rendered = $page->executeWhenAvailable( $par );
		$this->assertEquals( $expected, $rendered );
	}

	public function providerTestNames() {
		return [
			[ '123', true ],
			[ '123...124', true ],
			[ '4...123', true ],
			// same
			[ '123...123', false ],
			// cases where a revision doesn't exist (revisions over 200 don't exist in our mock)
			[ '123...500', false ],
			[ '500...550', false ],
			[ '500...100', false ],
			[ '500', false ],
			// bad parameters
			[ '123...', false ],
			[ '...123...', false ],
			[ '452...123...', false ],
			[ '...123', false ],
			[ 'prev...123', false ],
			[ '123...next', false ],
			[ 'prev...next', false ],
		];
	}

	/**
	 * @dataProvider redirectFromDesktopDiffProvider
	 * @covers SpecialMobileDiff::getMobileUrlFromDesktop
	 */
	public function testRedirectFromDesktopDiff( array $query, $expected ) {
		$request = RequestContext::getMain()->getRequest();
		foreach ( $query as $k => $v ) {
			$request->setVal( $k, $v );
			$this->unsetReqVals[] = $k;
		}
		if ( $expected ) {
			$expected = Title::newFromText( $expected )->getLocalURL();
		}
		$redirectUrl = MockSpecialMobileDiff::getMobileUrlFromDesktop( $request );
		$this->assertEquals( $expected, $redirectUrl );
	}

	public function redirectFromDesktopDiffProvider() {
		return [
			[ [], false ],
			// this makes no sense but this is the url for newly created pages (oldid but no diff)
			[ [ 'oldid' => 5 ], 'Special:MobileDiff/5' ],
			[ [ 'diff' => 123 ], 'Special:MobileDiff/123' ],
			// some more complicated cases...
			[ [ 'oldid' => 90, 'diff' => 100 ], 'Special:MobileDiff/90...100' ],
			[ [ 'oldid' => 123, 'diff' => 'next' ], 'Special:MobileDiff/123...124' ],
			[ [ 'oldid' => 123, 'diff' => 'prev' ], 'Special:MobileDiff/122...123' ],
			// bad id given (revisions older than 200 do not exist in our MockRevision)
			[ [ 'diff' => 208, 'oldid' => 50 ], '' ],
			[ [ 'diff' => 50, 'oldid' => 208 ], '' ],
			[ [ 'diff' => 'prev', 'oldid' => 201 ], '' ],
			// weird edge case comparing identical things
			[ [ 'oldid' => 101, 'diff' => 101 ], 'Special:MobileDiff/101...101' ],
			// https://bugzilla.wikimedia.org/63999
			[ [ 'oldid' => 'prev', 'diff' => 5 ], 'Special:MobileDiff/5' ],
		];
	}
}

class MockSpecialMobileDiff extends SpecialMobileDiff {
	public static function getRevision( $id ) {
		return MFMockRevision::newFromId( $id );
	}

	public function executeBadQuery() {
		return false;
	}

	public function displayDiffPage() {
		// showDiff can be stubed, but the differenceengine has to be created
		$this->mDiffEngine = new MockInlineDifferenceEngine();
	}
}

class MFMockRevision extends Revision {

	/**
	 * @param int $revisionId
	 */
	public function __construct( $revisionId ) {
		$title = Title::newFromText( "Page_$revisionId" );

		parent::__construct( [
			'id' => $revisionId,
			'title' => $title,
		] );
	}

	public static function newFromId( $revisionId, $flags = 0 ) {
		if ( $revisionId <= 200 ) {
			return new MFMockRevision( $revisionId );
		} else {
			return null;
		}
	}

	public function getPrevious() {
		return new MFMockRevision( $this->getId() - 1 );
	}

	public function getSize() {
		return 100;
	}

	public function getSha1() {
		return 'mock-hash-' . $this->getId();
	}

	/**
	 * Get next revision for this title
	 *
	 * @return Revision or null
	 */
	public function getNext() {
		return new MFMockRevision( $this->getId() + 1 );
	}
}

class MockInlineDifferenceEngine extends InlineDifferenceEngine {
	public function getPatrolledLink() {
		return '';
	}
}
