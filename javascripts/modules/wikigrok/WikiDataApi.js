( function( M ) {
	var Api = M.require( 'api' ).Api, WikiDataApi;
	/**
	 * @class EditorApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: 'https://www.wikidata.org/w/api.php',
		useJsonp: true,

		initialize: function( options ) {
			this.itemId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
		},
		getClaims: function() {
			return this.ajax( {
				action: 'wbgetentities',
				ids: this.itemId,
				props: 'claims',
				format: 'json'
			} );
		},
		getOccupations: function( occupationId ) {
			return this.ajax( {
					action: 'wbgetentities',
					props: 'labels',
					ids: occupationId
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend ) );
