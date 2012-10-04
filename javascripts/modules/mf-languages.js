/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( M,  $ ) {
M.languages = (function() {
	var createOverlay = M.navigation.createOverlay;

	function countAvailableLanguages() {
		return $( '#mw-mf-language-selection option' ).length;
	}

	function createLanguagePage() {
		var ul = $( '<ul />' )[0], li, a, $a, href, footer,
			$languages = $( '#mw-mf-language-selection option' );

		$( '<li />' ).addClass( 'mw-mf-overlay-header' ).
			text( M.message( 'mobile-frontend-language-header' ).replace( '$1', $languages.length ) ).appendTo( ul );
		$languages.each( function(i, el) {
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', el.value ).text( $( el ).text() ).appendTo( li );
		} );
		footer = $( '<li />' ).addClass( 'mw-mf-overlay-footer' ).
			html( M.message( 'mobile-frontend-language-footer' ) ).appendTo( ul );
		$a = $( 'a', footer );
		href = $( '#mw-mf-universal-language' ).attr( 'href' )
		$a.attr( 'href', href );
		createOverlay( M.message( 'language-heading' ), ul, { hash: '#mw-mf-overlay-language' } );
	}

	function init() {
		var actionMenuButton = document.getElementById( 'mw-mf-language' );
		if( countAvailableLanguages() > 1 ) {
			$( actionMenuButton ).on( 'click', createLanguagePage );
		} else {
			$( actionMenuButton ).addClass( 'disabled' );
		}
	}

	if( typeof $ !== 'undefined' ) {
		init();
		$( window ).bind( 'mw-mf-history-change', function( ev, curPage ) {
			if ( curPage.hash === '#mw-mf-overlay-language' ) {
				createLanguagePage();
			}
		} );
	}
	return {
		init: init
	};
}());
}( mw.mobileFrontend, jQuery ));
