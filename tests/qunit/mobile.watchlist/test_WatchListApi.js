( function ( $, M ) {

	var WatchListApi = M.require( 'modules/watchlist/WatchListApi' ),
		response = {
			'query-continue': {
				pageimages: {
					picontinue: 9
				}
			},
			warnings: {
				query: {
					'*': 'Formatting of continuation data will be changing soon. To continue using the current formatting, use the \'rawcontinue\' parameter. To begin using the new format, pass an empty string for \'continue\' in the initial query.'
				}
			},
			query: {
				pages: {
					2: {
						pageid: 2,
						ns: 0,
						title: 'Burrito',
						contentmodel: 'wikitext',
						pagelanguage: 'en',
						touched: '2014-12-17T10:06:49Z',
						lastrevid: 552,
						length: 33534
					},
					3: {
						pageid: 3,
						ns: 0,
						title: 'Albert Einstein',
						contentmodel: 'wikitext',
						pagelanguage: 'en',
						touched: '2014-12-16T17:33:22Z',
						lastrevid: 4,
						length: 19
					},
					9: {
						pageid: 9,
						ns: 0,
						title: 'Anne Dallas Dudley',
						contentmodel: 'wikitext',
						pagelanguage: 'en',
						touched: '2014-12-17T10:00:13Z',
						lastrevid: 18,
						length: 12663
					},
					10: {
						pageid: 10,
						ns: 0,
						title: 'San Francisco',
						contentmodel: 'wikitext',
						pagelanguage: 'en',
						touched: '2014-12-17T10:04:55Z',
						lastrevid: 546,
						length: 373791
					},
					708: {
						pageid: 708,
						ns: 0,
						title: 'Functional logic programming',
						contentmodel: 'wikitext',
						pagelanguage: 'en',
						touched: '2015-01-12T13:04:23Z',
						lastrevid: 1307,
						length: 1392,
						new: ''
					},
					720: {
						pageid: 720,
						ns: 0,
						title: 'Functional programming',
						contentmodel: 'wikitext',
						pagelanguage: 'en',
						touched: '2015-01-12T13:04:35Z',
						lastrevid: 1319,
						length: 54839,
						new: ''
					}
				}
			}
		};

	QUnit.module( 'MobileFrontend: WatchListApi', {} );

	// this.sandbox.stub( WatchListApi.prototype, 'get' ).returns( $.Deferred().resolve() );

	QUnit.asyncTest( 'load results from the first page', 2, function ( assert ) {
		this.sandbox.stub( WatchListApi.prototype, 'get' )
			.returns( $.Deferred().resolve( response ) );

		var api = new WatchListApi();

		api.load().done( function ( pages ) {
			assert.equal( pages.length, 6, 'Got all the results' );
			assert.equal( pages[0].title, 'Albert Einstein', 'Sorted alphabetically' );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'load results from the second page from last item of first', 4, function ( assert ) {
		var lastTitle = 'Albert Einstein',
			api = new WatchListApi( lastTitle ),
			response1 = $.extend( {}, response, {
				'query-continue': {
					watchlistraw: {
						gwrcontinue: '0|Albert Einstein'
					}
				}
			} ),
			stub;

		// First time we call the API for the second page
		stub = this.sandbox.stub( WatchListApi.prototype, 'get' )
			.returns( $.Deferred().resolve( response1 ) );

		api.load().done( function ( pages ) {
			// Albert Einstein should not be in the results since it was the last
			// item in the first page.
			assert.equal( pages.length, 5, 'Should have Albert removed from the results' );
			assert.equal( pages[0].title, 'Anne Dallas Dudley', 'First item should be Anne' );

			// Let's call for the next page
			stub.returns( $.Deferred().resolve( response ) );

			api.load().done( function ( pages ) {
				// Albert Einstein should be the first result of the next page (not removed)
				assert.equal( pages.length, 6, 'Albert should be in the results' );
				assert.equal( pages[0].title, 'Albert Einstein', 'First item should be Albert' );
				QUnit.start();
			} );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
