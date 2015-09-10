( function ( M ) {
	var SearchGateway = M.require( 'mobile.search.api/SearchGateway' );

	/**
	 * The Api renders pages with Wikidata descriptions
	 * @class SearchGatewayBeta
	 * @extends SearchGateway
	 * @inheritdoc
	 */
	function SearchGatewayBeta() {
		SearchGatewayBeta.parent.apply( this, arguments );
	}
	OO.inheritClass( SearchGatewayBeta, SearchGateway );
	/**
	 * In addition to the base data, we need to get Wikidata description for the page too
	 * @inheritdoc
	 */
	SearchGatewayBeta.prototype.getApiData = function ( query ) {
		var data = SearchGateway.prototype.getApiData.call( this, query );
		data.prop = data.prop + '|pageterms';
		data.wbptterms = 'description';
		return data;
	};

	/**
	 * Add wikidataDescription (if it exists) to the page data
	 * @inheritdoc
	 * @returns {Object} data needed to create a {Page}
	 * @private
	 */
	SearchGatewayBeta.prototype._getPageData = function ( query, info ) {
		var data = SearchGateway.prototype._getPageData.call( this, query, info ),
			terms = info.terms;

		if ( terms && terms.description && terms.description.length ) {
			data.wikidataDescription = terms.description[0];
		}
		return data;
	};

	M.define( 'mobile.search.beta.api/SearchGateway', SearchGatewayBeta );

}( mw.mobileFrontend ) );
