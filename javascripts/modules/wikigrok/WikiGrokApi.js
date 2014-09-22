( function( M ) {
	var Api = M.require( 'api' ).Api, WikiGrokApi;
	/**
	 * @class EditorApi
	 * @extends Api
	 */
	WikiGrokApi = Api.extend( {
		apiUrl: 'https://tools.wmflabs.org/wikigrok/api.php',
		useJsonp: true,

		initialize: function( options ) {
			this.subjectId = options.itemId;
			this.subject = options.subject;
			Api.prototype.initialize.apply( this, arguments );
		},
		recordOccupation: function( occupationId, occupation, claimIsCorrect ) {
			return this.ajax( {
					action: 'record_answer',
					subject_id: this.subjectId,
					subject: this.subject,
					occupation_id: occupationId,
					occupation: occupation,
					page_name: mw.config.get( 'wgPageName' ),
					correct: claimIsCorrect,
					user_id: mw.user.getId(),
					source: 'mobile A'
				} );
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
