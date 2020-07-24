const
	m = require( '../moduleLoaderSingleton' ),
	getDeviceLanguage = require( './getDeviceLanguage' ),
	Overlay = require( '../Overlay' ),
	promisedView = require( '../promisedView' );

/**
 * @ignore
 * @param {LanguageInfo} languageInfo
 * @return {jQuery.Promise} Resolves to LanguageSearcher
 */
function loadLanguageInfoSearcher( languageInfo ) {
	return mw.loader.using( 'mobile.languages.structured' ).then( function () {
		return languageInfo.getLanguages();
	} ).then( function ( data ) {
		const LanguageSearcher = m.require( 'mobile.languages.structured/LanguageSearcher' );
		// TODO: The jQuery ULS tool also allows searching for languages
		// by their name in the local language (e.g. if you are using
		// English and want to select español, you can also type "Spanish".
		// That would be nice to allow here as well, but would require 1)
		// detection of the availability of the `languagesearch` API and
		// 2) incorporating that into the LanguageSearcher filterLanguages()
		// method, and 3) it might also be necessary to obtain the languages
		// to pass to the search from a new API method in ULS extension which
		// returns the raw or lightly-transformed output of
		// LanguageNameSearchData::$buckets
		return new LanguageSearcher( {
			languages: data.languages,
			variants: data.variants,
			deviceLanguage: getDeviceLanguage( navigator )
		} );

	} );
}

/**
 * Factory function that returns a language info featured instance of an Overlay
 *
 * @param {LanguageInfo} languageInfo
 * @return {Overlay}
 */
function languageInfoOverlay( languageInfo ) {
	return Overlay.make(
		{
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			className: 'overlay language-info-overlay'
		}, promisedView( loadLanguageInfoSearcher( languageInfo ) )
	);
}

// To make knowing when async logic has resolved easier in tests
languageInfoOverlay.test = {
	loadLanguageInfoSearcher: loadLanguageInfoSearcher
};

module.exports = languageInfoOverlay;
