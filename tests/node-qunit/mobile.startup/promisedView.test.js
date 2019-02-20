var promisedView, View,
	sandbox, happyView,
	util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend promisedView.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		View = require( './../../../src/mobile.startup/View' );
		promisedView = require( './../../../src/mobile.startup/promisedView' );
		happyView = new View( {
			isBorderBox: false,
			className: 'test'
		} );
		happyView.append( '😃' );
		sandbox.stub( mw, 'msg' ).withArgs( 'mobile-frontend-loading-message' ).returns( '⌛' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#constructor', function ( assert ) {
	var promise = util.Deferred(),
		viewSuccess = promisedView( promise );

	assert.strictEqual( viewSuccess.$el.text(), '⌛', 'the view is waiting to resolve' );
	assert.ok( viewSuccess.$el.hasClass( 'promised-view' ), 'parent element has loading class when loading' );
	promise.resolve( happyView );
	return promise.then( function () {
		assert.strictEqual( viewSuccess.$el.attr( 'class' ), 'test', 'fully replaces its parent element with happyView\'s parent element' );
		assert.strictEqual( viewSuccess.$el.text(), '😃', 'the view resolved correctly' );
	} );
} );
