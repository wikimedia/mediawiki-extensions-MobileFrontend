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
	 * @param  {string} pageLang Content language of the page
	 * @param  {Object} data Data from API
	 * @return {Array|boolean} List of language variant objects or false if no variants exist
	 */
	_getLanguageVariantsFromApiResponse: function ( title, pageLang, data ) {
		var variantsData = data.query.languageinfo[ pageLang ].variantnames,
			variantPath = mw.config.get( 'wgVariantArticlePath' ),
			contLang = mw.config.get( 'wgContentLanguage' ),
			variants = [];

		// Variants always contain itself.
		if ( Object.keys( variantsData ).length < 2 ) {
			return false;
		}

		// Create the data object for each variant and store it
		Object.keys( variantsData ).forEach( function ( code ) {
			var variant = {
				autonym: variantsData[ code ],
				lang: code
			};

			if ( variantPath && pageLang === contLang ) {
				variant.url = variantPath
					.replace( '$1', title )
					.replace( '$2', code );
			} else {
				variant.url = mw.util.getUrl( title, {
					variant: code
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
		// FIXME: Get rid of special handlings after T326997 is implemented.
		const PAGELANG_MAP = {
			'ike-cans': 'iu',
			'ike-latn': 'iu'
		};
		var self = this,
			viewLang = mw.config.get( 'wgPageContentLanguage' ),
			pageLang = PAGELANG_MAP[ viewLang ] || viewLang.split( '-' )[ 0 ],
			args = actionParams( {
				meta: 'languageinfo',
				liprop: 'variantnames',
				licode: pageLang,
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
				variants: self._getLanguageVariantsFromApiResponse( title, pageLang, resp )
			};
		}, function () {
			return util.Deferred().reject();
		} );
	}
};

module.exports = PageGateway;
