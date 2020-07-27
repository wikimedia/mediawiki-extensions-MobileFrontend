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
