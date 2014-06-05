( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ),
		LanguageOverlay;

	LanguageOverlay = Overlay.extend( {
		defaults: {
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			placeholder: mw.msg( 'mobile-frontend-language-site-choose' )
		},
		className: 'language-overlay overlay',
		templatePartials: {
			content: M.template.get( 'modules/languages/LanguageOverlay' )
		},

		initialize: function( options ) {
			if ( options.languages && options.languages.length ) {
				options.header = mw.msg( 'mobile-frontend-language-header', options.languages.length );
			}
			if ( options.variants && options.variants.length ) {
				options.variantHeader = mw.msg( 'mobile-frontend-language-variant-header' );
			}
			M.emit( 'language-overlay-initialize', options );
			this._super( options );
		},

		filterLists: function( val ) {
			var $items = this.$( '.page-list li' ), $subheaders = this.$( 'h3' );

			if ( val ) {
				$subheaders.hide();
				$items.each( function() {
					var $item = $( this );
					if ( $item.find( 'span' ).text().toLowerCase().indexOf( val ) > -1 ) {
						$item.show();
					} else {
						$item.hide();
					}
				} );
			} else {
				$subheaders.show();
				$items.show();
			}
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			this.$( 'ul' ).find( 'a' ).on( 'click', function() {
				M.emit( 'language-select', $( this ).attr( 'lang' ) );
			} );
			this.$( '.search' ).on( 'input', function() {
				self.filterLists( $( this ).val().toLowerCase() );
			} );
		}
	} );

	M.define( 'languages/LanguageOverlay', LanguageOverlay );

}( mw.mobileFrontend, jQuery ) );
