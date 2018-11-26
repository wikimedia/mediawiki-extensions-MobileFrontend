var sandbox, page, gateway, drawer,
	ReferenceDrawer, Page,
	sinon = require( 'sinon' ),
	oo = require( '../../utils/oo' ),
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	mediaWiki = require( '../../utils/mw' ),
	util = require( '../../../../src/mobile.startup/util' ),
	ReferencesGateway = require( '../../../../src/mobile.startup/references/ReferencesGateway' );

QUnit.module( 'MobileFrontend: ReferencesDrawer', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		Page = require( '../../../../src/mobile.startup/Page' );
		ReferenceDrawer = require( '../../../../src/mobile.startup/references/ReferencesDrawer' );
		gateway = {
			getReference: function () {}
		};
		page = new Page( { title: 'reference test' } );
		drawer = new ReferenceDrawer( {
			page: page,
			gateway: gateway
		} );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Bad reference not shown', function ( assert ) {
	var promise = util.Deferred().reject( ReferencesGateway.ERROR_NOT_EXIST ).promise(),
		hideSpy = sandbox.spy( drawer, 'hide' );

	sandbox.stub( gateway, 'getReference' ).returns( promise );
	drawer.showReference( '#cite_note-bad', page, '1' );

	return promise.catch( function () {
		assert.strictEqual( hideSpy.callCount, 1, 'Hide is called.' );
	} );
} );

QUnit.test( 'Good reference causes render', function ( assert ) {
	var promise = util.Deferred().resolve( {
			text: 'I am a reference'
		} ).promise(),
		renderSpy = sandbox.spy( drawer, 'render' ),
		showSpy = sandbox.spy( drawer, 'show' ),
		done = assert.async();

	sandbox.stub( gateway, 'getReference' ).returns( promise );
	drawer.showReference( '#cite_note-good', page, '1' );

	return promise.then( function () {
		assert.strictEqual( showSpy.callCount, 1, 'Show is called.' );
		assert.strictEqual( renderSpy.callCount, 1, 'Render is called.' );
		done();
	} );
} );

QUnit.test( 'Reference failure renders error in drawer', function ( assert ) {
	var promise = util.Deferred().reject( ReferencesGateway.ERROR_OTHER ).promise(),
		renderSpy = sandbox.spy( drawer, 'render' ),
		showSpy = sandbox.spy( drawer, 'show' ),
		done = assert.async();

	sandbox.stub( gateway, 'getReference' ).returns( promise );
	drawer.showReference( '#cite_note-bad', page, '1' );

	return promise.catch( function () {
		assert.strictEqual( showSpy.callCount, 1, 'Show is called.' );
		assert.strictEqual( renderSpy.callCount, 1, 'Render is called.' );
		assert.ok( renderSpy.calledWith( {
			error: true,
			title: '1',
			text: mw.msg( 'mobile-frontend-references-citation-error' )
		} ), 'Render is called with the error parameter.' );
		done();
	} );
} );
