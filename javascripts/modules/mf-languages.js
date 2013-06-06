( function( M,  $ ) {

	var Overlay = M.require( 'Overlay' ),
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
		postRender: function( options ) {
			var $footer, $lists;
			this._super( options );

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
		var $container = $( this ).data( 'languages' ), overlay;
		overlay = new LanguageOverlay( {
			placeholder: M.message( 'mobile-frontend-language-site-choose' ),
			variantHeader: $container.find( '#mw-mf-language-variant-header' ).html(),
			variantItems: $container.find( '#mw-mf-language-variant-selection' ).html(),
			header: $container.find( '#mw-mf-language-header' ).html(),
			languageItems: sortList( $container.find( '#mw-mf-language-selection' ) ).html(),
			languagesLink: M.history.getArticleUrl( 'Special:MobileOptions/Language' ),
			languagesText: mw.msg( 'mobile-frontend-language-footer' )
		} );
		overlay.show();
	}

	function initButton() {
		var $a = $( '#mw-mf-language-section' ),
			$h2 = $a.find( 'h2' );

		if ( countAvailableLanguages() > 0 ) { // assume the current language is not present
			$h2.find( 'button' ).remove();
			// FIXME: construct overlay here rather than on button click
			$( '<button>' ).text( $h2.text() ).
				data( 'languages', $a ).
				addClass( 'languageSelector' ).
					on( 'click', createLanguagePage ).insertBefore( $a );
		}
		$a.detach(); // use detach to avoid interference with inline style scrubbing module in alpha
	}

	$( initButton );
	M.on( 'languages-loaded', initButton );

}( mw.mobileFrontend, jQuery ) );
