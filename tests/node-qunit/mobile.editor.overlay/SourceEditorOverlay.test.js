let sandbox, messageStub, getContentStub, previewResolve,
	BlockMessageDetails,
	EditorGateway, SourceEditorOverlay;
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
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		sandbox.stub( mw, 'msg' ).withArgs( 'mobile-frontend-editor-continue' ).returns( 'Continue' )
			.withArgs( 'mobile-frontend-editor-save' ).returns( 'Save' )
			.withArgs( 'mobile-frontend-editor-publish' ).returns( 'Publish' );

		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		SourceEditorOverlay = require( '../../../src/mobile.editor.overlay/SourceEditorOverlay' );
		BlockMessageDetails = require( '../../../src/mobile.editor.overlay/BlockMessageDetails' );

		// prevent event logging requests
		sandbox.stub( SourceEditorOverlay.prototype, 'log' ).returns( util.Deferred().resolve() );
		messageStub = sandbox.stub( BlockMessageDetails.prototype, 'initialize' );
		getContentStub = sandbox.stub( EditorGateway.prototype, 'getContent' );
		// avoid waiting to load 'moment',
		// using `expiry: 'infinity'` below ensures we don't need it
		sandbox.stub( mw.loader, 'using' ).withArgs( 'moment' ).returns( util.Deferred().resolve() );
		sandbox.stub( mw, 'confirmCloseWindow' ).returns( {
			release: function () {}
		} );
		sandbox.stub( window, 'scrollTo' );
		sandbox.stub( mw.util, 'getUrl' ).returns( '/w/index.php?title=User:Test' );
		sandbox.stub( mw.config, 'get' )
			.withArgs( 'wgFormattedNamespaces' ).returns( { 2: 'User' } )
			.withArgs( 'wgNamespaceIds' ).returns( { user: 2 } );
		sandbox.stub( mw.Title, 'makeTitle' ).returns( {
			getUrl: function () {
				return '/w/index.php?title=User:Test';
			}
		} );
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

QUnit.test( '#initialize, blocked user', function ( assert ) {
	const dBlockedContent = util.Deferred().resolve( {
			text: 'section 0',
			blockinfo: {
				blockedby: 'Test',
				blockexpiry: 'infinity',
				blockreason: 'Testreason'
			}
		} ),
		done = assert.async();

	new SourceEditorOverlay( {
		title: 'test.css'
	}, dBlockedContent ).getLoadingPromise().then( () => {}, function () {
		done();
		assert.ok(
			messageStub.calledWithMatch( {
				partial: false,
				creator: {
					name: 'Test',
					url: testUrl
				},
				expiry: null,
				duration: null,
				reason: 'Testreason'
			} ),
			'There is a drawer notice, that i am blocked from editing'
		);
	} );
} );

QUnit.test( '#initialize, with given page and section', function ( assert ) {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	// The gateway is initialized with the correct properties,
	// particularly the correct section ID.
	assert.strictEqual( editorOverlay.gateway.title, 'test' );
	assert.strictEqual( editorOverlay.gateway.isNewPage, undefined );
	assert.strictEqual( editorOverlay.gateway.oldId, undefined );
	assert.strictEqual( editorOverlay.gateway.sectionId, '0' );

	return editorOverlay.getLoadingPromise().then( function () {
		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );
} );

QUnit.test( '#initialize, without a section', function ( assert ) {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test.css'
	} );

	return getContentStub().then( function () {
		assert.strictEqual( editorOverlay.gateway.title, 'test.css' );
		assert.strictEqual( editorOverlay.gateway.isNewPage, undefined );
		assert.strictEqual( editorOverlay.gateway.oldId, undefined );
		assert.strictEqual( editorOverlay.gateway.sectionId, undefined );
	} );
} );

QUnit.test( '#preview', function ( assert ) {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'test',
		sectionId: '0'
	} );

	editorOverlay.onStageChanges();

	return previewResolve.then( function () {
		assert.strictEqual( editorOverlay.$preview.text(), '\n\npreviewtest', 'preview loaded correctly' );
	} );
} );

QUnit.test( '#initialize, as anonymous', function ( assert ) {
	const editorOverlay = new SourceEditorOverlay( {
		title: 'Main_page',
		isAnon: true
	} );

	// SourceEditorOverlay triggers a call to _loadContent so will always start an async request.
	// Make this test async to ensure it finishes and doesn't cause side effects to other functions.
	return getContentStub().then( function () {
		assert.ok( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
		assert.ok( editorOverlay.$el.find( '.anonymous' ).length > 0, 'Continue login has a second class.' );
	} );
} );
