// FIXME: remove this file and mobile.languages.stable module when dynamic
// loading of languages goes to stable
( function( M, $ ) {
	var LanguageOverlay = M.require( 'languages/LanguageOverlay' ),
		variants, languages;

	M.overlayManager.add( /^\/languages$/, function() {
		return new LanguageOverlay( {
			languages: languages,
			variants: variants
		} );
	} );

	/**
	 * Takes a list of languages and transforms them into an array for use in a LanguageOverlay
	 *
	 * @returns {Array}
	 */
	function parseList( $list ) {
		var list = [];
		$list.find( 'li' ).each( function() {
			var $a = $( this ).find( 'a' ), lang, pageName = $a.attr( 'title' );

			lang = { lang: $a.attr( 'lang' ), langname: $a.text(), url: $a.attr( 'href' ) };
			if ( pageName ) {
				lang.pageName = pageName;
			}
			list.push( lang );
		} );
		return list;
	}

	function initButton() {
		var $section = $( '#mw-mf-language-section' ),
			$h2 = $section.find( 'h2' );

		languages = parseList( $section.find( '#mw-mf-language-selection' ) );
		variants = parseList( $section.find( '#mw-mf-language-variant-selection' ) );

		// assume the current language is not present
		if ( languages.length > 0 || variants.length > 1 ) {
			$( '<button>' ).text( $h2.text() ).
				addClass( 'languageSelector' ).
				on( 'click', function() {
					M.router.navigate( '/languages' );
				} ).insertBefore( $section );
		}
		$section.remove();
	}

	$( initButton );
	M.on( 'page-loaded', initButton );

	M.define( 'modules/languages/languagesStable', { parseList: parseList } );

}( mw.mobileFrontend, jQuery ) );
