var util = require( './util.js' ),
	actionParams = require( './actionParams' );

/**
 * API for providing language data.
 *
 * @class LanguageInfo
 * @param {mw.Api} api
 */
function LanguageInfo( api ) {
	this.api = api;
}

LanguageInfo.prototype = {

	/**
	 * Get languageinfo API data from the local wiki, and transform it into a
	 * format usable by LanguageSearcher.
	 *
	 * @memberof LanguageInfo
	 * @instance
	 * @returns {jQuery.Deferred}
	 */
	getLanguages: function () {
		return this.api.get( actionParams( {
			meta: 'languageinfo',
			liprop: 'code|autonym|name'
		} ) ).then( function ( resp ) {
			return {
				languages: Object.keys( resp.query.languageinfo ).map( function ( key ) {
					var data = resp.query.languageinfo[key];
					data.url = '#';
					data.lang = data.code;
					data.langname = data.name;
					return data;
				} )
			};
		}, function () {
			return util.Deferred().reject();
		} );
	}
};

module.exports = LanguageInfo;
