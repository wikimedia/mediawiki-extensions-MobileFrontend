( function( M ) {
	var Api = M.require( 'api' ).Api, WikiGrokApi;
	/**
	 * @class EditorApi
	 * @extends Api
	 */
	WikiGrokApi = Api.extend( {
		apiUrl: 'https://tools.wmflabs.org/wikigrok/api.php',

		initialize: function() {
			Api.prototype.initialize.apply( this, arguments );
		},
		getPossibleOccupations: function( itemId ) {
			return this.ajax( {
					action: 'get_potential_occupations',
					// Strip the Q out of the Wikibase item ID
					item: itemId.replace( 'Q' , '' )
				},
				{
					url: this.apiUrl,
					dataType: 'jsonp'
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokApi', WikiGrokApi );

}( mw.mobileFrontend ) );
