( function ( M, $ ) {
	var CategoryGateway = M.require( 'mobile.categories.overlays/CategoryGateway' );

	QUnit.module( 'MobileFrontend mobile.categories.overlays/CategoryGateway', {
		beforeEach: function () {
			this.getSpy = this.sandbox.stub( mw.Api.prototype, 'get' ).returns( $.Deferred().resolve( {
				batchcomplete: true,
				query: {
					pages: [
						{
							pageid: 5,
							ns: 0,
							title: 'HelloWorld',
							categories: [
								{
									ns: 14,
									title: 'Category:Hello'
								}
							]
						}
					]
				}
			} ) );
			this.postSpy = this.sandbox.stub( mw.Api.prototype, 'postWithToken' ).returns( $.Deferred().resolve() );
		}
	} );

	QUnit.test( '#getCategories', function ( assert ) {
		var gateway = new CategoryGateway( new mw.Api() ),
			result,
			asyncDone;

		result = gateway.getCategories( 'HelloWorld' );
		assert.notStrictEqual( result, false, 'result should not return false' );

		asyncDone = assert.async();
		result.then( function () {
			assert.strictEqual( gateway.canContinue, false, 'gateway should not continue' );
			asyncDone();
		} );

		assert.ok( this.getSpy.calledWith( {
			action: 'query',
			prop: 'categories',
			titles: 'HelloWorld',
			clprop: 'hidden',
			cllimit: 50,
			formatversion: 2
		} ), 'invalid data passed to get api request' );
	} );

	QUnit.test( '#save', function ( assert ) {
		var gateway = new CategoryGateway( new mw.Api() ),
			title = 'HelloWorld',
			categories = '[[Category:World]]';

		gateway.save( title, categories );
		assert.ok( this.postSpy.calledWith( 'csrf', {
			action: 'edit',
			title: title,
			appendtext: categories,
			summary: mw.msg( 'mobile-frontend-categories-summary' )
		} ), 'invalid data passed to post api request' );
	} );

}( mw.mobileFrontend, jQuery ) );
