( function( M, $ ) {
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
			var id = this.itemId;
			return this.ajax( {
				action: 'wbgetentities',
				ids: this.itemId,
				props: 'claims',
				format: 'json'
			} ).then( function( data ) {
				var instanceClaims,
					claims = {};
				// See if the page has any 'instance of' claims.
				if ( data.entities !== undefined && data.entities[id].claims.P31 !== undefined ) {
					instanceClaims = data.entities[id].claims.P31;

					// Examine claims closely
					$.each( instanceClaims, function( i, claim ) {
						claims.isHuman = claim.mainsnak.datavalue.value['numeric-id'] === 5 ? true : false;
						claims.hasOccupation = data.entities[id].claims.P106 ? true : false;
					} );
					return claims;
				} else {
					return false;
				}
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

}( mw.mobileFrontend, jQuery ) );
