( function ( $, M ) {

	var WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		Api = M.require( 'api' ).Api;

	QUnit.module( 'MobileFrontend: WikiGrokResponseApi.js', {
		setup: function () {
			this.api = new WikiGrokResponseApi( {
				itemId: 'Q764812',
				subject: 'title',
				version: 'a',
				userToken: 'token',
				taskToken: 'taskToken'
			} );

			this.spy = this.sandbox.stub( Api.prototype, 'postWithToken' );
		}
	} );

	QUnit.test( 'recordClaims', 8, function ( assert ) {
		var callArgs,
			claims = [ { a: 1 }, { b: 2 } ];
		this.api.recordClaims( claims );
		assert.ok( this.spy.called );
		callArgs = this.spy.getCall( 0 ).args;
		assert.strictEqual( callArgs[0], 'edit');
		assert.strictEqual( callArgs[1].action, 'wikigrokresponse' );
		assert.strictEqual( callArgs[1].claims, JSON.stringify( claims ) );
		assert.strictEqual( callArgs[1].subject_id, 'Q764812' );
		assert.strictEqual( callArgs[1].subject, 'title' );
		assert.strictEqual( callArgs[1].user_token, 'token' );
		assert.strictEqual( callArgs[1].task_token, 'taskToken' );
	} );

}( jQuery, mw.mobileFrontend ) );
