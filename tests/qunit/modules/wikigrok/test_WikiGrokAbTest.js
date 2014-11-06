( function ( M, $ ) {

	var WikiGrokAbTest = M.require( 'WikiGrokAbTest' ),
		wikiGrokUser = M.require( 'wikiGrokUser' ),
		now = new Date().getTime() / 1000,
		enabledTest = new WikiGrokAbTest( now - 86400, now + 86400 );

	QUnit.module( 'MobileFrontend: modules/wikigrok/WikiGrokAbTest', {
	} );

	QUnit.test( 'isEnabled returns false when the experiment isn\'t enabled', 2, function ( assert ) {
		var dataProvider = [
				[now + 86400, now + 86401], // startDate is in the future
				[now - 86400, now - 86401], // endDate in the past
			],
			test;

		$.each( dataProvider, function ( i, data ) {
			test = new WikiGrokAbTest( data[0], data[1] );

			assert.strictEqual( test.isEnabled, false );
		} );
	} );

	QUnit.test( 'isEnabled returns true when the test is active', 1, function ( assert ) {
		assert.strictEqual( enabledTest.isEnabled, true );
	} );

	QUnit.test( 'getVersion()', 62, function ( assert ) {

		// A map of expected version to last character of the user's token
		var dataProvider = {
			'A': '0123456789ABCDEFGHIJKLMNOPQRSTU'.split( '' ),
			'B': 'VWXYZabcdefghijklmnopqrstuvwxyz'.split( '' )
		};

		this.stub( wikiGrokUser, 'getToken' );

		$.each( dataProvider, function ( expectedVersion, tokens ) {
			$.each( tokens, function ( i, token ) {
					wikiGrokUser.getToken.returns( token );

					assert.strictEqual( enabledTest.getVersion( wikiGrokUser ), expectedVersion );
			} );
		} );

	} );

} ( mw.mobileFrontend, jQuery ) );
