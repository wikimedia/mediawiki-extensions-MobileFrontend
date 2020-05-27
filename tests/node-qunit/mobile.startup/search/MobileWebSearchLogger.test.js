const
	sinon = require( 'sinon' ),
	mediawiki = require( '../../utils/mw' ),
	MobileWebSearchLogger = require( '../../../../src/mobile.startup/search/MobileWebSearchLogger' );
/** @type {sinon.SinonSandbox} */ let sandbox;

QUnit.module( 'MobileFrontend: MobileWebSearchLogger', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		mediawiki.setUp( sandbox, global );

		this.logger = new MobileWebSearchLogger();
		this.spy = sandbox.stub( mw, 'track' );
	},

	afterEach: function () {
		sandbox.restore();
	}
} );

QUnit.test( 'it should log when the search is shown', function ( assert ) {
	const self = this;

	// The user opens the search overlay.
	this.logger.onSearchShow();
	this.logger.onSearchStart();

	assert.ok( this.spy.calledWith( 'mf.schemaMobileWebSearch', {
		action: 'session-start',
		userSessionToken: self.logger.userSessionToken,
		searchSessionToken: self.logger.searchSessionToken,
		timeOffsetSinceStart: 0
	} ), 'Search start is logged correctly.' );
} );

QUnit.test( 'it should log when the search API request completes', function ( assert ) {
	// The user opens the search overlay, searches for a term, and is shown
	// results.
	this.logger.onSearchShow();
	this.logger.onSearchStart();
	this.logger.onSearchResults( {
		results: [ 'result1', 'result2' ]
	} );

	const data = mw.track.getCall( 1 ).args[1];

	assert.strictEqual( data.action, 'impression-results' );
	assert.strictEqual( data.resultSetType, 'prefix' );
	assert.strictEqual( data.numberOfResults, 2 );
	assert.strictEqual( data.userSessionToken, this.logger.userSessionToken );
	assert.strictEqual( data.searchSessionToken, this.logger.searchSessionToken );
} );

QUnit.test( 'it should refresh the user session token when the search is shown again', function ( assert ) {
	// The user opens the search overlay, searches for a term, closes the
	// search overlay, opens the search overlay, and searches for a term.
	this.logger.onSearchShow();
	this.logger.onSearchStart();
	this.logger.onSearchShow();
	this.logger.onSearchStart();

	assert.notStrictEqual(
		mw.track.getCall( 0 ).args[1].userSessionToken,
		mw.track.getCall( 1 ).args[1].userSessionToken
	);
} );

QUnit.test( 'it should log when the user clicks a result', function ( assert ) {
	// The user opens the search overlay, searches for a term, is shown
	// results, and clicks a result.
	this.logger.onSearchShow();
	this.logger.onSearchStart();
	this.logger.onSearchResults( {
		results: []
	} );

	// The user clicks the first result.
	this.logger.onSearchResultClick( {
		resultIndex: 0
	} );

	const data = mw.track.getCall( 2 ).args[1];

	assert.strictEqual( data.action, 'click-result' );
	assert.strictEqual( data.clickIndex, 1 );
} );

QUnit.test( 'it should refresh the search session token when the search API request completes again', function ( assert ) {
	const event = {
		results: []
	};

	// The user opens the search overlay, searches for a term, is shown
	// results, searches for another term, and is shown results.
	this.logger.onSearchShow();
	this.logger.onSearchStart();
	this.logger.onSearchResults( event );
	this.logger.onSearchStart();
	this.logger.onSearchResults( event );

	assert.notStrictEqual(
		mw.track.getCall( 1 ).args[1].searchSessionToken,
		mw.track.getCall( 3 ).args[1].searchSessionToken
	);
} );
