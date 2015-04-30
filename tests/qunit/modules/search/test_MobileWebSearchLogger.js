( function ( M ) {

	var SchemaMobileWebSearch = M.require( 'loggingSchemas/SchemaMobileWebSearch' ),
		MobileWebSearchLogger = M.require( 'modules/search/MobileWebSearchLogger' );

	QUnit.module( 'MobileFrontend: MobileWebSearchLogger', {
		setup: function () {
			this.schema = new SchemaMobileWebSearch();
			this.stub( this.schema, 'log' ).returns( null );
			this.stub( this.schema, 'logBeacon' ).returns( null );

			this.logger = new MobileWebSearchLogger( this.schema );
		}
	} );

	QUnit.test( 'it should log when the search is shown', 4, function ( assert ) {
		var data;

		// The user opens the search overlay.
		this.logger.onSearchShow();
		this.logger.onSearchStart();

		data = this.schema.log.firstCall.args[0];

		assert.strictEqual( 'session-start', data.action );
		assert.notStrictEqual( '', data.userSessionToken );
		assert.notStrictEqual( '', data.searchSessionToken );
		assert.strictEqual( 0, data.timeOffsetSinceStart );
	} );

	QUnit.test( 'it should log when the search API request completes', 4, function ( assert ) {
		var data;

		// The user opens the search overlay, searches for a term, and is shown
		// results.
		this.logger.onSearchShow();
		this.logger.onSearchStart();
		this.logger.onSearchResults( {
			results: [ 'result1', 'result2' ]
		} );

		data = this.schema.log.secondCall.args[0];

		assert.strictEqual( 'impression-results', data.action );
		assert.strictEqual( 'prefix', data.resultSetType );
		assert.strictEqual( 2, data.numberOfResults );
		assert.notStrictEqual( undefined, data.timeToDisplayResults );
	} );

	QUnit.test( 'it should use the current user and search session tokens when logging', 2, function ( assert ) {
		this.logger.onSearchShow();
		this.logger.onSearchStart();
		this.logger.onSearchResults( {
			results: []
		} );

		assert.strictEqual(
			this.schema.log.firstCall.args[0].userSessionToken,
			this.schema.log.secondCall.args[0].userSessionToken
		);
		assert.strictEqual(
			this.schema.log.firstCall.args[0].searchSessionToken,
			this.schema.log.secondCall.args[0].searchSessionToken
		);
	} );

	QUnit.test( 'it should refresh the user session token when the search is shown again', 1, function ( assert ) {
		// The user opens the search overlay, searches for a term, closes the
		// search overlay, opens the search overlay, and searches for a term.
		this.logger.onSearchShow();
		this.logger.onSearchStart();
		this.logger.onSearchShow();
		this.logger.onSearchStart();

		assert.notStrictEqual(
			this.schema.log.firstCall.args[0].userSessionToken,
			this.schema.log.secondCall.args[0].userSessionToken
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

		data = this.schema.logBeacon.firstCall.args[0];

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
			this.schema.log.firstCall.args[0].searchSessionToken,
			this.schema.log.thirdCall.args[0].searchSessionToken
		);
	} );

} ( mw.mobileFrontend ) );
