// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
( function ( M ) {
	var Api = M.require( 'api' ).Api, WikiGrokApi;
	/**
	 * @class WikiGrokApi
	 * @extends Api
	 */
	WikiGrokApi = Api.extend( {
		apiUrl: 'https://tools.wmflabs.org/wikigrok/api2.php',
		useJsonp: true,

		initialize: function ( options ) {
			this.subjectId = options.itemId;
			this.subject = options.subject;
			this.version = options.version;
			Api.prototype.initialize.apply( this, arguments );
		},
		/**
		 * Saves claims to the wikigrok api server
		 * @method
		 * @param {Array} claims a list of claims. Each claim must have correct, prop, propid, value and valueid set
		 * @return {jQuery.Deferred}
		 */
		recordClaims: function ( claims ) {
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
		recordOccupation: function ( occupationId, occupation, claimIsCorrect ) {
			var claim = {
				correct: claimIsCorrect,
				prop: 'occupation',
				propid: 'P106',
				value: occupation,
				valueid: occupationId
			};

			return this.recordClaims( [ claim ] );
		},
		/**
		 * Get suggestions for the current person.
		 * Currently 50% of time returns occupations, 50% of time nationalities
		 * FIXME: In future it should look for both.
		 * @method
		 * @return {jQuery.Deferred} where parameter is a set of key value pairs
		 */
		getSuggestions: function () {
			return this.action( 'get_suggestions', 'suggestions' );
		},
		/**
		 * Performs an api action on wikigrok
		 * @method
		 * @param {string} action A valid action as documented on https://github.com/kaldari/WikiGrokAPI/blob/master/README.md
		 * @param {string} key of data to return
		 * @return {jQuery.Deferred} where parameter of callback is a list of wikidata ids;
		 */
		action: function ( action, key ) {
			return this.ajax( {
					action: action,
					item: this.subjectId.replace( 'Q' , '' )
				} ).then( function ( data ) {
					if ( key ) {
						if ( data[key] !== undefined ) {
							return data[key];
						} else {
							return [];
						}
					}
				} );
		},
		getPossibleNationalities: function () {
			return this.action( 'get_potential_nationality', 'nationality' );
		},
		getPossibleOccupations: function () {
			return this.action( 'get_potential_occupations', 'occupations' );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokApi', WikiGrokApi );

}( mw.mobileFrontend ) );
