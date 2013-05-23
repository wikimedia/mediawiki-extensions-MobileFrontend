<?php

/**
 * @group MobileFrontend
 */
class SpecialMobileDiffTest extends MediaWikiTestCase {

	/**
	 * @dataProvider providerTestNames
	 */
	public function testNames( $par, $expected ) {
		$page = new MockSpecialMobileDiff();
		$rendered = $page->execute( $par );
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
}

class MockSpecialMobileDiff extends SpecialMobileDiff {
	public function getRevision( $id ) {
		return MFMockRevision::newFromId( $id );
	}
	public function executeBadQuery() {
		return false;
	}
}
