let sandbox, getContentStub, previewResolve,
	View, BlockMessageDetails, EditorGateway, SourceEditorOverlay,
	stubArgs;
const
	testUrl = '/w/index.php?title=User:Test',
	jQuery = require( '../utils/jQuery' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/SourceEditorOverlay', {
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

		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		SourceEditorOverlay = require( '../../../src/mobile.editor.overlay/SourceEditorOverlay' );
		BlockMessageDetails = require( '../../../src/mobile.editor.overlay/BlockMessageDetails' );
		View = require( '../../../src/mobile.startup/View' );

		stubArgs = {};
		sandbox.stub( BlockMessageDetails, 'factory' ).value( ( args ) => {
			stubArgs = args;

			return new View( {} );
		} );

		// prevent event logging requests
		sandbox.stub( SourceEditorOverlay.prototype, 'log' ).returns( util.Deferred().resolve() );

		getContentStub = sandbox.stub( EditorGateway.prototype, 'getContent' );
		sandbox.stub( mw, 'confirmCloseWindow' ).returns( {
			release: function () {}
		} );
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
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#initialize, blocked user', ( assert ) => {
	const dBlockedContent = util.Deferred().resolve( {
			text: 'section 0',
			blockinfo: {
				blockedby: 'Test',
				blockexpiry: 'infinity',
				blockreason: 'Testreason'
			}
		} ),
		done = assert.async();

	sandbox.stub( mw.Api.prototype, 'get' ).returns(
		util.Deferred().resolve( {
			parse: {
				text: 'Testreason'
			}
		} )
	);

	new SourceEditorOverlay( {
		title: 'test.css'
	}, dBlockedContent ).getLoadingPromise().then( () => {}, () => {
		done();
		assert.true(
			sinon.match( {
				partial: false,
				creator: {
					name: 'Test',
					url: testUrl
				},
				expiry: null,
				duration: null,
				reason: 'Testreason'
			} ).test( stubArgs )
		);
	} );
} );

QUnit.test( '#initialize, with given page and section', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	// The gateway is initialized with the correct properties,
	// particularly the correct section ID.
	assert.strictEqual( editorOverlay.gateway.title, 'test' );
	assert.strictEqual( editorOverlay.gateway.oldId, undefined );
	assert.strictEqual( editorOverlay.gateway.sectionId, '0' );

	return editorOverlay.getLoadingPromise().then( () => {
		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );
} );

QUnit.test( '#initialize, without a section', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test.css'
	} );

	return getContentStub().then( () => {
		assert.strictEqual( editorOverlay.gateway.title, 'test.css' );
		assert.strictEqual( editorOverlay.gateway.oldId, undefined );
		assert.strictEqual( editorOverlay.gateway.sectionId, undefined );
	} );
} );

QUnit.test( '#preview', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	editorOverlay.onStageChanges();

	return previewResolve.then( () => {
		assert.strictEqual( editorOverlay.$preview.text(), '\n\npreviewtest', 'preview loaded correctly' );
	} );
} );

QUnit.test( '#initialize, as anonymous', ( assert ) => {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'Main_page',
		isAnon: true
	} );

	return editorOverlay.getLoadingPromise().then( () => {
		assert.true( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
		assert.true( editorOverlay.$el.find( '.anonymous' ).length > 0, 'Continue login has a second class.' );
	} );
} );
