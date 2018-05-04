( function ( M, $ ) {
	var
		WatchstarGateway = M.require( 'mobile.watchstar/WatchstarGateway' ),
		GET_RESPONSE = {
			batchcomplete: true,
			query: {
				pages: [ {
					pageid: 123,
					ns: 0,
					title: 'An unwatched page',
					contentmodel: 'wikitext',
					pagelanguage: 'en',
					pagelanguagehtmlcode: 'en',
					pagelanguagedir: 'ltr',
					touched: '2018-05-01T01:39:12Z',
					lastrevid: 10,
					length: 3,
					'new': true,
					watched: false
				}, {
					pageid: 456,
					ns: 0,
					title: 'A watched page',
					contentmodel: 'wikitext',
					pagelanguage: 'en',
					pagelanguagehtmlcode: 'en',
					pagelanguagedir: 'ltr',
					touched: '2018-05-01T01:43:31Z',
					lastrevid: 24,
					length: 3,
					'new': true,
					watched: true
				} ]
			}
		};

	QUnit.module( 'MobileFrontend: WatchstarGateway.js' );

	QUnit.test( 'getStatuses(nonempty)', function ( assert ) {
		var
			subject,
			expected,
			api,
			mockAPI;

		api = { get: function () {} };
		mockAPI = this.sandbox.mock( api );

		mockAPI
			.expects( 'get' )
			.withArgs( this.sandbox.match.has( 'pageids' ) )
			.once()
			.returns( $.Deferred().resolve( {
				batchcomplete: true,
				query: { pages: [ GET_RESPONSE.query.pages[0] ] }
			} ) );
		mockAPI
			.expects( 'get' )
			.withArgs( this.sandbox.match.has( 'titles' ) )
			.once()
			.returns( $.Deferred().resolve( {
				batchcomplete: true,
				query: { pages: [ GET_RESPONSE.query.pages[1] ] }
			} ) );

		subject = new WatchstarGateway( api );
		return subject.getStatuses(
			[ '123' ], [ 'A watched page' ]
		).then( function ( actual ) {
			expected = {
				'An unwatched page': false,
				'A watched page': true
			};
			assert.deepEqual( actual, expected, 'The correct result is returned.' );
			mockAPI.verify();
		} );
	} );

	QUnit.test( 'getStatuses(empty)', function ( assert ) {
		var
			subject,
			expected,
			api,
			mockAPI;

		api = { get: function () {} };
		mockAPI = this.sandbox.mock( api )
			.expects( 'get' )
			// No HTTP requests are issued.
			.never();

		subject = new WatchstarGateway( api );
		return subject.getStatuses( [], [] ).then( function ( actual ) {
			expected = {};
			assert.deepEqual( actual, expected, 'An empty result is returned.' );
			mockAPI.verify();
		} );
	} );

	QUnit.test( 'getStatusesByID(nonempty)', function ( assert ) {
		var
			subject,
			expected,
			api,
			mockAPI;

		api = { get: function () {} };
		mockAPI = this.sandbox.mock( api )
			.expects( 'get' )
			.once()
			// One HTTP request is issued.
			.returns( $.Deferred().resolve( GET_RESPONSE ) );

		subject = new WatchstarGateway( api );
		return subject.getStatusesByID( [ '123', 456 ] ).then( function ( actual ) {
			expected = {
				'An unwatched page': false,
				'A watched page': true
			};
			assert.deepEqual( actual, expected, 'The correct result is returned.' );
			mockAPI.verify();
		} );
	} );

	QUnit.test( 'getStatusesByID(empty)', function ( assert ) {
		var
			subject,
			expected,
			api,
			mockAPI;

		api = { get: function () {} };
		mockAPI = this.sandbox.mock( api )
			.expects( 'get' )
			// No HTTP requests are issued.
			.never();

		subject = new WatchstarGateway( api );
		return subject.getStatusesByID( [] ).then( function ( actual ) {
			expected = {};
			assert.deepEqual( actual, expected, 'An empty result is returned.' );
			mockAPI.verify();
		} );
	} );

	QUnit.test( 'getStatusesByTitle(nonempty)', function ( assert ) {
		var
			subject,
			expected,
			api,
			mockAPI;

		api = { get: function () {} };
		mockAPI = this.sandbox.mock( api )
			.expects( 'get' )
			.once()
			// One HTTP request is issued.
			.returns( $.Deferred().resolve( GET_RESPONSE ) );

		subject = new WatchstarGateway( api );
		return subject.getStatusesByTitle( [
			'An unwatched page', 'An unwatched page'
		] ).then( function ( actual ) {
			expected = {
				'An unwatched page': false,
				'A watched page': true
			};
			assert.deepEqual( actual, expected, 'The correct result is returned.' );
			mockAPI.verify();
		} );
	} );

	QUnit.test( 'getStatusesByTitle(empty)', function ( assert ) {
		var
			subject,
			expected,
			api,
			mockAPI;

		api = { get: function () {} };
		mockAPI = this.sandbox.mock( api )
			.expects( 'get' )
			// No HTTP requests are issued.
			.never();

		subject = new WatchstarGateway( api );
		return subject.getStatusesByTitle( [] ).then( function ( actual ) {
			expected = {};
			assert.deepEqual( actual, expected, 'An empty result is returned.' );
			mockAPI.verify();
		} );
	} );

	QUnit.test( '_unmarshalGetResponse(nonempty)', function ( assert ) {
		var
			subject,
			actual,
			expected;

		subject = new WatchstarGateway( new mw.Api() );
		actual = subject._unmarshalGetResponse( GET_RESPONSE );
		expected = {
			'An unwatched page': false,
			'A watched page': true
		};
		assert.deepEqual(
			actual,
			expected,
			'GET API:Info nonempty responses are unmarshalled correctly.'
		);
	} );

	QUnit.test( '_unmarshalGetResponse(empty)', function ( assert ) {
		var
			subject,
			actual,
			expected;

		subject = new WatchstarGateway( new mw.Api() );
		actual = subject._unmarshalGetResponse( {} );
		expected = {};
		assert.deepEqual(
			actual,
			expected,
			'GET API:Info empty responses are unmarshalled correctly.'
		);
	} );
}( mw.mobileFrontend, jQuery ) );
