var
	sinon = require( 'sinon' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	editorLoadingOverlay, OverlayManager,
	sandbox, fakeRouter, overlayManager;

QUnit.module( 'MobileFrontend editorLoadingOverlay.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();

		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		// jsdom will throw "Not implemented" errors if we don't stub
		// window.scrollTo
		sandbox.stub( global.window, 'scrollTo' );

		// These must be loaded here and not earlier because they depend on the globals we fake
		editorLoadingOverlay = require( '../../../src/mobile.init/editorLoadingOverlay' );
		OverlayManager = require( '../../../src/mobile.startup/OverlayManager' );

		fakeRouter = new OO.EventEmitter();
		fakeRouter.getPath = sandbox.stub().returns( '' );
		fakeRouter.back = sandbox.spy();
		sandbox.stub( mw.loader, 'require' ).withArgs( 'mediawiki.router' ).returns( fakeRouter );
		overlayManager = new OverlayManager( fakeRouter, document.body );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'editorLoadingOverlay calls the callbacks', function ( assert ) {
	var
		afterShow = sandbox.spy(),
		afterHide = sandbox.spy(),
		overlay = editorLoadingOverlay( afterShow, afterHide );

	overlayManager.add( /^test$/, function () {
		return overlay;
	} );
	fakeRouter.emit( 'route', {
		path: 'test'
	} );

	assert.strictEqual( afterShow.callCount, 1, 'afterShow called' );
	assert.strictEqual( afterHide.callCount, 0, 'afterHide not called yet' );

	fakeRouter.emit( 'route', {
		path: ''
	} );

	assert.strictEqual( afterShow.callCount, 1, 'afterShow called only once' );
	assert.strictEqual( afterHide.callCount, 1, 'afterHide called' );
} );
