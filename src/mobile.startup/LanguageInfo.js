const util = require( './util.js' ),
	actionParams = require( './actionParams' );

/**
 * API for providing language data.
 *
 * @class module:mobile.startup/languages~LanguageInfo
 */
class LanguageInfo {
	/**
	 * @param {mw.Api} api
	 */
	constructor( api ) {
		this.api = api;
	}

	/**
	 * Get languageinfo API data from the local wiki, and transform it into a
	 * format usable by LanguageSearcher.
	 *
	 * @memberof module:mobile.startup/languages~LanguageInfo
	 * @instance
	 * @returns {jQuery.Deferred}
	 */
	getLanguages() {
		return this.api.get( actionParams( {
			meta: 'languageinfo',
			liprop: 'code|autonym|name|bcp47'
		} ) ).then( ( resp ) => {
			const filteredLanguages = [];
			// Filter out legacy languages and require an autonym.
			// If the bcp47 (https://w.wiki/Y7A) does not match the language
			// code, that is in an indication that the language code is outdated
			// and should not be used.
			Object.keys( resp.query.languageinfo ).forEach( ( key ) => {
				const language = resp.query.languageinfo[key];
				if ( ( language.code.toLowerCase() === language.bcp47.toLowerCase() ) &&
					language.autonym ) {
					filteredLanguages.push( language );
				}
			} );
			return filteredLanguages;
		}, () => util.Deferred().reject() ).then( ( filteredLanguages ) => ( {
			languages: filteredLanguages.map( ( data ) => {
				data.url = '#';
				data.lang = data.code;
				data.langname = data.name;
				// FIXME: This isn't a "title" in the sense of a MediaWiki
				// Title, and it is rendered as a subheader in the list
				// item, so a different name would be wiser, both here and
				// in LanguageSearcher's template. Also it would arguably
				// be more intuitive for the language name (localized) to
				// appear as the main emphasized element of each language
				// list element; but instead the autonym has that role.
				// A more thorough refactoring of LanguageSearcher to allow
				// for generic header/subheader elements is left for a
				// follow-up.
				data.title = data.name;
				return data;
			} )
		} ), () => util.Deferred().reject() );
	}
}

module.exports = LanguageInfo;
