( function( M,  $ ) {

	var LanguageOverlay = M.require( 'languages/LanguageOverlay' );

	/**
	 * Takes a list of languages and transforms them into an array for use in a LanguageOverlay
	 *
	 * @returns {Array}
	 */
	function parseList( $list ) {
		var list = [];
		$list.find( 'li' ).each( function() {
			var $a = $( this ).find( 'a' ), lang, pageName = $a.attr( 'title' );

			lang = { lang: $a.attr( 'lang' ), langName: $a.text(), url: $a.attr( 'href' ) };
			if ( pageName ) {
				lang.pageName = pageName;
			}
			list.push( lang );
		} );
		return list;
	}

	function initButton() {
		var $section = $( '#mw-mf-language-section' ),
			$h2 = $section.find( 'h2' ),
			languages = parseList( $section.find( '#mw-mf-language-selection' ) ),
			variants = parseList( $section.find( '#mw-mf-language-variant-selection' ) );

		// assume the current language is not present
		if ( languages.length > 0 || variants.length > 1 ) {
			$( '<button>' ).text( $h2.text() ).
				addClass( 'languageSelector' ).
				on( 'click', function() {
					new LanguageOverlay( {
						variants: variants,
						languages: languages
					} ).show();
				} ).insertBefore( $section );
		}
		$section.remove();
	}

	$( initButton );
	M.on( 'languages-loaded', initButton );
	M.define( 'modules/languages', {
		parseList: parseList
	} );

}( mw.mobileFrontend, jQuery ) );
