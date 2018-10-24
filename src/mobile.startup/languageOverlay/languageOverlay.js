const
	m = require( '../moduleLoaderSingleton' ),
	getDeviceLanguage = require( './getDeviceLanguage' ),
	Overlay = require( '../Overlay' ),
	promisedView = require( '../promisedView' );

/**
 * @ignore
 * @param {PageGateway} gateway
 * @return {jQuery.Promise} Resolves to LanguageSearcher
 */
function loadLanguageSearcher( gateway ) {
	return mw.loader.using( 'mobile.languages.structured' ).then( function () {
		return gateway.getPageLanguages( mw.config.get( 'wgPageName' ), mw.config.get( 'wgUserLanguage' ) );
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
