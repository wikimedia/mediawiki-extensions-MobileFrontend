let
	// feature dependencies
	// require OO or mw global
	watchstar, watchstarSpy;
const
	// setup dependencies
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	sinon = require( 'sinon' ),
	mediawiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	oo = require( '../../utils/oo' );

/** @type {sinon.SinonSandbox} */ let sandbox;

QUnit.module( 'MobileFrontend Watchstar.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		watchstarSpy = sandbox.spy();
		sandbox.stub( global.mw.loader, 'require' ).withArgs( 'mediawiki.page.watch.ajax' ).returns( {
			watchstar: watchstarSpy
		} );
		sandbox.stub( global.mw.Title, 'newFromText' ).returns(
			{ getUrl: function () {} }
		);

		// requires OO global
		watchstar = require( '../../../../src/mobile.startup/watchstar/watchstar' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Render a watchstar', function ( assert ) {
	const page = { title: 'Foo' },
		watchedStar = watchstar( {
			page,
			isWatched: true
		} ),
		star = watchstar( { page,
			isWatched: false } );

	// position-fixed class may not have loaded and without it the toast is not visible so use
	// a spy rather than directly testing toast element visibility
	assert.ok( watchstarSpy.calledTwice, 'The core function was called twice.' );
	assert.strictEqual( watchedStar.$el.attr( 'class' ).indexOf( 'watched' ) > -1, true, 'Watched class is correct.' );
	assert.strictEqual( star.$el.attr( 'class' ).indexOf( 'watched' ), -1, 'Unwatched class is correct.' );
} );
