var talkOverlay, sandbox, Overlay, PageGateway,
	jQuery = require( '../utils/jQuery' ),
	util = require( './../../../src/mobile.startup/util' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.talk.overlays/talkOverlay', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		sandbox.stub( mw, 'msg' ).returns( 'msg-key' );
		talkOverlay = require( '../../../src/mobile.talk.overlays/talkOverlay' );
		Overlay = require( '../../../src/mobile.startup/Overlay' );
		PageGateway = require( '../../../src/mobile.startup/PageGateway' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'talkOverlay add discussion button', function ( assert ) {
	var userStub, apiStub = {},
		deferred = util.Deferred().resolve( [] ),
		spy = sandbox.stub( Overlay, 'make' );

	sandbox.stub( PageGateway.prototype, 'getSections' ).returns( deferred );
	userStub = sandbox.stub( mw.user, 'isAnon' ).returns( true );

	// first call to spy as anon
	talkOverlay( {
		title: 'Foo',
		api: apiStub
	} );

	// second call to spy as logged in
	userStub.restore();
	sandbox.stub( mw.user, 'isAnon' ).returns( false );
	talkOverlay( {
		title: 'overlay logged in',
		user: {
			isAnon: function () {
				return true;
			}
		},
		api: apiStub
	} );
	assert.propEqual(
		spy.args[1][0].headerButtons[0].href, '#/talk/new', 'logged in users have the add discussion button'
	);
	assert.propEqual( spy.args[0][0].headerButtons[0], {}, 'anons do not have the add discussion button' );
	return deferred;
} );
