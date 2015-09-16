/**
 * API for search
 * @extends Api
 * @class SearchApi
 */
( function ( M, $ ) {

	var SearchApi,
		Page = M.require( 'Page' ),
		Api = M.require( 'api' ).Api;

	/**
	 * @class SearchApi
	 * @extends Api
	 */
	SearchApi = Api.extend( {
		/** @inheritdoc */
		initialize: function () {
			Api.prototype.initialize.apply( this, arguments );
			this.searchCache = {};
		},

		/**
		 * The namespace to search in.
		 * @type {Number}
		 */
		searchNamespace: 0,

		/**
		 * Get the data used to do the search query api call.
		 * @method
		 * @param {String} query to search for
		 * @return {Object}
		 */
		getApiData: function ( query ) {
			return {
				action: 'query',
				generator: 'prefixsearch',
				gpssearch: query,
				gpsnamespace: this.searchNamespace,
				gpslimit: 15,
				prop: 'pageimages',
				piprop: 'thumbnail',
				pithumbsize: mw.config.get( 'wgMFThumbnailSizes' ).tiny,
				pilimit: 15,
				redirects: '',
				list: 'prefixsearch',
				pssearch: query,
				pslimit: 15
			};
		},

		/**
		 * Escapes regular expression wildcards (metacharacters) by adding a \\ prefix
		 * @param {String} str a string
		 * @return {Object} a regular expression that can be used to search for that str
		 * @private
		 */
		_createSearchRegEx: function ( str ) {
			str = str.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&' );
			return new RegExp( '^(' + str + ')', 'ig' );
		},

		/**
		 * Takes a label potentially beginning with term
		 * and highlights term if it is present with strong
		 * @param {String} label a piece of text
		 * @param {String} term a string to search for from the start
		 * @return {String} safe html string with matched terms encapsulated in strong tags
		 * @private
		 */
		_highlightSearchTerm: function ( label, term ) {
			label = $( '<span>' ).text( label ).html();
			term = $( '<span>' ).text( term ).html();

			return label.replace( this._createSearchRegEx( term ), '<strong>$1</strong>' );
		},

		/**
		 * Return data used for creating {Page} objects
		 * @param {String} query to search for
		 * @param {Object} info page info from the API
		 * @return {Object} data needed to create a {Page}
		 * @private
		 */
		_getPageData: function ( query, info ) {
			return {
				id: info.pageid,
				displayTitle: this._highlightSearchTerm( info.displayTitle || info.title, query ),
				title: info.title,
				url: mw.util.getUrl( info.title ),
				thumbnail: info.thumbnail
			};
		},

		/**
		 * Process the data returned by the api call.
		 * FIXME: remove filtering of redirects once the upstream bug has been fixed:
		 * https://bugzilla.wikimedia.org/show_bug.cgi?id=73673
		 * @param {String} query to search for
		 * @param {Object} data from api
		 * @return {Array}
		 * @private
		 */
		_processData: function ( query, data ) {
			var self = this,
				results = [],
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
				if ( data.query.prefixsearch ) {
					// some queryies (like CategoryApi) only have prefixsearch
					if ( data.query.pages ) {
						// get results into an easily searchable shape
						$.each( data.query.pages, function ( i, result ) {
							pages[result.title] = result;
						} );
					}

					// We loop through the prefixsearch results (rather than the pages
					// results) here in order to maintain the correct order.
					$.each( data.query.prefixsearch, function ( i, page ) {
						var info, title = page.title,
							id = page.pageid,
							mwTitle;

						// Is this a redirect? If yes, get the target.
						if ( redirects[title] ) {
							id = pages[redirects[title]].pageid;
						}

						if ( id && data.query.pages && data.query.pages[id] ) {
							info = data.query.pages[id];
						}

						if ( $.inArray( id, pageIds ) === -1 ) {
							if ( info ) {
								// return all possible page data
								pageIds.push( id );
								results.push( self._getPageData( query, info ) );
							} else {
								mwTitle = mw.Title.newFromText( page.title, self._searchNamespace );

								results.push( {
									id: page.pageid,
									heading: self._highlightSearchTerm( page.title, query ),
									title: page.title,
									displayTitle: mwTitle.getNameText(),
									url: mwTitle.getUrl()
								} );
							}
						}
					} );
				}
			}

			return results;
		},

		/**
		 * Perform a search for the given query.
		 * @method
		 * @param {String} query to search for
		 * @return {jQuery.Deferred}
		 */
		search: function ( query ) {
			var result = $.Deferred(),
				request,
				self = this;

			if ( !this.isCached( query ) ) {
				request = this.get( this.getApiData( query ) )
					.done( function ( data ) {
						// resolve the Deferred object
						result.resolve( {
							query: query,
							results: $.map( self._processData( query, data ), function ( item ) {
								return new Page( item );
							} )
						} );
					} )
					.fail( function () {
						// reset cached result, it maybe contains no value
						self.searchCache[query] = undefined;
						// reject
						result.reject();
					} );

				// cache the result to prevent the execution of one search query twice in one session
				this.searchCache[query] = result.promise( {
					abort: request.abort
				} );
			}

			return this.searchCache[query];
		},

		/**
		 * Check if the search has already been performed in given session.
		 * @method
		 * @param {String} query
		 * @return {Boolean}
		 */
		isCached: function ( query ) {
			return Boolean( this.searchCache[ query ] );
		}
	} );

	M.define( 'modules/search/SearchApi', SearchApi );

}( mw.mobileFrontend, jQuery ) );
