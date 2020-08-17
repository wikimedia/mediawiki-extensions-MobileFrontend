const
	m = require( '../moduleLoaderSingleton' ),
	getDeviceLanguage = require( './getDeviceLanguage' ),
	Overlay = require( '../Overlay' ),
	promisedView = require( '../promisedView' );

/**
 * @ignore
 * @param {PageGateway} pageGateway
 * getPageLanguages API call.
 * @return {jQuery.Promise} Resolves to LanguageSearcher
 */
function loadLanguageSearcher( pageGateway ) {
	return mw.loader.using( 'mobile.languages.structured' ).then( function () {
		return pageGateway.getPageLanguages( mw.config.get( 'wgPageName' ), mw.config.get( 'wgUserLanguage' ) );
	} ).then( function ( data ) {
		const LanguageSearcher = m.require( 'mobile.languages.structured/LanguageSearcher' );

		return new LanguageSearcher( {
			languages: data.languages,
			variants: data.variants,
			showSuggestedLanguages: true,
			deviceLanguage: getDeviceLanguage( navigator )
		} );

	} );
}

/**
 * Factory function that returns a language featured instance of an Overlay
 *
 * @param {PageGateway} pageGateway
 * @return {Overlay}
 */
function languageOverlay( pageGateway ) {
	return Overlay.make(
		{
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			className: 'overlay language-overlay'
		}, promisedView( loadLanguageSearcher( pageGateway ) )
	);
}

// To make knowing when async logic has resolved easier in tests
languageOverlay.test = {
	loadLanguageSearcher: loadLanguageSearcher
};

module.exports = languageOverlay;
