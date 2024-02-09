const
	m = require( '../moduleLoaderSingleton' ),
	getDeviceLanguage = require( './getDeviceLanguage' ),
	Overlay = require( '../Overlay' ),
	MessageBox = require( '../MessageBox' ),
	currentPageHTMLParser = require( '../currentPageHTMLParser' )(),
	promisedView = require( '../promisedView' );

/**
 * @ignore
 * @return {jQuery.Promise} Resolves to LanguageSearcher
 */
function loadLanguageSearcher() {
	return mw.loader.using( 'mobile.languages.structured' ).then( () =>
		currentPageHTMLParser.getLanguages(
			mw.config.get( 'wgTitle' )
		) ).then( ( data ) => {
		const LanguageSearcher = m.require( 'mobile.languages.structured/LanguageSearcher' );

		return new LanguageSearcher( {
			languages: data.languages,
			variants: data.variants,
			showSuggestedLanguages: true,
			deviceLanguage: getDeviceLanguage( navigator ),
			onOpen: ( searcher ) => mw.hook( 'mobileFrontend.languageSearcher.onOpen' ).fire( searcher )
		} );
	}, () =>
		new MessageBox( {
			className: 'mw-message-box-error content',
			msg: mw.msg( 'mobile-frontend-languages-structured-overlay-error' )
		} ) );
}

/**
 * Factory function that returns a language featured instance of an Overlay
 *
 * @return {Overlay}
 */
function languageOverlay() {
	return Overlay.make(
		{
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			className: 'overlay language-overlay'
		}, promisedView( loadLanguageSearcher() )
	);
}

// To make knowing when async logic has resolved easier in tests
languageOverlay.test = {
	loadLanguageSearcher
};

module.exports = languageOverlay;
