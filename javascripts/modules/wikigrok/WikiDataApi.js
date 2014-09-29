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
		/**
		 * Get labels for an item from Wikidata
		 * See: https://www.wikidata.org/wiki/Help:Label
		 *
		 * @param {int} itemId for item in Wikidata
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		getLabel: function( itemId ) {
			return this.ajax( {
					action: 'wbgetentities',
					props: 'labels',
					// FIXME: change this to a parameter
					languages: 'en',
					ids: itemId
				} ).then( function( data ) {
					if ( data.entities[itemId].labels.en.value !== undefined ) {
						return data.entities[itemId].labels.en.value;
					} else {
						return false;
					}
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend, jQuery ) );
