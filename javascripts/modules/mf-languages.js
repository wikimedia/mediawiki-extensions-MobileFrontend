( function( M,  $ ) {

var m = ( function() {
	var createOverlay = M.navigation.createOverlay;

	function countAvailableLanguages() {
		return $( '#mw-mf-language-selection a' ).length;
	}

	function filterLists( lists, val ) {
		var matches = 0, $choices = $( 'li', lists );

		$choices.each( function() {
			var $choice = $( this );
			if ( $choice.text().toLowerCase().indexOf( val ) > -1 ) {
				matches += 1;
				$choice.show();
			} else {
				$choice.hide();
			}
		} );

		return matches;
	}

	function createLanguagePage() {
		var $wrapper = $( '<div class="languageOverlay">' ), $footer, overlay, $lists,
			$search = $( '<input type="search" class="search" id="mw-mf-language-search" >' ).
				attr( 'placeholder', M.message( 'mobile-frontend-language-site-choose' ) );

		$( '#mw-mf-language-variant-header' ).addClass( 'mw-mf-overlay-header' ).appendTo( $wrapper );
		$( '#mw-mf-language-variant-selection' ).appendTo( $wrapper );
		$( '#mw-mf-language-header' ).addClass( 'mw-mf-overlay-header' ).appendTo( $wrapper );
		$( '#mw-mf-language-selection' ).appendTo( $wrapper );

		$footer = $( '<p>' ).addClass( 'mw-mf-overlay-footer' ).
			html( M.message( 'mobile-frontend-language-footer' ) ).hide().appendTo( $wrapper );

		overlay = createOverlay( $search, $wrapper, { hash: '#mw-mf-overlay-language' } );
		$lists = $( overlay ).find( 'ul' );
		$( overlay ).find( '.search' ).on( 'keyup', function() {
			var matches = filterLists( $lists, this.value.toLowerCase() );
			if ( matches > 0 ) {
				$footer.hide();
			} else {
				$footer.show();
			}
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
