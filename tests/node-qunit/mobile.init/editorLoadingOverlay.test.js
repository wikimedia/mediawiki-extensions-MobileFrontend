const
	sinon = require( 'sinon' ),
	fakeRouter = require( 'mediawiki.router' ),
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	oo = require( '../utils/oo' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );
let
	editorLoadingOverlay, OverlayManager,
	sandbox, overlayManager;

QUnit.module( 'MobileFrontend editorLoadingOverlay.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();

		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		// jsdom will throw "Not implemented" errors if we don't stub
		// window.scrollTo
		sandbox.stub( global.window, 'scrollTo' );

		// These must be loaded here and not earlier because they depend on the globals we fake
		editorLoadingOverlay = require( '../../../resources/mobile.init/editor/editorLoadingOverlay' );
		OverlayManager = require( '../../../resources/mobile.startup/OverlayManager' );

		fakeRouter.back = sandbox.spy();
		overlayManager = new OverlayManager( fakeRouter, document.body );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'editorLoadingOverlay calls the callbacks', ( assert ) => {
	const
		afterShow = sandbox.spy(),
		afterHide = sandbox.spy(),
		overlay = editorLoadingOverlay( afterShow, afterHide );

	overlayManager.add( /^test$/, () => overlay );
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
