( function ( $, M ) {

	var WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		ForeignApi = M.require( 'modules/ForeignApi' ),
		user = M.require( 'user' );

	QUnit.module( 'MobileFrontend: WikiGrokResponseApi.js', {
		setup: function () {
			this.api = new WikiGrokResponseApi( {
				itemId: 'Q764812',
				subject: 'title',
				version: 'a',
				userToken: 'token',
				taskToken: 'taskToken'
			} );
			this.claims = [ {
				a: 1,
				campaign: 'actor'
			}, {
				b: 2,
				campaign: 'author'
			} ];

			this.spy = this.sandbox.stub( ForeignApi.prototype, 'postWithToken' );
		}
	} );

	QUnit.test( 'recordClaims - Anons', 9, function ( assert ) {
		var callArgs;
		this.sandbox.stub( user, 'isAnon' ).returns( true );
		this.api.recordClaims( this.claims );
		assert.ok( this.spy.called );
		callArgs = this.spy.getCall( 0 ).args;
		assert.strictEqual( callArgs[ 0 ], 'csrf' );
		assert.strictEqual( callArgs[ 1 ].action, 'wikigrokresponse' );
		assert.strictEqual( callArgs[ 1 ].claims, JSON.stringify( this.claims ) );
		//jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		assert.strictEqual( callArgs[ 1 ].subject_id, 'Q764812' );
		assert.strictEqual( callArgs[ 1 ].subject, 'title' );
		assert.strictEqual( callArgs[ 1 ].user_token, 'token' );
		assert.strictEqual( callArgs[ 1 ].task_token, 'taskToken' );
		assert.strictEqual( callArgs[ 1 ].assert, undefined );
		//jscs:enable requireCamelCaseOrUpperCaseIdentifiers
	} );

	QUnit.test( 'recordClaims - non-Anons', 2, function ( assert ) {
		var callArgs;
		this.sandbox.stub( user, 'isAnon' ).returns( false );
		this.api.recordClaims( this.claims );
		assert.ok( this.spy.called );
		callArgs = this.spy.getCall( 0 ).args;
		assert.strictEqual( callArgs[ 1 ].assert, 'user' );
	} );

}( jQuery, mw.mobileFrontend ) );
