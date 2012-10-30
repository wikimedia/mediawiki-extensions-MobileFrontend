/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M,  $ ) {

var m = ( function() {
	var createOverlay = M.navigation.createOverlay;

	function countAvailableLanguages() {
		return $( '#mw-mf-language-selection a' ).length;
	}

	function filterList( list, val ) {
		var $choice, matches = 0, i,
			$choices = $( 'li', list ),
			totalchoices = $choices.length;

		for( i = 1; i < totalchoices - 1; i++ ) { // ignore header and footer
			$choice = $choices.eq( i );
			if ( $choice.text().toLowerCase().indexOf( val ) > -1 ) {
				matches += 1;
				$choice.show();
			} else if( i > 0 ) { // don't hide header
				$choice.hide();
			}
		}

		// reveal / hide the no results message which is the last item in the list..
		if( matches === 0 ) {
			$choices.eq( totalchoices - 1 ).show();
		} else {
			$choices.eq( totalchoices - 1 ).hide();
		}
	}

	function createLanguagePage() {
		var ul = $( '<ul />' )[0], li, a, $a, href, footer,
			overlay,
			search = $( '<input type="search" class="search" id="mw-mf-language-search" >' ).
				attr( 'placeholder', M.message( 'mobile-frontend-language-site-choose' ) ),
			$languages = $( '#mw-mf-language-selection a' );

		$( '<li />' ).addClass( 'mw-mf-overlay-header' ).
			text( $( '#mw-mf-language-section .content_block p' ).text() ).appendTo( ul );
		$languages.each( function() {
			var $this = $( this );
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', $this.attr( 'href' ) ).text( $this.text() ).appendTo( li );
		} );
		footer = $( '<li />' ).addClass( 'mw-mf-overlay-footer' ).
			html( M.message( 'mobile-frontend-language-footer' ) ).appendTo( ul );
		$a = $( 'a', footer );
		href = $( '#mw-mf-universal-language' ).attr( 'href' );
		$a.attr( 'href', href );
		overlay = createOverlay( search, ul, { hash: '#mw-mf-overlay-language' } );
		$( overlay ).find( '.search' ).on( 'keyup', function() {
			filterList( $( overlay ).find( 'ul.content' ), this.value.toLowerCase() );
		} );
	}

	function init() {
		var $a = $( '#mw-mf-language-section' ),
			$h2 = $a.find( 'h2' );

		if( countAvailableLanguages() > 1 ) {
			$h2.find( 'button' ).remove();
			$( '<button>' ).text( $h2.text() ).
				addClass( 'languageSelector' ).
					on( 'click', createLanguagePage ).insertBefore( $a );
		}
		$a.hide();

		$( window ).bind( 'mw-mf-history-change', function( ev, curPage ) {
			if ( curPage.hash === '#mw-mf-overlay-language' ) {
				createLanguagePage();
			}
		} );
	}

	return {
		init: init
	};
}() );

M.registerModule( 'languages', m );
}( mw.mobileFrontend, jQuery ) );
