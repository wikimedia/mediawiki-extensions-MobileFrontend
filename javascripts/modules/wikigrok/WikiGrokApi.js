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
			this.itemId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
		},
		recordOccupation: function( subject, occupationId, occupation, claimIsCorrect ) {
			return this.ajax( {
					action: 'record_answer',
					subject_id: this.itemId,
					subject: subject,
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
					item: this.itemId.replace( 'Q' , '' )
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokApi', WikiGrokApi );

}( mw.mobileFrontend ) );
