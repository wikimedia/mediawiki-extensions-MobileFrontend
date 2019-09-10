let
	SearchResultsView, sandbox;
const FEEDBACK_LINK = 'https://wikipedia.org',
	jQuery = require( '../../utils/jQuery' ),
	dom = require( '../../utils/dom' ),
	oo = require( '../../utils/oo' ),
	mediaWiki = require( '../../utils/mw' ),
	mustache = require( '../../utils/mustache' ),
	sinon = require( 'sinon' );

QUnit.module( 'MobileFrontend mobile.startup/SearchResultsView.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		sandbox.stub( global.mw.config, 'get' )
			.withArgs( 'wgCirrusSearchFeedbackLink' ).returns( FEEDBACK_LINK );

		SearchResultsView = require( '../../../../src/mobile.startup/search/SearchResultsView' );
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'renders correctly', function ( assert ) {
	const overlay = new SearchResultsView( {

	} );

	assert.strictEqual( overlay.$el.find( '.overlay-header' ).length, 1, 'It contains an overlay title' );
	assert.strictEqual( overlay.$el.find( '.results' ).length, 1, 'It contains results' );
	assert.strictEqual(
		overlay.$el.find( '.search-feedback' ).text().trim()
			.indexOf( 'mobile-frontend-search-feedback-prompt' ),
		0,
		'It contains the feedback link'
	);
	assert.strictEqual(
		overlay.$el.find( '.search-feedback a' ).attr( 'href' ),
		FEEDBACK_LINK,
		'It links to the feedback link'
	);
} );
