var
	TalkSectionOverlay,
	sandbox,
	util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend TalkSectionOverlay.js - logged in', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		TalkSectionOverlay = require( '../../../src/mobile.talk.overlays/TalkSectionOverlay' );

		// don't create toasts in test environment
		this.toastStub = sandbox.stub( mw, 'notify' );

		sandbox.stub( mw.user, 'isAnon' ).returns( false );
		this.renderFromApiSpy = sandbox.stub( TalkSectionOverlay.prototype, 'renderFromApi' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Load section from api only, if needed', function ( assert ) {
	// eslint-disable-next-line no-new
	new TalkSectionOverlay( {
		api: {},
		section: 'Testtext'
	} );

	assert.strictEqual( this.renderFromApiSpy.callCount, 0, 'Section requested from api, if no section given.' );

	// eslint-disable-next-line no-new
	new TalkSectionOverlay( {
		api: {}
	} );
	assert.strictEqual( this.renderFromApiSpy.callCount, 1, 'No Api request, if section given' );
} );

QUnit.test( 'Check comment box for logged in users', function ( assert ) {
	var overlay = new TalkSectionOverlay( {
		api: {},
		section: 'Test'
	} );

	assert.ok( overlay.$el.find( '.comment' ).length > 0, 'There is a visible comment box' );
} );

QUnit.test( 'Check error class on textarea', function ( assert ) {
	var overlay;

	overlay = new TalkSectionOverlay( {
		api: {},
		section: 'Test'
	} );

	// add error class
	overlay.onSaveClick();
	assert.ok( overlay.$textarea.hasClass( 'error' ), 'Error class added when try to submit empty comment box.' );
	overlay.onFocusTextarea();
	assert.strictEqual( overlay.$textarea.hasClass( 'error' ), false, 'Error class removed after comment box get focus.' );
} );

QUnit.test( 'Check api request on save', function ( assert ) {
	var
		deferred = util.Deferred().resolve(),
		spy = sandbox.stub().returns( deferred ),
		overlay = new TalkSectionOverlay( {
			api: {
				postWithToken: spy
			},
			title: 'Talk:Test',
			id: 1,
			section: 'Test'
		} );

	overlay.state.text = 'Testcomment';
	overlay.onSaveClick();

	return deferred.then( function () {
		assert.ok( spy.calledWith( 'csrf', {
			action: 'edit',
			title: 'Talk:Test',
			section: 1,
			appendtext: '\n\nTestcomment ~~~~',
			redirect: true
		} ), 'Save request passes!' );
	} );
} );

QUnit.module( 'MobileFrontend TalkSectionOverlay.js - anonymous (logged out)', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		TalkSectionOverlay = require( '../../../src/mobile.talk.overlays/TalkSectionOverlay' );

		sandbox.stub( mw.user, 'isAnon' ).returns( false );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Check comment box for logged out users', function ( assert ) {
	var overlay = new TalkSectionOverlay( {
		api: {},
		section: 'Test'
	} );

	assert.ok( overlay.$el.find( '.comment' ).length > 0, 'There is a visible comment box' );
} );
