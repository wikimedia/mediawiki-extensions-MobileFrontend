let
	SearchOverlay, SearchGateway, onBeforeExitSpy,
	sandbox, api, overlayOptions;
const
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	oo = require( '../../utils/oo' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.startup/SearchOverlay.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );

		api = new mw.Api();
		sandbox.stub( global.window, 'scrollTo' ).callsFake( () => {} );
		SearchGateway = require( '../../../../src/mobile.startup/search/SearchGateway' );
		onBeforeExitSpy = sandbox.spy();
		SearchOverlay = require( '../../../../src/mobile.startup/search/SearchOverlay' );
		overlayOptions = {
			placeholderMsg: 'Search for bananas',
			api,
			onBeforeExit: onBeforeExitSpy,
			gateway: new SearchGateway(
				api
			)
		};
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'renders correctly', function ( assert ) {
	const overlay = new SearchOverlay( overlayOptions );

	assert.strictEqual( overlay.$el.find( '.overlay-title' ).length, 1, 'It contains an overlay title' );
	assert.strictEqual( overlay.$el.find( '.search-results-view' ).length, 1, 'It contains a SearchResultsView' );
	assert.strictEqual( overlay.$el.find( '.results-list-container' ).length, 1, 'Contains search results container' );
} );

QUnit.test( 'resetSearch', function ( assert ) {
	const overlay = new SearchOverlay( overlayOptions );
	overlay.resetSearch();
	assert.strictEqual( overlay.$el.find( '.search-results-view' ).is( 'visible' ), false, 'All children are now hidden' );
} );

QUnit.test( 'onClickOverlayContent', function ( assert ) {
	const overlay = new SearchOverlay( overlayOptions );

	overlay.onClickOverlayContent();
	assert.strictEqual( onBeforeExitSpy.called, true,
		'Click handler triggers close of overlay' );
} );
