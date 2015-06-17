( function ( M ) {
	var SearchApi = M.require( 'modules/search/SearchApi' ),
		SearchApiBeta;

	/**
	 * The Api renders pages with Wikidata descriptions
	 * @class SearchApiBeta
	 * @extends SearchApi
	 * @inheritdoc
	 */
	SearchApiBeta = SearchApi.extend( {
		/**
		 * In addition to the base data, we need to get Wikidata description for the page too
		 * @inheritdoc
		 */
		getApiData: function ( query ) {
			var data = SearchApi.prototype.getApiData.call( this, query );
			data.prop = data.prop + '|pageterms';
			data.wbptterms = 'description';
			return data;
		},

		/**
		 * Add wikidataDescription (if it exists) to the page data
		 * @inheritdoc
		 * @returns {Object} data needed to create a {Page}
		 * @private
		 */
		_getPageData: function ( query, info ) {
			var data = SearchApi.prototype._getPageData.call( this, query, info ),
				terms = info.terms;

			if ( terms && terms.description && terms.description.length ) {
				data.wikidataDescription = terms.description[0];
			}
			return data;
		}
	} );

	M.define( 'modules/search.beta/SearchApi', SearchApiBeta );

}( mw.mobileFrontend ) );
