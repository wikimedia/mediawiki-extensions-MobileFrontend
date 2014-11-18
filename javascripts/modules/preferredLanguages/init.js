// When set orders LanguageOverlay list of languages by most frequently chosen
( function ( M, $ ) {
	var supported = M.supportsLocalStorage,
		settings = M.require( 'settings' ),
		langMap = settings.get( 'langMap' ),
		curLanguage = mw.config.get( 'wgContentLanguage' );

	langMap = langMap ? $.parseJSON( langMap ) : {};

	function loadLanguageMap() {
		langMap = settings.get( 'langMap' );
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
			settings.save( 'langMap', JSON.stringify( langMap ) );
		}
	}

	function initProfiler() {
		if ( supported ) {
			loadLanguageMap();
			profileLanguage( curLanguage );
		}
	}

	M.on( 'language-overlay-initialize', function ( options ) {
		options.languages = options.languages.sort( function ( a, b ) {
			var x = langMap[ a.lang ] || 0,
				y = langMap[ b.lang ] || 0;
			if ( x > 0 ) {
				a.preferred = true;
			}
			if ( y > 0 ) {
				b.preferred = true;
			}
			return x < y;
		} );
	} );
	M.on( 'language-select', profileLanguage );
	initProfiler();

}( mw.mobileFrontend, jQuery ) );
