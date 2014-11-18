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

		// FIXME: remove filtering of redirects once the upstream bug has been fixed:
		// https://bugzilla.wikimedia.org/show_bug.cgi?id=73673
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
					redirects: '',
					list: 'prefixsearch',
					pssearch: query,
					pslimit: 15
				} ).then( function ( data ) {
					var results = [],
						pages = {},
						redirects = {},
						pageIds = [];

					if ( data.query ) {
						// get redirects into an easily searchable shape
						if ( data.query.redirects ) {
							$.each( data.query.redirects, function ( i, redirect ) {
								redirects[redirect.from] = redirect.to;
							} );
						}
						if ( data.query.pages && data.query.prefixsearch ) {
							// get results into an easily searchable shape
							$.each( data.query.pages, function ( i, result ) {
								pages[result.title] = result;
							} );

							// We loop through the prefixsearch results (rather than the pages
							// results) here in order to maintain the correct order.
							$.each( data.query.prefixsearch, function ( i, page ) {
								var info, title = page.title, id = page.pageid;

								// Is this a redirect? If yes, get the target.
								if ( redirects[title] ) {
									id = pages[redirects[title]].pageid;
								}

								if ( id && data.query.pages[id] ) {
									info = data.query.pages[id];
								}

								if ( info && $.inArray( id, pageIds ) === -1 ) {
									pageIds.push ( id );
									results.push( {
										id: info.id,
										heading: highlightSearchTerm( info.title, query ),
										title: info.title,
										url: mw.util.getUrl( info.title ),
										thumbnail: info.thumbnail
									} );
								}
							} );
						}
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
