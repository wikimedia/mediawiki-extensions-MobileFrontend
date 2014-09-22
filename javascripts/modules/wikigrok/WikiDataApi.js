( function( M ) {
	var Api = M.require( 'api' ).Api, WikiDataApi;
	/**
	 * @class EditorApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: 'https://www.wikidata.org/w/api.php',

		initialize: function() {
			Api.prototype.initialize.apply( this, arguments );
		},
		getOccupations: function( occupationId ) {
			return this.ajax( {
					action: 'wbgetentities',
					props: 'labels',
					ids: occupationId
				},
				{
					url: this.apiUrl,
					dataType: 'jsonp'
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend ) );
