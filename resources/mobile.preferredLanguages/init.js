// When set orders LanguageOverlay list of languages by most frequently chosen
( function ( M, $ ) {
	var browser = M.require( 'browser' ),
		supported = browser.supportsLocalStorage(),
		settings = M.require( 'settings' ),
		langMap = settings.get( 'langMap' ),
		curLanguage = mw.config.get( 'wgContentLanguage' );

	langMap = langMap ? $.parseJSON( langMap ) : {};

	/**
	 * Update the langMap variable with the language map from the settings.
	 * @method
	 * @ignore
	 */
	function loadLanguageMap() {
		langMap = settings.get( 'langMap' );
		langMap = langMap ? JSON.parse( langMap ) : {};
	}

	/**
	 * Update langMap and save it to settings.
	 * If not supported, don't do anything.
	 * @method
	 * @ignore
	 * @param {String} language
	 */
	function profileLanguage( language ) {
		if ( supported && langMap ) {
			var count;
			count = langMap[ language ] || 0;
			count += 1;
			// cap at 100 as this is enough data to work on
			langMap[ language ] = count > 100 ? 100 : count;
			settings.save( 'langMap', JSON.stringify( langMap ) );
		}
	}

	/**
	 * Run loadLanguageMap and profileLanguage if browser supports localStorage.
	 * @method
	 * @ignore
	 */
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
