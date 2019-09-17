/* global $ */
var
	// feature dependencies
	// require OO or mw global
	Watchstar, Drawer, toast, Icon, watchIcon, user, Page, toastSpy,
	// setup dependencies
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	sinon = require( 'sinon' ),
	mediawiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	oo = require( '../../utils/oo' ),
	util = require( '../../../../src/mobile.startup/util' );

/** @type {sinon.SinonSandbox} */ var sandbox; // eslint-disable-line one-var

QUnit.module( 'MobileFrontend Watchstar.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		// requires OO global
		Watchstar = require( '../../../../src/mobile.startup/watchstar/Watchstar' );
		Drawer = require( '../../../../src/mobile.startup/Drawer' );
		Icon = require( '../../../../src/mobile.startup/Icon' );
		user = mw.user;
		Page = require( '../../../../src/mobile.startup/Page' );
		watchIcon = new Icon( {
			glyphPrefix: 'wikimedia',
			name: 'unStar-progressive'
		} );
		// require after stubbing
		toast = require( '../../../../src/mobile.startup/toast' );
		// Avoid unnecessary mw.notify animations
		sandbox.stub( mw, 'notify' ).callsFake( function () {} );
		toastSpy = sandbox.spy( toast, 'show' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Anonymous user opens drawer', function ( assert ) {
	var ctaDrawerSpy, $el;

	sandbox.stub( user, 'isAnon' ).returns( true );
	ctaDrawerSpy = sandbox.stub( Drawer.prototype, 'show' );
	$el = $( '<div>' );

	// eslint-disable-next-line no-new
	new Watchstar( {
		api: new mw.Api(),
		el: $el,
		page: new Page( { title: 'Title' } )
	} );
	$el.trigger( 'click' );

	// position-fixed class may not have loaded and without it the toast is not visible so use
	// a spy rather than directly testing toast element visibility
	assert.ok( ctaDrawerSpy.called, 'We checked if the drawer was visible before displaying it' );
} );

QUnit.test( 'Logged in user watches article', function ( assert ) {
	var w, $el, postWithTokenDeferred, apiSpy;
	// setting user as logged in
	sandbox.stub( user, 'isAnon' ).callsFake( function () {
		return false;
	} );

	w = new Watchstar( {
		api: new mw.Api(),
		isWatched: false,
		page: new Page( { title: 'Title' } )
	} );
	$el = w.$el;
	postWithTokenDeferred = util.Deferred().resolve();
	apiSpy = sandbox.stub( w.gateway.api, 'postWithToken' ).returns( postWithTokenDeferred );

	$el.trigger( 'click' );

	return postWithTokenDeferred.then( function () {
		assert.ok( apiSpy.calledWith( 'watch', {
			action: 'watch',
			titles: [ 'Title' ]
		} ), 'The watch happened' );
		assert.strictEqual( $el.hasClass( watchIcon.getGlyphClassName() ),
			true, 'After successful watch has watched class' );
		assert.strictEqual( toastSpy.callCount, 1, 'A toast is shown' );
	} );
} );

QUnit.test( 'Logged in user unwatches article', function ( assert ) {
	var w, $el, postWithTokenDeferred, apiSpy;

	// setting user as logged in
	sandbox.stub( user, 'isAnon' ).callsFake( function () {
		return false;
	} );

	w = new Watchstar( {
		api: new mw.Api(),
		isWatched: true,
		page: new Page( { title: 'Title' } )
	} );
	$el = w.$el;
	postWithTokenDeferred = util.Deferred().resolve();
	apiSpy = sandbox.stub( w.gateway.api, 'postWithToken' ).returns( postWithTokenDeferred );

	$el.trigger( 'click' );

	return postWithTokenDeferred.then( function () {
		assert.ok( apiSpy.calledWith( 'watch', {
			action: 'watch',
			unwatch: true,
			titles: [ 'Title' ]
		} ), 'The watch happened' );
		assert.strictEqual( toastSpy.callCount, 1, 'A toast is shown' );
	} );
} );
