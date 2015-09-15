( function ( $, M ) {

	var WatchListGateway = M.require( 'mobile.watchlist/WatchListGateway' ),
		response = {
			continue: {
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
					},
					'-1': {
						ns: 0,
						title: 'zzzz',
						missing: true,
						contentmodel: 'wikitext',
						pagelanguage: 'en'
					}
				}
			}
		};

	QUnit.module( 'MobileFrontend: WatchListGateway', {} );

	QUnit.test( 'load results from the first page', 3, function ( assert ) {
		var gateway = new WatchListGateway( new mw.Api() );

		this.sandbox.stub( mw.Api.prototype, 'get' )
			.returns( $.Deferred().resolve( response ) );

		gateway.loadWatchlist().done( function ( pages ) {
			var params = mw.Api.prototype.get.firstCall.args[0];

			assert.strictEqual( params.continue, '', 'It should set the continue parameter' );

			assert.equal( pages.length, 7, 'Got all the results' );
			assert.equal( pages[0].displayTitle, 'Albert Einstein', 'Sorted alphabetically' );
		} );
	} );

	QUnit.test( 'load results from the second page from last item of first', 6, function ( assert ) {
		var lastTitle = 'Albert Einstein',
			gateway = new WatchListGateway( new mw.Api(), lastTitle ),
			response1 = $.extend( {}, response, {
				'continue': {
					watchlistraw: {
						gwrcontinue: '0|Albert Einstein'
					}
				}
			} ),
			stub;

		// First time we call the API for the second page
		stub = this.sandbox.stub( mw.Api.prototype, 'get' )
			.returns( $.Deferred().resolve( response1 ) );

		gateway.loadWatchlist().done( function ( pages ) {
			var params = mw.Api.prototype.get.firstCall.args[0];

			assert.strictEqual( params.continue, 'gwrcontinue||', 'It should set the continue parameter' );
			assert.strictEqual( params.gwrcontinue, '0|Albert_Einstein', 'It should set the watchlistraw-specific continue parameter' );

			// Albert Einstein should not be in the results since it was the last
			// item in the first page.
			assert.equal( pages.length, 6, 'Should have Albert removed from the results' );
			assert.equal( pages[0].displayTitle, 'Anne Dallas Dudley', 'First item should be Anne' );

			// Let's call for the next page
			stub.returns( $.Deferred().resolve( response ) );

			gateway.loadWatchlist().done( function ( pages ) {
				// Albert Einstein should be the first result of the next page (not removed)
				assert.equal( pages.length, 7, 'Albert should be in the results' );
				assert.equal( pages[0].displayTitle, 'Albert Einstein', 'First item should be Albert' );
			} );
		} );
	} );

	QUnit.test( 'it doesn\'t throw an error when no pages are returned', 1, function ( assert ) {
		var gateway = new WatchListGateway( new mw.Api() );

		this.sandbox.stub( mw.Api.prototype, 'get' )
			.returns( $.Deferred().resolve( {
				batchcomplete: ''
			} ) );

		gateway.loadWatchlist().done( function ( pages ) {
			assert.deepEqual( pages, [] );
		} );
	} );

	QUnit.test( 'it should mark pages as new if necessary', 2, function ( assert ) {
		var gateway = new WatchListGateway( new mw.Api() );

		this.sandbox.stub( mw.Api.prototype, 'get' )
			.returns( $.Deferred().resolve( response ) );

		gateway.loadWatchlist().done( function ( pages ) {
			assert.equal( pages[0].isMissing, false, 'Albert Einstein page isn\'t marked as new' );
			assert.equal( pages[6].isMissing, true, 'zzzz page is marked as new' );
		} );
	} );

}( jQuery, mw.mobileFrontend ) );
