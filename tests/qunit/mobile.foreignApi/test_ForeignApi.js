( function ( M, $ ) {
	var ForeignApi = M.require( 'modules/ForeignApi' ),
		api = M.require( 'api' );

	QUnit.module( 'MobileFrontend ForeignApi' );

	// Test whether postWithToken() works when the user is logged out
	QUnit.test( '#postWithToken - anon', 1, function ( assert ) {
		var self = this,
			foreignApi = new ForeignApi(),
			editToken = mw.user.tokens.get( 'editToken' ),
			spy = this.sandbox.spy( api.Api.prototype, 'post' );

		// Make sure the central auth token cannot be received
		this.stub( foreignApi, 'getCentralAuthToken' ).returns(
			$.Deferred().rejectWith( self, [ 'notloggedin' ] )
		);

		// And ajax must return the csrftoken
		this.stub( api.Api.prototype, 'ajax' ).returns(
			$.Deferred().resolveWith( self, [ {
				query: {
					tokens: {
						csrftoken: editToken
					}
				}
			} ] )
		);

		// Now, let's post some data
		foreignApi.postWithToken( 'csrf', { some: 'data' }, {} );

		// POST must be called with the editToken, and not with the centralAuthToken
		assert.ok( spy.calledWith( {
			origin: foreignApi.getOrigin(),
			some: 'data',
			token: editToken
		} ), 'Posting to ForeignApi with token when the user is logged out works!' );
	} );

}( mw.mobileFrontend, jQuery ) );
