let
	TalkSectionOverlay,
	sandbox;
const
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
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Check comment box for logged in users', function ( assert ) {
	const overlay = new TalkSectionOverlay( {
		api: {},
		section: 'Test'
	} );

	assert.ok( overlay.$el.find( '.comment' ).length > 0, 'There is a visible comment box' );
} );

QUnit.test( 'Check disabled property on textarea', function ( assert ) {
	const overlay = new TalkSectionOverlay( {
		api: {},
		section: 'Test'
	} );

	assert.strictEqual( overlay.$saveButton.prop( 'disabled' ), true, '`disabled` at start.' );
	overlay.onInputTextarea( {
		target: {
			value: 'Test'
		}
	} );
	assert.strictEqual( overlay.$saveButton.prop( 'disabled' ), false, '`disabled` removed after comment box gets input value.' );
} );

QUnit.test( 'Check api request on save', function ( assert ) {
	const
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
	const overlay = new TalkSectionOverlay( {
		api: {},
		section: 'Test'
	} );

	assert.ok( overlay.$el.find( '.comment' ).length > 0, 'There is a visible comment box' );
} );
