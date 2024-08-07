const
	m = require( '../moduleLoaderSingleton' ),
	getDeviceLanguage = require( './getDeviceLanguage' ),
	Overlay = require( '../Overlay' ),
	promisedView = require( '../promisedView' );

/**
 * @ignore
 * @param {LanguageInfo} languageInfo
 * @param {boolean} showSuggestedLanguages If the suggested languages section
 * should be rendered.
 * @return {jQuery.Promise} Resolves to LanguageSearcher
 */
function loadLanguageInfoSearcher( languageInfo, showSuggestedLanguages ) {
	return mw.loader.using( 'mobile.languages.structured' ).then( () => languageInfo.getLanguages() ).then( ( data ) => {
		const LanguageSearcher = m.require( 'mobile.languages.structured/LanguageSearcher' );
		return new LanguageSearcher( {
			languages: data.languages,
			variants: data.variants,
			showSuggestedLanguages,
			deviceLanguage: getDeviceLanguage( navigator )
		} );

	} );
}

/**
 * Factory function that returns a language info featured instance of an Overlay
 *
 * @ignore
 * @function
 * @memberof module:mobile.startup/languages
 * @param {module:mobile.startup/languages~LanguageInfo} languageInfo
 * @param {boolean} showSuggestedLanguages If the suggested languages section
 * should be rendered.
 * @return {module:mobile.startup/Overlay}
 */
function languageInfoOverlay( languageInfo, showSuggestedLanguages ) {
	return Overlay.make(
		{
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			className: 'overlay language-info-overlay'
		}, promisedView( loadLanguageInfoSearcher( languageInfo, showSuggestedLanguages ) )
	);
}

// To make knowing when async logic has resolved easier in tests
languageInfoOverlay.test = {
	loadLanguageInfoSearcher
};

module.exports = languageInfoOverlay;
