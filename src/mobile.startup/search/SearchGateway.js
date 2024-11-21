/**
 * Internal for use inside Minerva only. See {@link module:mobile.startup} for access.
 *
 * @module module:mobile.startup/search
 */
const
	pageJSONParser = require( '../page/pageJSONParser' ),
	util = require( '../util' ),
	extendSearchParams = require( '../extendSearchParams' );

/**
 * Interact with MediaWiki search API.
 *
 * @memberof module:mobile.startup/search
 * @uses mw.Api
 * @param {mw.Api} api
 */
class SearchGateway {
	/**
	 * @param {mw.Api} api
	 */
	constructor( api ) {
		this.api = api;
		this.searchCache = {};
		this.generator = mw.config.get( 'wgMFSearchGenerator' );
		/**
		 * The namespace to search in.
		 *
		 * @type {number}
		 */
		this.searchNamespace = 0;
	}

	/**
	 * Get the data used to do the search query api call.
	 *
	 * @param {string} query to search for
	 * @return {Object}
	 */
	getApiData( query ) {
		const prefix = this.generator.prefix,
			data = extendSearchParams( 'search', {
				generator: this.generator.name
			} );

		data.redirects = '';

		data['g' + prefix + 'search'] = query;
		data['g' + prefix + 'namespace'] = this.searchNamespace;
		data['g' + prefix + 'limit'] = 15;

		// If PageImages is being used configure further.
		if ( data.pilimit ) {
			data.pilimit = 15;
			data.pithumbsize = mw.config.get( 'wgMFThumbnailSizes' ).tiny;
		}
		return data;
	}

	/**
	 * Escapes regular expression wildcards (metacharacters) by adding a \\ prefix
	 *
	 * @param {string} str a string
	 * @return {Object} a regular expression that can be used to search for that str
	 * @private
	 */
	_createSearchRegEx( str ) {
		// '\[' can be unescaped, but leave it balanced with '`]'
		// eslint-disable-next-line no-useless-escape
		str = str.replace( /[-\[\]{}()*+?.,\\^$|#\s]/g, '\\$&' );
		return new RegExp( '^(' + str + ')', 'ig' );
	}

	/**
	 * Takes a label potentially beginning with term
	 * and highlights term if it is present with strong
	 *
	 * @param {string} label a piece of text
	 * @param {string} term a string to search for from the start
	 * @return {string} safe html string with matched terms encapsulated in strong tags
	 * @private
	 */
	_highlightSearchTerm( label, term ) {
		label = util.parseHTML( '<span>' ).text( label ).html();
		term = term.trim();
		term = util.parseHTML( '<span>' ).text( term ).html();

		return label.replace( this._createSearchRegEx( term ), '<strong>$1</strong>' );
	}

	/**
	 * Return data used for creating {Page} objects
	 *
	 * @param {string} query to search for
	 * @param {Object} pageInfo from the API
	 * @return {Object} data needed to create a {Page}
	 * @private
	 */
	_getPage( query, pageInfo ) {
		const page = pageJSONParser.parse( pageInfo );

		// If displaytext is set in the generator result (eg. by Wikibase),
		// use that as display title.
		// Otherwise default to the page's title.
		// FIXME: Given that displayTitle could have html in it be safe and just highlight text.
		// Note that highlightSearchTerm does full HTML escaping before highlighting.
		page.displayTitle = this._highlightSearchTerm(
			pageInfo.displaytext ? pageInfo.displaytext : page.title,
			query
		);
		page.index = pageInfo.index;

		return page;
	}

	/**
	 * Process the data returned by the api call.
	 *
	 * @param {string} query to search for
	 * @param {Object} data from api
	 * @return {Array}
	 * @private
	 */
	_processData( query, data ) {
		let results = [];

		if ( data.query ) {

			results = data.query.pages || {};
			results = Object.keys( results ).map( ( id ) => this._getPage( query, results[id] ) );
			// sort in order of index
			results.sort( ( a, b ) => a.index - b.index );
		}

		return results;
	}

	/**
	 * Perform a search for the given query.
	 *
	 * @param {string} query to search for
	 * @return {jQuery.Deferred}
	 */
	search( query ) {
		const scriptPath = mw.config.get( 'wgMFScriptPath' );

		if ( !this.isCached( query ) ) {
			const xhr = this.api.get( this.getApiData( query ), scriptPath ? {
				url: scriptPath
			} : undefined );
			const request = xhr
				.then(
					// resolve the Deferred object
					( data, jqXHR ) => ( {
						query,
						results: this._processData( query, data ),
						searchId: jqXHR && jqXHR.getResponseHeader( 'x-search-id' )
					} ),
					() => {
						// reset cached result, it maybe contains no value
						this.searchCache[query] = undefined;
					}
				);

			// cache the result to prevent the execution of one search query twice
			// in one session
			this.searchCache[query] = request.promise( {
				abort() {
					xhr.abort();
				}
			} );
		}

		return this.searchCache[query];
	}

	/**
	 * Check if the search has already been performed in given session.
	 *
	 * @param {string} query
	 * @return {boolean}
	 */
	isCached( query ) {
		return Boolean( this.searchCache[query] );
	}
}

module.exports = SearchGateway;
