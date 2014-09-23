( function( M ) {
	var Api = M.require( 'api' ).Api, WikiDataApi;
	/**
	 * @class EditorApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: 'https://www.wikidata.org/w/api.php',

		initialize: function( options ) {
			this.itemId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
		},
		ajax: function( data, options ) {
			options = options || {};
			options.url = this.apiUrl;
			options.dataType = 'jsonp';
			return Api.prototype.ajax.call( this, data, options );
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
