const
	m = require( '../mobile.startup/moduleLoaderSingleton' ),
	LanguageSearcher = require( './LanguageSearcher' );

// Needed because LanguageSearcher is lazy loaded, and if we try to use require
// (instead of m.require), webpack will excise it into mobile.common.
m.define( 'mobile.languages.structured/LanguageSearcher', LanguageSearcher );
