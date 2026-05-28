let sandbox, getContentStub, previewResolve,
	EditorGateway, SourceEditorOverlay;
const
	jQuery = require( '../utils/jQuery' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );

// eslint-disable-next-line no-unused-vars
let blockMessageDrawer, Drawer;

QUnit.module( 'MobileFrontend mobile.editor.overlay/blockMessageDrawer', {
	beforeEach: function () {
		/* eslint-disable-next-line camelcase */
		global.__non_webpack_require__ = require( '../webpackRequire.stub' );
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		global.OO.ui.MultilineTextInputWidget = function () {
			return {
				$element: global.$( '<div>' )
			};
		};
		sandbox.stub( mw, 'msg' ).withArgs( 'mobile-frontend-editor-continue' ).returns( 'Continue' )
			.withArgs( 'mobile-frontend-editor-save' ).returns( 'Save' )
			.withArgs( 'mobile-frontend-editor-publish' ).returns( 'Publish' );

		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		SourceEditorOverlay = require( '../../../src/mobile.editor.overlay/SourceEditorOverlay' );

		// prevent event logging requests
		sandbox.stub( SourceEditorOverlay.prototype, 'log' ).returns( util.Deferred().resolve() );

		getContentStub = sandbox.stub( EditorGateway.prototype, 'getContent' );
		sandbox.stub( mw, 'confirmCloseWindow' ).returns( {
			release: function () {}
		} );

		// requestAnimationFrame doesn't exist in Node
		global.requestAnimationFrame = setTimeout;

		// mw.loader.getState is not provided by mw-node-qunit; define it so that
		// sandbox.stub() can wrap it, then stub it to return null by default.
		this.loader = mw.loader;
		mw.loader.getState = function () {};

		sandbox.stub( mw.loader, 'getState' ).returns( null );
		sandbox.stub( window, 'scrollTo' );
		sandbox.stub( mw.util, 'getUrl' ).returns( '/w/index.php?title=User:Test' );
		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgPageName' ).returns( 'User:Test' )
			.withArgs( 'wgRelevantPageName' ).returns( 'User:Test' )
			.withArgs( 'wgRevisionId' ).returns( 123 )
			.withArgs( 'wgArticleId' ).returns( 321 )
			.withArgs( 'wgNamespaceNumber' ).returns( 2 )
			.withArgs( 'wgIsMainPage' ).returns( false )
			.withArgs( 'wgFormattedNamespaces' ).returns( { 2: 'User' } )
			.withArgs( 'wgNamespaceIds' ).returns( { user: 2 } )
			.withArgs( 'wgVisualEditorConfig' ).returns( { namespaces: [ 1, 2 ] } );
		const stubTitle = {
			getUrl: function () {
				return '/w/index.php?title=User:Test';
			},
			getPrefixedText: function () {
				return 'User:Test';
			}
		};
		sandbox.stub( mw.Title, 'makeTitle' ).returns( stubTitle );
		sandbox.stub( mw.Title, 'newFromText' ).returns( stubTitle );
		getContentStub.returns( util.Deferred().resolve( {
			text: 'section 0',
			blockinfo: null
		} ) );
		previewResolve = util.Deferred().resolve( { text: '\npreviewtest' } );
		sandbox.stub( EditorGateway.prototype, 'getPreview' )
			.returns( previewResolve );

		blockMessageDrawer = require(
			'../../../src/mobile.editor.overlay/blockMessageDrawer'
		);

		// Dynamically import Drawer to use fresh sandboxed dependencies.
		Drawer = require( '../../../src/mobile.startup/Drawer' );
	},
	afterEach: function () {
		Drawer = undefined;
		jQuery.tearDown();
		sandbox.restore();
		mw.loader = this.loader;
	}
} );

QUnit.test( 'blockMessageDrawer', async ( assert ) => {
	const drawer = blockMessageDrawer( {
		parsedReason: util.Deferred().resolve( '' ).promise()
	} );

	// Assert the factory method returns a Drawer with listeners set-up
	// for the show and hide events that reposition the popup.
	assert.strictEqual( drawer.constructor.name, 'Drawer' );
	assert.strictEqual( typeof drawer.options.onShow, 'function' );
	assert.strictEqual( typeof drawer.options.onBeforeHide, 'function' );
	assert.strictEqual( drawer.drawerClassName, 'drawer block-message' );

	await drawer.show();
	assertVisible( drawer );

	await drawer.hide();
	assertHidden( drawer );
} );

QUnit.test( 'blockMessageDrawer loads additional modules when configured and module is known', async ( assert ) => {
	mw.config.get.withArgs( 'wgMobileFrontendSourceEditorInitializeModules', [] )
		.returns( [ 'ext.confirmEdit.hCaptcha' ] );
	mw.loader.getState.returns( 'ready' );
	const usingSpy = sandbox.stub( mw.loader, 'using' ).resolves();

	const drawer = blockMessageDrawer( {
		parsedReason: util.Deferred().resolve( '' ).promise()
	} );
	await drawer.show();

	assert.true( usingSpy.calledOnce, 'mw.loader.using called once' );
	assert.true( usingSpy.calledWith( 'ext.confirmEdit.hCaptcha' ), 'mw.loader.using called with the configured module' );
} );

QUnit.test.each(
	'blockMessageDrawer skips additional modules with a null or missing loader state',
	{
		'null state': { state: null },
		'missing state': { state: 'missing' }
	},
	async ( assert, testCase ) => {
		mw.config.get
			.withArgs( 'wgMobileFrontendSourceEditorInitializeModules', [] )
			.returns( [ 'ext.confirmEdit.hCaptcha' ] );

		mw.loader.getState.returns( testCase.state );

		const usingSpy = sandbox.stub( mw.loader, 'using' ).resolves();

		const drawer = blockMessageDrawer( {
			parsedReason: util.Deferred().resolve( '' ).promise()
		} );
		await drawer.show();

		assert.true(
			usingSpy.notCalled,
			'mw.loader.using not called for a module with null state'
		);
	}
);

QUnit.test( 'blockMessageDrawer does not call loadAdditionalModules when no modules are configured', async ( assert ) => {
	// wgMobileFrontendSourceEditorInitializeModules returns undefined from the default stub,
	// so hasAdditionalModules() returns false.
	const usingSpy = sandbox.stub( mw.loader, 'using' ).resolves();

	const drawer = blockMessageDrawer( {
		parsedReason: util.Deferred().resolve( '' ).promise()
	} );
	await drawer.show();

	assert.true( usingSpy.notCalled, 'mw.loader.using not called when no modules are configured' );
} );

QUnit.test( 'blockMessageDrawer fires hook with no payload', async ( assert ) => {
	const hookFireSpy = sinon.spy();
	sandbox.stub( mw, 'hook' )
		.callThrough()
		.withArgs( 'mobileFrontend.blockMessageDrawer.onShow' )
		.returns( { fire: hookFireSpy, add: sinon.stub() } );
	mw.config.get.withArgs( 'wgMobileFrontendSourceEditorInitializeModules', [] )
		.returns( [ 'ext.confirmEdit.hCaptcha' ] );

	const drawer = blockMessageDrawer( {
		parsedReason: util.Deferred().resolve( '' ).promise()
	} );

	await drawer.show();

	assert.true( hookFireSpy.calledOnce, 'hook was fired once' );
	assert.strictEqual(
		hookFireSpy.firstCall.args.length,
		0,
		'hook was fired with no arguments'
	);
} );

function assertVisible( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /.*\bvisible\b.*/ );
}

function assertHidden( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /^((?!\bvisible\b).)*$/ );
}
