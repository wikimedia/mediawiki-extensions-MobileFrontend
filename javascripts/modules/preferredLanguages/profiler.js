// Watches users use of the language overlay and profiles the languages
// that user clicks on. Stores this locally under the key langMap
( function ( M ) {

	var supported = M.supportsLocalStorage,
		langMap,
		curLanguage = mw.config.get( 'wgContentLanguage' );

	function loadLanguageMap() {
		langMap = M.settings.getUserSetting( 'langMap' );
		langMap = langMap ? JSON.parse( langMap ) : {};
	}

	function profileLanguage( language ) {
		// if not supported, don't do anything
		if ( supported && langMap ) {
			var count;
			count = langMap[ language ] || 0;
			count += 1;
			// cap at 100 as this is enough data to work on
			langMap[ language ] = count > 100 ? 100 : count;
			M.settings.saveUserSetting( 'langMap', JSON.stringify( langMap ) );
		}
	}

	function initProfiler() {
		if ( supported ) {
			loadLanguageMap();
			profileLanguage( curLanguage );
		}
	}

	M.on( 'language-select', profileLanguage );
	initProfiler();

}( mw.mobileFrontend ) );
