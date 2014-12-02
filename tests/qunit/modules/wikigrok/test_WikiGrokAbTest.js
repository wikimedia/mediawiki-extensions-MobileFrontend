( function ( M, $ ) {

	var WikiGrokAbTest = M.require( 'WikiGrokAbTest' ),
		wikiGrokUser = M.require( 'wikiGrokUser' ),
		enabledTest = new WikiGrokAbTest( true );

	QUnit.module( 'MobileFrontend: modules/wikigrok/WikiGrokAbTest' );

	QUnit.test( 'isEnabled simply exposes the isEnabled constructor parameter', 2, function ( assert ) {
		assert.strictEqual( new WikiGrokAbTest( false ).isEnabled, false );
		assert.strictEqual( new WikiGrokAbTest( true ).isEnabled, true );
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
