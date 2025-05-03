let promisedView, View,
	sandbox, happyView;
const
	util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend promisedView.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		View = require( './../../../src/mobile.startup/View' );
		promisedView = require( './../../../src/mobile.startup/promisedView' );
		happyView = new View( {
			isBorderBox: false,
			className: 'test'
		} );
		happyView.append( '😃' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#constructor happyView', ( assert ) => {
	const promise = util.Deferred(),
		viewSuccess = promisedView( promise );

	assert.strictEqual( viewSuccess.$el.text().trim(), 'mobile-frontend-loading-message', 'the view is waiting to resolve' );
	assert.true( viewSuccess.$el.hasClass( 'promised-view' ), 'parent element has loading class when loading' );
	promise.resolve( happyView );
	return promise.then( () => {
		assert.strictEqual( viewSuccess.$el.attr( 'class' ), 'test', 'fully replaces its parent element with happyView\'s parent element' );
		assert.strictEqual( viewSuccess.$el.text(), '😃', 'the view resolved correctly' );
	} );
} );

QUnit.test( '#constructor when promise rejects but not to a sadView', ( assert ) => {
	const
		promise = util.Deferred().reject( new Error( 'fake test error' ) ),
		viewFailure = promisedView( promise );

	assert.strictEqual( viewFailure.$el.text().trim(), 'mobile-frontend-loading-message', 'the view is waiting to resolve' );
	assert.true( viewFailure.$el.hasClass( 'promised-view' ), 'parent element has loading class when loading' );

	return promise.catch( () => {
		assert.strictEqual( viewFailure.$el.text().trim(), 'mobile-frontend-loading-message', 'the view still shows the loading icon' );
	} );
} );

QUnit.test( '#constructor when promise rejects to a sadView', ( assert ) => {
	const
		sadView = new View( {
			isBorderBox: false,
			className: 'error'
		} ),
		promise = util.Deferred().reject( sadView ),
		viewFailure = promisedView( promise );

	sadView.append( '😭' );

	assert.strictEqual( viewFailure.$el.text().trim(), 'mobile-frontend-loading-message', 'the view is waiting to resolve' );
	assert.true( viewFailure.$el.hasClass( 'promised-view' ), 'parent element has loading class when loading' );

	return promise.catch( () => {
		assert.strictEqual( viewFailure.$el.attr( 'class' ), 'error', 'fully replaces its parent element with sadView\'s parent element' );
		assert.strictEqual( viewFailure.$el.text(), '😭', 'the view resolved correctly' );
	} );
} );
