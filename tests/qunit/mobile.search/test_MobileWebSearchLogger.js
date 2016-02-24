( function ( M ) {

	var MobileWebSearchLogger = M.require( 'mobile.search/MobileWebSearchLogger' );

	QUnit.module( 'MobileFrontend: MobileWebSearchLogger', {
		setup: function () {
			this.logger = new MobileWebSearchLogger( this.schema );
			this.spy = this.sandbox.stub( mw, 'track' );
		}
	} );

	QUnit.test( 'it should log when the search is shown', 1, function ( assert ) {
		var self = this;

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

	QUnit.test( 'it should log when the search API request completes', 5, function ( assert ) {
		var data;

		// The user opens the search overlay, searches for a term, and is shown
		// results.
		this.logger.onSearchShow();
		this.logger.onSearchStart();
		this.logger.onSearchResults( {
			results: [ 'result1', 'result2' ]
		} );

		data = mw.track.getCall( 1 ).args[1];

		assert.strictEqual( 'impression-results', data.action );
		assert.strictEqual( 'prefix', data.resultSetType );
		assert.strictEqual( 2, data.numberOfResults );
		assert.strictEqual( this.logger.userSessionToken, data.userSessionToken );
		assert.strictEqual( this.logger.searchSessionToken, data.searchSessionToken );
	} );

	QUnit.test( 'it should refresh the user session token when the search is shown again', 1, function ( assert ) {
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

	QUnit.test( 'it should log when the user clicks a result', 2, function ( assert ) {
		var data;

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

		data = mw.track.getCall( 2 ).args[1];

		assert.strictEqual( 'click-result', data.action );
		assert.strictEqual( 1, data.clickIndex );
	} );

	QUnit.test( 'it should refresh the search session token when the search API request completes again', 1, function ( assert ) {
		var event = {
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

}( mw.mobileFrontend ) );
