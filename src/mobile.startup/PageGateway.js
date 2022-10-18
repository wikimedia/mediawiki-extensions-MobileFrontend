var util = require( './util.js' ),
	actionParams = require( './actionParams' ),
	cache = {};

/**
 * API for providing Page data
 *
 * @class PageGateway
 * @param {mw.Api} api
 */
function PageGateway( api ) {
	this.api = api;
}

PageGateway.prototype = {
	/**
	 * Invalidate the internal cache for a given page
	 *
	 * @memberof PageGateway
	 * @instance
	 * @param {string} title the title of the page who's cache you want to invalidate
	 */
	invalidatePage: function ( title ) {
		delete cache[title];
	},

	/**
	 * Gets language variant list for a page; helper function for getPageLanguages()
	 *
	 * @memberof PageGateway
	 * @instance
	 * @private
	 * @param  {string} title Name of the page to obtain variants for
	 * @param  {Object} data Data from API
	 * @return {Array|boolean} List of language variant objects or false if no variants exist
	 */
	_getLanguageVariantsFromApiResponse: function ( title, data ) {
		var generalData = data.query.general,
			variantPath = generalData.variantarticlepath,
			variants = [];

		if ( !generalData.variants ) {
			return false;
		}

		// Create the data object for each variant and store it
		Object.keys( generalData.variants ).forEach( function ( index ) {
			var item = generalData.variants[ index ],
				variant = {
					autonym: item.name,
					lang: item.code
				};

			if ( variantPath ) {
				variant.url = variantPath
					.replace( '$1', title )
					.replace( '$2', item.code );
			} else {
				variant.url = mw.util.getUrl( title, {
					variant: item.code
				} );
			}
			variants.push( variant );
		} );

		return variants;
	},

	/**
	 * Retrieve available languages for a given title
	 *
	 * @memberof PageGateway
	 * @instance
	 * @param {string} title the title of the page languages should be retrieved for
	 * @param {string} [language] when provided the names of the languages returned
	 *  will be translated additionally into this language.
	 * @return {jQuery.Deferred} which is called with an object containing langlinks
	 * and variant links as defined @ https://en.m.wikipedia.org/w/api.php?action=help&modules=query%2Blanglinks
	 */
	getPageLanguages: function ( title, language ) {
		var self = this,
			args = actionParams( {
				meta: 'siteinfo',
				siprop: 'general',
				prop: 'langlinks',
				lllimit: 'max',
				titles: title
			} );

		if ( language ) {
			args.llprop = 'url|autonym|langname';
			args.llinlanguagecode = language;
		} else {
			args.llprop = 'url|autonym';
		}
		return this.api.get( args ).then( function ( resp ) {
			return {
				languages: resp.query.pages[0].langlinks || [],
				variants: self._getLanguageVariantsFromApiResponse( title, resp )
			};
		}, function () {
			return util.Deferred().reject();
		} );
	}
};

module.exports = PageGateway;
