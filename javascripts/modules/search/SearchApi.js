/**
 * @extends Api
 * @class SearchApi
 */
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
					action: 'query',
					generator: 'prefixsearch',
					gpssearch: query,
					gpsnamespace: 0,
					gpslimit: 15,
					prop: 'pageimages',
					piprop: 'thumbnail',
					pithumbsize: 80,
					pilimit: 15
				} ).then( function( data ) {
					var results = [];
					if ( data.query && data.query.pages ) {
						$.each( data.query.pages, function( i, page ) {
							var title = page.title;
							results.push( {
								id: page.pageid,
								heading: highlightSearchTerm( title, query ),
								title: title,
								url: mw.util.getUrl( title ),
								thumbnail: page.thumbnail
							} );
						} );
					}
					return {
						query: query,
						results: results
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
