var talkOverlay, sandbox, Overlay, PageGateway,
	jQuery = require( '../../utils/jQuery' ),
	util = require( './../../../../src/mobile.startup/util' ),
	dom = require( '../../utils/dom' ),
	mediaWiki = require( '../../utils/mw' ),
	oo = require( '../../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.talk.overlays/talkOverlay', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );

		sandbox.stub( mw, 'msg' ).returns( 'msg-key' );
		talkOverlay = require( '../../../../src/mobile.startup/talk/overlay' );
		Overlay = require( '../../../../src/mobile.startup/Overlay' );
		PageGateway = require( '../../../../src/mobile.startup/PageGateway' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'talkOverlay add discussion button', function ( assert ) {
	var userStub,
		gateway = new PageGateway( { api: {} } ),
		deferred = util.Deferred().resolve( [] ),
		spy = sandbox.stub( Overlay, 'make' );

	sandbox.stub( gateway, 'getSections' ).returns( deferred );
	sandbox.stub( mw.loader, 'using' ).returns( deferred );
	userStub = sandbox.stub( mw.user, 'isAnon' ).returns( true );

	// first call to spy as anon
	talkOverlay( 'Foo', gateway );

	// second call to spy as logged in
	userStub.restore();
	sandbox.stub( mw.user, 'isAnon' ).returns( false );
	talkOverlay( 'overlay logged in', gateway );
	assert.propEqual(
		spy.args[1][0].headerButtons[0].href, '#/talk/new', 'logged in users have the add discussion button'
	);
	assert.propEqual( spy.args[0][0].headerButtons[0], {}, 'anons do not have the add discussion button' );
	return deferred;
} );
