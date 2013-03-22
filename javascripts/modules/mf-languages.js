( function( M,  $ ) {

	var createOverlay = M.require( 'navigation' ).createOverlay;

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

	function sortList( $list ) {
		var langMap = M.settings.getUserSetting( 'langMap' ), $items;

		langMap = langMap ? $.parseJSON( langMap ) : {};
		$items = $list.find( 'li' ).sort( function( a, b ) {
			var x = langMap[ $( a ).find( 'a' ).attr( 'lang' ) ] || 0,
				y = langMap[ $( b ).find( 'a' ).attr( 'lang' ) ] || 0;
			return x < y;
		} ).each( function() {
			var lang = $( this ).find( 'a' ).attr( 'lang' );
			if ( langMap[ lang ] ) {
				$( this ).addClass( 'preferred' );
			}
		} );
		return $list.empty().append( $items );
	}

	function createLanguagePage() {
		var $wrapper = $( '<div class="languageOverlay">' ), $footer, overlay, $lists,
			$search = $( '<div class="search-box">' );

		$( '<input type="search" class="search">' ).
			attr( 'placeholder', M.message( 'mobile-frontend-language-site-choose' ) ).
			appendTo( $search );

		$( '#mw-mf-language-variant-header' ).addClass( 'mw-mf-overlay-header' ).appendTo( $wrapper );
		$( '#mw-mf-language-variant-selection' ).appendTo( $wrapper );
		$( '#mw-mf-language-header' ).addClass( 'mw-mf-overlay-header' ).appendTo( $wrapper );
		sortList( $( '#mw-mf-language-selection' ) ).appendTo( $wrapper );

		$footer = $( '<p>' ).addClass( 'mw-mf-overlay-footer' ).hide().appendTo( $wrapper );
		$( '<a>' ).attr( 'href', M.history.getArticleUrl( 'Special:MobileOptions/Language' ) ).
			text( mw.msg( 'mobile-frontend-language-footer' ) ).appendTo( $footer );

		overlay = createOverlay( $search, $wrapper, { hash: '#mw-mf-overlay-language' } );
		$lists = $( overlay ).find( 'ul' );
		$lists.find( 'a' ).on( 'click', function() {
			M.emit( 'language-select', $( this ).attr( 'lang' ) );
		} );
		$( overlay ).find( '.search' ).on( 'keyup', function() {
			var matches = filterLists( $lists, this.value.toLowerCase() );
			if ( matches > 0 ) {
				$footer.hide();
			} else {
				$footer.show();
			}
		} );
	}

	function initButton() {
		var $a = $( '#mw-mf-language-section' ),
			$h2 = $a.find( 'h2' );

		if ( countAvailableLanguages() > 0 ) { // assume the current language is not present
			$h2.find( 'button' ).remove();
			$( '<button>' ).text( $h2.text() ).
				addClass( 'languageSelector' ).
					on( 'click', createLanguagePage ).insertBefore( $a );
		}
		$a.hide();
	}

	if ( !M.history.isDynamicPageLoadEnabled ) {
		initButton();
	} else {
		M.on( 'history-change', function( curPage ) {
			if ( curPage.hash === '#mw-mf-overlay-language' ) {
				createLanguagePage();
			}
		} ).on( 'languages-loaded', function() {
			initButton();
		} );
	}

}( mw.mobileFrontend, jQuery ) );
