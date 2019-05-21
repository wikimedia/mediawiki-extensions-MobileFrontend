var
	util,
	CategoryGateway,
	sandbox,
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend CategoryGateway.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		util = require( '../../../src/mobile.startup/util' );
		CategoryGateway = require( '../../../src/mobile.categories.overlays/CategoryGateway' );

		this.getSpy = {
			get: sandbox.stub().returns( util.Deferred().resolve( {
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
			} ) )
		};
		this.postSpy = {
			postWithToken: sandbox.stub().returns( util.Deferred().resolve() )
		};
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'getCategories()', function ( assert ) {
	var
		self = this,
		result,
		gateway = new CategoryGateway( this.getSpy );

	result = gateway.getCategories( 'HelloWorld' );
	assert.notStrictEqual( result, false, 'result should not return false' );

	return result.then( function () {
		assert.strictEqual( gateway.canContinue, false, 'gateway should not continue' );
		assert.ok( self.getSpy.get.calledWith( {
			action: 'query',
			prop: 'categories',
			titles: 'HelloWorld',
			clprop: 'hidden',
			cllimit: 50,
			formatversion: 2
		} ), 'invalid data passed to get api request' );
	} );

} );

QUnit.test( 'save()', function ( assert ) {
	var
		self = this,
		gateway = new CategoryGateway( this.postSpy ),
		title = 'HelloWorld',
		categories = '[[Category:World]]';

	return gateway.save( title, categories ).then( function () {
		assert.ok( self.postSpy.postWithToken.calledWith( 'csrf', {
			action: 'edit',
			title: title,
			appendtext: categories,
			summary: mw.msg( 'mobile-frontend-categories-summary' )
		} ), 'invalid data passed to post api request' );
	} );
} );
