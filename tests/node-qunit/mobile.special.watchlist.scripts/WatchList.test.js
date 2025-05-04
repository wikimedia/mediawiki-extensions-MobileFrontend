const
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' ),
	mustache = require( '../utils/mustache' );
let
	WatchList,
	sandbox;

QUnit.module( 'MobileFrontend WatchList.js', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		sandbox.stub( global.mw.Title, 'newFromText' ).returns(
			{ getUrl: function () {} }
		);
		sandbox.stub( mw.user, 'isAnon' ).returns( false );
		sandbox.stub( mw.loader, 'require' ).withArgs( 'mediawiki.page.watch.ajax' ).returns( {
			watchstar: () => {}
		} );

		WatchList = require( '../../../src/mobile.special.watchlist.scripts/WatchList' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'In watched mode', ( assert ) => {
	const
		stub = {
			get: sandbox.stub()
		},
		pl = new WatchList( {
			eventBus: {
				on: function () {},
				off: function () {}
			},
			api: stub,
			pages: [
				{ title: 'Title 30' },
				{ title: 'Title 50' },
				{
					title: 'Title 60',
					watched: true
				}
			]
		} );

	// Avoid API requests due to scroll events (https://phabricator.wikimedia.org/T116258)
	pl.scrollEndEventEmitter.disable();

	assert.true( stub.get.notCalled, 'Callback avoided' );
	assert.strictEqual( pl.$el.find( '.watch-this-article' ).length, 3, '3 articles have watch stars...' );
	assert.strictEqual( pl.$el.find( '.watched' ).length, 3, '...and all are marked as watched.' );
} );
