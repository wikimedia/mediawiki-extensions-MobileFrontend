( function( M ) {

	var supported = M.settings.supportsLocalStorage,
		langMap,
		curLanguage = mw.config.get( 'wgContentLanguage' );

	function loadLanguageMap() {
		langMap = M.settings.getUserSetting( 'langMap' );
		langMap = langMap ? JSON.parse( langMap ) : {};
	}

	function profileLanguage( language ) {
		var count;
		count = langMap[ language ] || 0;
		count += 1;
		// cap at 100 as this is enough data to work on
		langMap[ language ] = count > 100 ? 100 : count;
		M.settings.saveUserSetting( 'langMap', JSON.stringify( langMap ) );
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
