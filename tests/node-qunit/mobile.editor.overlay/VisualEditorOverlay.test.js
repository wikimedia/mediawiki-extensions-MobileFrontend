let EditorOverlayBase, VisualEditorOverlay, mobile, sandbox;
const
	dom = require( '../utils/dom' ),
	jQuery = require( '../utils/jQuery' ),
	makeFakeHookRegistry = require( '../utils/makeFakeHookRegistry' ),
	mustache = require( '../utils/mustache' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	returnToApp = require( '../../../src/mobile.returnToApp/returnToApp' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.editor.overlay/VisualEditorOverlay', {
	beforeEach() {
		// eslint-disable-next-line camelcase
		global.__non_webpack_require__ = require( '../webpackRequire.stub' );
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mobile = require( '../../../src/mobile.startup/mobile.startup' );
		sandbox.stub( mobile, 'currentPage' ).returns( { isVEVisualAvailable: sandbox.stub().returns( true ) } );
		this.originalHookFactory = mw.hook;
		EditorOverlayBase = require( '../../../src/mobile.editor.overlay/EditorOverlayBase' );
		VisualEditorOverlay = require( '../../../src/mobile.editor.overlay/VisualEditorOverlay' );
		// This is a very brittle stub that allows VisualEditorOverlay to be
		// exercised in this test, but probably won't behave correctly
		// otherwise.
		global.ve = {
			init: {
				mw: {
					targetFactory: {
						create: () => (
							{
								load: sandbox.stub(),
								once: sandbox.stub(),
								on: sandbox.stub(),
								saveFields: {}
							}
						)
					}
				}
			}
		};
	},
	afterEach() {
		jQuery.tearDown();
		sandbox.restore();
		mw.hook = this.originalHookFactory;
	}
} );

QUnit.test( '#constructor, returnToApp option', ( assert ) => {
	const editorOverlayWithOption = new VisualEditorOverlay( {
		dataPromise: Promise.resolve(),
		returnToApp: true,
		title: 'Main_page'
	} );
	assert.strictEqual(
		editorOverlayWithOption.target.saveFields.returntoquery(),
		returnToApp.savedQuery(),
		'When true, it sets returntoquery in save fields to what returnToApp needs to complete the handover.'
	);

	const editorOverlayWithoutOption = new VisualEditorOverlay( {
		dataPromise: Promise.resolve(),
		returnToApp: false,
		title: 'Main_page'
	} );
	assert.strictEqual(
		editorOverlayWithoutOption.target.saveFields.returntoquery,
		undefined,
		"When false, it doesn't set any returntoquery in save fields."
	);
} );

QUnit.test.each(
	'#onSaveComplete',
	{
		'revision ID only': [ 123, null, false ],
		'revision ID and temp user created': [ 123, null, true ],
		'revision ID and redirect URL': [ 123, 'http://example.test/opaque', false ],
		'revision ID, redirect URL, and temp user created': [ 123, 'http://example.test/opaque', true ]
	},
	( assert, args ) => {
		const editorOverlay = new VisualEditorOverlay( {
			dataPromise: Promise.resolve(),
			title: 'Main_page'
		} );
		const hookListener = sandbox.spy();
		const superStub = sandbox.stub( EditorOverlayBase.prototype, 'onSaveComplete' );

		mw.hook = makeFakeHookRegistry();
		mw.hook( 'mobileFrontend.visualEditor.saveComplete' ).add( hookListener );
		editorOverlay.onSaveComplete( ...args );
		assert.true(
			superStub.calledOnceWithExactly( ...args ),
			'The superclass onSaveComplete is called exactly once with the same args.'
		);
		assert.true(
			hookListener.calledOnceWithExactly( ...args ),
			'The mobileFrontend.visualEditor.saveComplete hook is fired exactly once with the revision ID, redirect URL, and temp account creation flag.'
		);
	} );
