( function ( $, M ) {

	var SearchApi = M.require( 'modules/search.beta/SearchApi' );

	QUnit.module( 'MobileFrontend SearchApi', {
		setup: function () {
			var data = {
				query: {
					pages: {
						2: {
							pageid: 2,
							ns: 0,
							title: 'Brad Pitt',
							index: 2,
							terms: {
								description: [ 'American actor' ]
							}
						},
						4: {
							pageid: 4,
							ns: 0,
							title: 'Bradley Cooper',
							index: 3,
							terms: {
								description: [ 'American actor and film producer' ]
							}
						},
						5: {
							pageid: 5,
							ns: 0,
							title: 'Braddy',
							index: 1
						}
					},
					prefixsearch: [
						{
							ns: 0,
							title: 'Braddy',
							pageid: 5
						},
						{
							ns: 0,
							title: 'Brad Pitt',
							pageid: 2
						},
						{
							ns: 0,
							title: 'Bradley Cooper',
							pageid: 4
						}
					]
				}
			};
			this.stub( SearchApi.prototype, 'get' ).returns( $.Deferred().resolve( data ) );
		}
	} );

	QUnit.asyncTest( 'Wikidata Description in search results', 3, function ( assert ) {
		var searchApi = new SearchApi();
		searchApi.search( 'brad' ).done( function ( resp ) {
			var results = resp.results;
			QUnit.start();
			assert.ok(
				results[0].wikidataDescription === undefined,
				'Braddy does not have a Wikidata description.'
			);
			assert.equal(
				results[1].wikidataDescription,
				'American actor',
				'Yes, Brad Pitt is an actor.'
			);
			assert.equal(
				results[2].wikidataDescription,
				'American actor and film producer',
				'Yes, Cooper is an actor.'
			);
		} );

	} );

}( jQuery, mw.mobileFrontend ) );
