// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
( function ( M ) {
	var WikiGrokSuggestionApi,
		Api = M.require( 'api' ).Api;

	/**
	 * Gets suggestions, nationalities, occupations from the API
	 * @class WikiGrokSuggestionApi
	 * @extends Api
	 */
	WikiGrokSuggestionApi = Api.extend( {
		apiUrl: 'https://tools.wmflabs.org/wikigrok/api2.php',
		useJsonp: true,

		initialize: function ( options ) {
			this.subjectId = options.itemId;
			this.subject = options.subject;
			this.version = options.version;
			Api.prototype.initialize.apply( this, arguments );
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
					item: this.subjectId.replace( 'Q', '' )
				} ).then( function ( data ) {
					if ( key ) {
						if ( data[key] !== undefined ) {
							return data[key];
						} else {
							return [];
						}
					}
				} );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokSuggestionApi', WikiGrokSuggestionApi );

}( mw.mobileFrontend ) );
