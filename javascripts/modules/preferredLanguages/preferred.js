// When set orders LanguageOverlay list of languages by most frequently chosen
( function ( M,  $ ) {
	var langMap = M.settings.getUserSetting( 'langMap' );
	langMap = langMap ? $.parseJSON( langMap ) : {};

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

}( mw.mobileFrontend, jQuery ) );
