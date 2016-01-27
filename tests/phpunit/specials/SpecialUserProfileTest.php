<?php

class SpecialUserProfileTest extends MediaWikiLangTestCase {

	public function setUp() {
		parent::setUp();
		$user = User::newFromName( 'UserThatExists' );
		if ( !$user->getId() ) {
			$user->addToDatabase();
		}
	}
	/**
	 * @covers SpecialUserProfile::getRedirect
	 * @dataProvider provideGetRedirect
	 */
	public function testGetRedirect( $par, $expected, $exception = false ) {
		if ( $exception ) {
			$this->setExpectedException( $exception );
		}
		$sp = new SpecialUserProfile;
		$title = $sp->getRedirect( $par );
		$this->assertEquals( $expected, $title->getPrefixedText() );
	}

	public static function provideGetRedirect() {
		return array(
			// IP address
			array(
				'127.0.0.1',
				'Special:Contributions/127.0.0.1'
			),
			// User that exists
			array(
				'UserThatExists',
				'User:UserThatExists',
			),
			// User that doesn't exist
			array(
				'UserThatDoesNotExist',
				'Special:Contributions/UserThatDoesNotExist',
			),
			// Invalid username
			array(
				'NotAValidUsername[]',
				'',
				'BadTitleError'
			),
		);
	}
}
