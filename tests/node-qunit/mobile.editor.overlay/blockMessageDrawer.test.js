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
		sandbox = sinon.sandbox.create();
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

function assertVisible( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /.*\bvisible\b.*/ );
}

function assertHidden( drawer ) {
	sinon.assert.match( drawer.$el.find( '.drawer' )[ 0 ].className, /^((?!\bvisible\b).)*$/ );
}
