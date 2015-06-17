( function ( $, M ) {

	var SearchOverlay = M.require( 'modules/search/SearchOverlay' );

	QUnit.module( 'MobileFrontend SearchOverlay', {
	} );

	QUnit.asyncTest( 'Wikidata Description in search results', 3, function ( assert ) {
		var self = this,
			deferred = $.Deferred(),
			data = {
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
			},
			SearchApi,
			searchOverlay;

		mw.loader.using( 'mobile.search.beta' ).done( function () {
			SearchApi = M.require( 'modules/search.beta/SearchApi' );
			self.stub( SearchApi.prototype, 'get' ).returns( deferred.promise() );
			deferred.resolve( data );
			searchOverlay = new SearchOverlay( {
				api: new SearchApi()
			} );
			searchOverlay.$el.find( 'input' ).val( 'brad' );
			M.on( 'search-results', function () {
				var $pageSummaries = searchOverlay.$el.find( '.page-summary' );

				QUnit.start();
				assert.equal(
					$pageSummaries.eq( 0 ).find( '.wikidata-description' ).length,
					0,
					'Braddy does not have a Wikidata description.'
				);
				assert.equal(
					$pageSummaries.eq( 1 ).find( '.wikidata-description' ).text(),
					'American actor',
					'Yes, Brad Pitt is an actor.'
				);
				assert.equal(
					$pageSummaries.eq( 2 ).find( '.wikidata-description' ).text(),
					'American actor and film producer',
					'Yes, Cooper is an actor.'
				);
			} );
			searchOverlay.performSearch();
		} );

	} );

}( jQuery, mw.mobileFrontend ) );
