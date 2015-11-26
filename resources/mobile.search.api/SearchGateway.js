( function ( M, $ ) {
	var Page = M.require( 'mobile.startup/Page' );

	/**
	 * @class SearchGateway
	 * @uses mw.Api
	 * @param {mw.Api} api
	 */
	function SearchGateway( api ) {
		this.api = api;
		this.searchCache = {};
		this.generator = mw.config.get( 'wgMFSearchGenerator' );
	}

	SearchGateway.prototype = {
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
			var prefix = this.generator.prefix,
				data = $.extend( {
					generator: this.generator.name,
					prop: mw.config.get( 'wgMFQueryPropModules' ),
					redirects: '',
					list: this.generator.name
				}, mw.config.get( 'wgMFSearchAPIParams' ) );

			data['g' + prefix + 'search'] = query;
			data['g' + prefix + 'namespace'] = this.searchNamespace;
			data['g' + prefix + 'limit'] = 15;
			data[prefix + 'search'] = query;
			data[prefix + 'limit'] = 15;

			// If PageImages is being used configure further.
			if ( data.pilimit ) {
				data.pilimit = 15;
				data.pithumbsize = mw.config.get( 'wgMFThumbnailSizes' ).tiny;
			}
			return data;
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
		_getPage: function ( query, info ) {
			var page = Page.newFromJSON( info );
			// Highlight the search term
			// FIXME: Given that displayTitle could have html in it be safe and just highlight text.
			page.displayTitle = this._highlightSearchTerm( page.title, query );
			return page;
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
				if ( data.query[this.generator.name] ) {
					// some queries (like CategoryGateway) only have search
					if ( data.query.pages ) {
						// get results into an easily searchable shape
						$.each( data.query.pages, function ( i, result ) {
							pages[result.title] = result;
						} );
					}

					// We loop through the search results (rather than the pages
					// results) here in order to maintain the correct order.
					$.each( data.query[this.generator.name], function ( i, page ) {
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
								results.push( self._getPage( query, info ) );
							} else {
								mwTitle = mw.Title.newFromText( page.title, self._searchNamespace );

								results.push( new Page( {
									id: page.pageid,
									heading: self._highlightSearchTerm( page.title, query ),
									title: page.title,
									displayTitle: $( '<span>' ).text( mwTitle.getNameText() ).html(),
									url: mwTitle.getUrl()
								} ) );
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
				request = this.api.get( this.getApiData( query ) )
					.done( function ( data ) {
						// resolve the Deferred object
						result.resolve( {
							query: query,
							results: self._processData( query, data )
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
	};

	M.define( 'mobile.search.api/SearchGateway', SearchGateway );

}( mw.mobileFrontend, jQuery ) );
