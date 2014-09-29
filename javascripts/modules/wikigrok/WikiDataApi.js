( function( M ) {
	var Api = M.require( 'api' ).Api, WikiDataApi;
	/**
	 * @class EditorApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: 'https://www.wikidata.org/w/api.php',
		useJsonp: true,

		initialize: function( options ) {
			this.subjectId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
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

}( mw.mobileFrontend ) );
