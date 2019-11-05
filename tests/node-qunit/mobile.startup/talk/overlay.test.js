var talkOverlay, sandbox, PageGateway,
	jQuery = require( '../../utils/jQuery' ),
	util = require( './../../../../src/mobile.startup/util' ),
	dom = require( '../../utils/dom' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	oo = require( '../../utils/oo' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.talk.overlays/talkOverlay', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		sandbox.stub( mw, 'msg' ).returns( 'msg-key' );
		talkOverlay = require( '../../../../src/mobile.startup/talk/overlay' );
		PageGateway = require( '../../../../src/mobile.startup/PageGateway' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'talkOverlay add discussion button', function ( assert ) {
	var userStub, overlayAnon, overlay,
		gateway = new PageGateway( { api: {} } ),
		deferred = util.Deferred().resolve( [] );

	sandbox.stub( gateway, 'getSections' ).returns( deferred );
	sandbox.stub( mw.loader, 'using' ).returns( deferred );
	userStub = sandbox.stub( mw.user, 'isAnon' ).returns( true );

	// first call to spy as anon
	overlayAnon = talkOverlay( 'Foo', gateway );

	// second call to spy as logged in
	userStub.restore();
	sandbox.stub( mw.user, 'isAnon' ).returns( false );
	overlay = talkOverlay( 'overlay logged in', gateway );
	assert.propEqual(
		overlay.$el.find( '.continue' ).length, 1, 'logged in users have the add discussion button'
	);
	assert.propEqual( overlayAnon.$el.find( '.continue' ).length, 0,
		'anons do not have the add discussion button' );
	return deferred;
} );
