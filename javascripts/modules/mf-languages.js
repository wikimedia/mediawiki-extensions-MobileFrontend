( function( M,  $ ) {

	var Overlay = M.require( 'navigation' ).Overlay,
		LanguageOverlay;

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

	LanguageOverlay = Overlay.extend( {
		template: M.template.get( 'overlays/languages' ),
		init: function() { // FIXME: rename to initialize when you can inherit from parent.
			var $footer, $lists;

			$lists = this.$( 'ul' );
			$footer = this.$( '.mw-mf-overlay-footer' );
			$lists.find( 'a' ).on( 'click', function() {
				M.emit( 'language-select', $( this ).attr( 'lang' ) );
			} );
			this.$( '.search' ).on( 'keyup', function() {
				var matches = filterLists( $lists, this.value.toLowerCase() );
				if ( matches > 0 ) {
					$footer.hide();
				} else {
					$footer.show();
				}
			} );
		}
	} );

	function createLanguagePage() {
		var overlay = new LanguageOverlay( {
			placeholder: M.message( 'mobile-frontend-language-site-choose' ),
			variantHeader: $( '#mw-mf-language-variant-header' ).html(),
			variantItems: $( '#mw-mf-language-variant-selection' ).html(),
			header: $( '#mw-mf-language-header' ).html(),
			languageItems: sortList( $( '#mw-mf-language-selection' ) ).html(),
			languagesLink: M.history.getArticleUrl( 'Special:MobileOptions/Language' ),
			languagesText: mw.msg( 'mobile-frontend-language-footer' )
		} );
		overlay.init();
		overlay.show();
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
