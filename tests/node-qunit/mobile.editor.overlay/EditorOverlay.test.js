var sandbox, messageStub, getContentStub, previewResolve,
	testUrl = '/w/index.php?title=User:Test',
	EditorGateway, EditorOverlay, BlockMessage,
	jQuery = require( '../utils/jQuery' ),
	sinon = require( 'sinon' ),
	util = require( '../../../src/mobile.startup/util' ),
	oo = require( '../utils/oo' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/EditorOverlay', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		sandbox.stub( mw, 'msg' ).withArgs( 'mobile-frontend-editor-continue' ).returns( 'Continue' )
			.withArgs( 'mobile-frontend-editor-save' ).returns( 'Save' )
			.withArgs( 'mobile-frontend-editor-publish' ).returns( 'Publish' );

		EditorGateway = require( '../../../src/mobile.editor.overlay/EditorGateway' );
		EditorOverlay = require( '../../../src/mobile.editor.overlay/EditorOverlay' );
		BlockMessage = require( '../../../src/mobile.editor.overlay/BlockMessage' );

		// prevent event logging requests
		sandbox.stub( EditorOverlay.prototype, 'log' ).returns( util.Deferred().resolve() );
		messageStub = sandbox.stub( BlockMessage.prototype, 'initialize' );
		sandbox.stub( BlockMessage.prototype, 'toggle' );
		getContentStub = sandbox.stub( EditorGateway.prototype, 'getContent' );
		// avoid waiting to load 'moment',
		// using `expiry: 'infinity'` below ensures we don't need it
		sandbox.stub( mw.loader, 'using' ).returns( { then: function ( callback ) {
			callback();
		} } );
		sandbox.stub( mw, 'confirmCloseWindow' ).returns( {
			release: function () {}
		} );
		sandbox.stub( window, 'scrollTo' );
		sandbox.stub( mw.util, 'getUrl' ).returns( '/w/index.php?title=User:Test' );
		sandbox.stub( mw.config, 'get' ).withArgs( 'wgMFEditorOptions' ).returns( {
			skipPreview: true
		} ).withArgs( 'wgFormattedNamespaces' ).returns( { 2: 'User' } );
		getContentStub.returns( util.Deferred().resolve( {
			text: 'section 0',
			user: {
				id: 1,
				name: 'Foo'
			},
			block: null,
			blockedByUser: null
		} ) );
		previewResolve = util.Deferred().resolve( { text: 'previewtest' } );
		sandbox.stub( EditorGateway.prototype, 'getPreview' )
			.returns( previewResolve );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( '#initialize, blocked user', function ( assert ) {
	var dBlockedContent = util.Deferred().resolve( {
		text: 'section 0',
		userinfo: {
			options: {
				gender: 'female'
			}
		},
		blockinfo: {
			blockedby: 'Test',
			blockexpiry: 'infinity',
			blockreason: 'Testreason'
		}
	} );
	getContentStub.returns( dBlockedContent );
	// eslint-disable-next-line no-new
	new EditorOverlay( {
		title: 'test.css'
	} );

	return dBlockedContent.then( function () {
		assert.ok(
			messageStub.calledWith( {
				className: 'drawer position-fixed',
				events: {
					'click .cancel': 'onCancel',
					click: 'stopPropagation'
				},
				partial: false,
				user: {
					options: {
						gender: 'female'
					}
				},
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
	var editorOverlay = new EditorOverlay( {
		title: 'test',
		sectionId: 0
	} );

	// The gateway is initialized with the correct properties,
	// particularly the correct section ID.
	assert.strictEqual( editorOverlay.gateway.title, 'test' );
	assert.strictEqual( editorOverlay.gateway.isNewPage, undefined );
	assert.strictEqual( editorOverlay.gateway.oldId, undefined );
	assert.strictEqual( editorOverlay.gateway.sectionId, 0 );

	return getContentStub().then( function () {
		assert.strictEqual( editorOverlay.$content.val(), 'section 0', 'load correct section' );
	} );
} );

QUnit.test( '#initialize, without a section', function ( assert ) {
	var editorOverlay = new EditorOverlay( {
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
	var editorOverlay = new EditorOverlay( {
		title: 'test',
		sectionId: 0
	} );

	editorOverlay.onStageChanges();

	return previewResolve.then( function () {
		assert.strictEqual( editorOverlay.$preview.text(), '\npreviewtest\n', 'preview loaded correctly' );
	} );
} );

QUnit.test( '#without-preview', function ( assert ) {
	var editorOverlay = new EditorOverlay( {
		title: 'test',
		sectionId: 0
	} );
	return getContentStub().then( function () {
		assert.strictEqual( editorOverlay.$el.find( '.continue' ).text(), 'Save', 'no preview loaded' );
	} );
} );

QUnit.test( '#initialize, as anonymous', function ( assert ) {
	var editorOverlay = new EditorOverlay( {
		title: 'Main_page',
		isAnon: true
	} );

	// EditorOverlay triggers a call to _loadContent so will always start an async request.
	// Make this test async to ensure it finishes and doesn't cause side effects to other functions.
	return getContentStub().then( function () {
		assert.ok( editorOverlay.$anonWarning.length > 0, 'Editorwarning (IP will be saved) visible.' );
		assert.ok( editorOverlay.$el.find( '.anonymous' ).length > 0, 'Continue login has a second class.' );
	} );
} );
