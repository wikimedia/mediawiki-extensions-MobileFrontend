/**
 * API for search
 * @extends Api
 * @class SearchApi
 */
( function ( M, $ ) {

	var SearchApi,
		Api = M.require( 'api' ).Api;

	/**
	 * Escapes regular expression wildcards (metacharacters) by adding a \\ prefix
	 * @param {String} str a string
	 * @return {String} a regular expression that can be used to search for that str
	 */
	function createSearchRegEx( str ) {
		str = str.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&' );
		return new RegExp( '^(' + str + ')', 'ig' );
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

		return label.replace( createSearchRegEx( term ), '<strong>$1</strong>' );
	}

	/**
	 * @class SearchApi
	 * @extends Api
	 */
	SearchApi = Api.extend( {
		initialize: function () {
			Api.prototype.initialize.apply( this, arguments );
			this.searchCache = {};
		},

		search: function ( query ) {
			if ( !this.searchCache[query] ) {
				this.searchCache[query] = this.get( {
					action: 'query',
					generator: 'prefixsearch',
					gpssearch: query,
					gpsnamespace: 0,
					gpslimit: 15,
					prop: 'pageimages',
					piprop: 'thumbnail',
					pithumbsize: mw.config.get( 'wgMFThumbnailSizes' ).tiny,
					pilimit: 15,
					list: 'prefixsearch',
					pssearch: query,
					pslimit: 15
				} ).then( function ( data ) {
					var results = [],
						info = {};

					if ( data.query && data.query.pages && data.query.prefixsearch ) {
						// We loop through the prefixsearch results (rather than the pages
						// results) here in order to maintain the correct order.
						$.each( data.query.prefixsearch, function ( i, page ) {
							var title = page.title;
							if ( page.pageid && data.query.pages[page.pageid] ) {
								info = data.query.pages[page.pageid];
							}
							results.push( {
								id: page.pageid,
								heading: highlightSearchTerm( title, query ),
								title: title,
								url: mw.util.getUrl( title ),
								thumbnail: info.thumbnail
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

		isCached: function ( query ) {
			return !!this.searchCache[query];
		}
	} );

	// for tests
	SearchApi._highlightSearchTerm = highlightSearchTerm;

	M.define( 'modules/search/SearchApi', SearchApi );

}( mw.mobileFrontend, jQuery ) );
