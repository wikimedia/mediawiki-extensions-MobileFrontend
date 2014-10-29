( function ( M, $ ) {
	var Api = M.require( 'api' ).Api, WikiDataApi;
	/**
	 * Gets claims and labels from the WikiData API
	 * @class WikiDataApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: 'https://www.wikidata.org/w/api.php',
		useJsonp: true,
		language: 'en',

		initialize: function ( options ) {
			this.subjectId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
		},
		getClaims: function () {
			var id = this.subjectId;
			return this.ajax( {
				action: 'wbgetentities',
				ids: id,
				props: 'claims',
				format: 'json'
			} ).then( function ( data ) {
				var instanceClaims, entityClaims,
					claims = {};
				// See if the page has any 'instance of' claims.
				if ( data.entities !== undefined && data.entities[id].claims.P31 !== undefined ) {
					entityClaims = data.entities[id].claims;
					instanceClaims = entityClaims.P31;

					// Examine claims closely
					$.each( instanceClaims, function ( i, claim ) {
						claims.isHuman = claim.mainsnak.datavalue.value['numeric-id'] === 5 ? true : false;
						claims.hasOccupation = entityClaims.P106 ? true : false;
						claims.hasCountryOfCitizenship = entityClaims.P27 ? true : false;
						claims.hasDateOfBirth = entityClaims.P569 ? true : false;
						claims.hasDateOfDeath = entityClaims.P570 ? true : false;
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
		 * @param {Array} itemIds for items in Wikidata
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		getLabels: function ( itemIds ) {
			var lang = this.language;
			return this.ajax( {
					action: 'wbgetentities',
					props: 'labels',
					languages: lang,
					ids: itemIds
				} ).then( function ( data ) {
					var map = {};
					$.each( itemIds, function ( i, itemId ) {
						if ( data.entities[itemId].labels[lang].value !== undefined ) {
							map[itemId] = data.entities[itemId].labels[lang].value;
						} else {
							map[itemId] = null;
						}
					} );
					return map;
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend, jQuery ) );
