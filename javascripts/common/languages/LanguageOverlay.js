( function( M,  $ ) {

	var Overlay = M.require( 'Overlay' ),
		LanguageOverlay;

	LanguageOverlay = Overlay.extend( {
		defaults: {
			languagesLink: mw.util.wikiGetlink( 'Special:MobileOptions/Language' ),
			languagesText: mw.msg( 'mobile-frontend-language-footer' ),
			placeholder: mw.msg( 'mobile-frontend-language-site-choose' )
		},
		className: 'language-overlay mw-mf-overlay list-overlay',
		template: M.template.get( 'overlays/languages' ),
		initialize: function( options ) {
			if ( options.languages ) {
				options.header = mw.msg( 'mobile-frontend-language-header', options.languages.length );
			}
			if ( options.variants && options.variants.length ) {
				options.variantHeader = mw.msg( 'mobile-frontend-language-header', options.variants.length );
			}
			M.emit( 'language-overlay-initialize', options );
			this._super( options );
		},
		filterLists: function( val ) {
			var matches = 0;

			this.$( 'ul li' ).each( function() {
				var $choice = $( this );
				if ( $choice.find( 'span' ).text().toLowerCase().indexOf( val ) > -1 ) {
					matches += 1;
					$choice.show();
				} else {
					$choice.hide();
				}
			} );

			return matches;
		},
		postRender: function( options ) {
			var $footer, self = this;
			this._super( options );

			$footer = this.$( '.mw-mf-overlay-footer' );
			this.$( 'ul' ).find( 'a' ).on( 'click', function() {
				M.emit( 'language-select', $( this ).attr( 'lang' ) );
			} );
			this.$( '.search' ).on( 'keyup', function() {
				var matches = self.filterLists( this.value.toLowerCase() );
				if ( matches > 0 ) {
					$footer.hide();
				} else {
					$footer.show();
				}
			} );
		}
	} );
	M.define( 'languages/LanguageOverlay', LanguageOverlay );

}( mw.mobileFrontend, jQuery ) );
