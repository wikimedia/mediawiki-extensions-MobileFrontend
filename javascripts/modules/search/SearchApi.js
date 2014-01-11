( function( M, $ ) {

	var Api = M.require( 'api' ).Api, SearchApi;

	/**
	 * Escapes regular expression wildcards (metacharacters) by adding a \\ prefix
	 * @param {String} str a string
	 * @return {String} a regular expression that can be used to search for that str
	 */
	function createSearchRegEx( str ) {
		str = str.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&' );
		return new RegExp( '^(' + str + ')' , 'ig' );
	}

	/**
	 * Takes a label potentially beginning with term
	 * and highlights term if it is present with strong
	 *
	 * @param {String} label a piece of text
	 * @param {String} term a string to search for from the start
	 * @return {String} safe html string with matched terms encapsulated in strong tags
	 */
	function highlightSearchTerm( label, term ) {
		label = $( '<span>' ).text( label ).html();
		term = $( '<span>' ).text( term ).html();

		return label.replace( createSearchRegEx( term ),'<strong>$1</strong>' );
	}

	SearchApi = Api.extend( {
		initialize: function() {
			this._super();
			this.searchCache = {};
		},

		search: function( query ) {
			if ( !this.searchCache[query] ) {
				this.searchCache[query] = this.get( {
					search: query,
					action: 'opensearch',
					namespace: 0,
					limit: 15
				} ).then( function( data ) {
					return {
						query: data[0],
						results: $.map( data[1], function( title ) {
							return {
								heading: highlightSearchTerm( title, query ),
								title: title,
								url: mw.util.getUrl( title )
							};
						} )
					};
				} );
			}

			return this.searchCache[query];
		},

		isCached: function( query ) {
			return !!this.searchCache[query];
		}
	} );

	// for tests
	SearchApi._highlightSearchTerm = highlightSearchTerm;

	M.define( 'modules/search/SearchApi', SearchApi );

}( mw.mobileFrontend, jQuery ));
