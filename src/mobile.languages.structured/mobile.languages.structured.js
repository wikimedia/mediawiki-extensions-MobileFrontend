const
	m = require( '../mobile.startup/moduleLoaderSingleton' ),
	PageGateway = require( '../mobile.startup/PageGateway' ),
	LanguageSearcher = require( './LanguageSearcher' ),
	languageOverlay = require( '../mobile.startup/languageOverlay/languageOverlay' );

// Needed because LanguageSearcher is lazy loaded, and if we try to use require
// (instead of m.require), webpack will excise it into mobile.common.
m.define( 'mobile.languages.structured/LanguageSearcher', LanguageSearcher );

/**
 * Temporary function for backwards compatibility with Minerva
 * which needs to be updated to use languageOverlay
 * This inefficiently allows Minerva to load the LanguageOverlay via
 * 2 identical ajax requests.
 * @ignore
 * @return {Overlay}
 */
function LanguageOverlay() {
	return languageOverlay( new PageGateway( new mw.Api() ) );
}

// Also can be removed after Ie6dad4bd3c80e6cfcc1d7f9ad38941a323ba3cc6 is merged
m.deprecate( 'mobile.languages.structured/LanguageOverlay', LanguageOverlay,
	'mobile.startup' );
