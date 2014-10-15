( function( M ) {
	var Api = M.require( 'api' ).Api, WikiGrokApi;
	/**
	 * @class WikiGrokApi
	 * @extends Api
	 */
	WikiGrokApi = Api.extend( {
		apiUrl: 'https://tools.wmflabs.org/wikigrok/api2.php',
		useJsonp: true,

		initialize: function( options ) {
			this.subjectId = options.itemId;
			this.subject = options.subject;
			this.version = options.version;
			Api.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Saves claims to the wikigrok api server
		 * @method
		 * @param {array} claims a list of claims. Each claim must have correct, prop, propid, value and valueid set
		 * @return {jQuery.Deferred}
		 */
		recordClaims: function( claims ) {
			return this.ajax( {
					action: 'record_answer',
					subject_id: this.subjectId,
					subject: this.subject,
					claims: JSON.stringify( claims ),
					page_name: mw.config.get( 'wgPageName' ),
					user_id: mw.user.getId(),
					source: 'mobile ' + this.version
				} );
		},
		recordOccupation: function( occupationId, occupation, claimIsCorrect ) {
			var claim = {
				correct: claimIsCorrect,
				prop: 'occupation',
				propid: 'P106',
				value: occupation,
				valueid: occupationId
			};

			return this.recordClaims( [ claim ] );
		},
		getPossibleOccupations: function() {
			return this.ajax( {
					action: 'get_potential_occupations',
					// Strip the Q out of the Wikibase item ID
					item: this.subjectId.replace( 'Q' , '' )
				} ).then( function( data ) {
					if ( data.occupations !== undefined && data.occupations ) {
						return data.occupations.split( ',' ).map( function( item ) {
							return 'Q' + item;
						} );
					} else {
						return [];
					}
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokApi', WikiGrokApi );

}( mw.mobileFrontend ) );
