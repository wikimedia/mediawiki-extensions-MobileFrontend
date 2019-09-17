var
	util = require( '../../../../src/mobile.startup/util' ),
	dom = require( '../../utils/dom' ),
	jQuery = require( '../../utils/jQuery' ),
	sinon = require( 'sinon' ),
	mediawiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	oo = require( '../../utils/oo' ),
	apiResp = {
		query: {
			pages: [ {
				pageid: 30,
				title: 'Title 30',
				watched: true
			}, {
				pageid: 50,
				title: 'Title 50',
				watched: false
			} ]
		}
	},
	user,
	Icon,
	WatchstarPageList,
	watchIconName,
	sandbox;

QUnit.module( 'MobileFrontend mobile.startup/WatchstarPageList', {
	beforeEach: function () {

		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		mediawiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		oo.setUp( sandbox, global );

		// loaded after globals
		WatchstarPageList = require( '../../../../src/mobile.startup/watchstar/WatchstarPageList' );
		user = mw.user;
		Icon = require( '../../../../src/mobile.startup/Icon' );

		watchIconName = new Icon( {
			glyphPrefix: 'wikimedia',
			name: 'unStar-progressive'
		} ).getGlyphClassName();
		sandbox.stub( user, 'isAnon' ).returns( false );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Watchlist status check if no ids', function ( assert ) {
	var
		done = assert.async(),
		mwApi = new mw.Api(),
		apiSpy = sandbox.stub( mwApi, 'get' ).returns( util.Deferred().resolve( apiResp ) ),
		pageList = new WatchstarPageList( {
			api: mwApi,
			pages: [
				{ title: 'Title 0' },
				{ title: 'Title 1' }
			]
		} );

	// Wait for an internal API call to happen as a side-effect of construction.
	window.setTimeout( function () {
		pageList.getPages( [], [] ).then( function () {
			assert.ok( apiSpy.calledWith( {
				formatversion: 2,
				action: 'query',
				prop: 'info',
				inprop: 'watched',
				titles: [ 'Title 0', 'Title 1' ]
			} ), 'A request to API was made to retrieve the statuses' );
			assert.strictEqual( pageList.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
			done();
		} );
	}, 0 );
} );

QUnit.test( 'Checks watchlist status once', function ( assert ) {
	var
		done = assert.async(),
		mwApi = new mw.Api(),
		apiSpy = sandbox.stub( mwApi, 'get' ).returns( util.Deferred().resolve( apiResp ) ),
		pl = new WatchstarPageList( {
			api: mwApi,
			pages: [ {
				id: 30,
				title: 'Title 30'
			}, {
				id: 50,
				title: 'Title 50'
			} ]
		} );

	// Wait for an internal API call to happen as a side-effect of construction.
	window.setTimeout( function () {
		pl.getPages( [ 30, 50 ], [] ).then( function () {
			assert.strictEqual( apiSpy.callCount, 2,
				'run callback twice (inside postRender and this call) - no caching occurs' );
			assert.ok( apiSpy.calledWith( {
				formatversion: 2,
				action: 'query',
				prop: 'info',
				inprop: 'watched',
				pageids: [ 30, 50 ]
			} ), 'A request to API was made to retrieve the statuses' );
			assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 2, '2 articles have watch stars' );
			assert.strictEqual( pl.$el.find( '.' + watchIconName ).length, 1, '1 article is marked as watched' );
			done();
		} );
	}, 0 );
} );
