( function ( M, $ ) {

	var Overlay = M.require( 'Overlay' ),
		LanguageOverlay;

	/**
	 * Overlay displaying list of languages for a page
	 * @class LanguageOverlay
	 * @extends Overlay
	 */
	LanguageOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading The title for the list of languages for a page.
		 * @cfg {String} defaults.placeholder Placeholder text for the search input.
		 */
		defaults: {
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			placeholder: mw.msg( 'mobile-frontend-language-site-choose' )
		},
		/**
		 * @inheritdoc
		 */
		className: 'language-overlay overlay',
		/**
		 * @inheritdoc
		 */
		templatePartials: {
			content: mw.template.get( 'mobile.languages', 'LanguageOverlay.hogan' )
		},
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, Overlay.prototype.events, {
			'click ul a': 'onLinkClick',
			'input .search': 'onSearchInput'
		} ),

		/** @inheritdoc */
		initialize: function ( options ) {
			if ( options.languages && options.languages.length ) {
				options.header = mw.msg( 'mobile-frontend-language-header', options.languages.length );
			}
			if ( options.variants && options.variants.length ) {
				options.variantHeader = mw.msg( 'mobile-frontend-language-variant-header' );
			}
			M.emit( 'language-overlay-initialize', options );
			Overlay.prototype.initialize.apply( this, arguments );
		},

		/**
		 * Filter the language list to only show languages that match the current search term.
		 * @param {String} val of search term.
		 */
		filterLists: function ( val ) {
			var $items = this.$( '.site-link-list li' ),
				$subheaders = this.$( 'h3' );

			if ( val ) {
				$subheaders.hide();
				$items.each( function () {
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

		/**
		 * Language link click handler
		 * @param {jQuery.Event} ev Event object.
		 */
		onLinkClick: function ( ev ) {
			M.emit( 'language-select', $( ev.currentTarget ).attr( 'lang' ) );
		},

		/**
		 * Search input handler
		 * @param {jQuery.Event} ev Event object.
		 */
		onSearchInput: function ( ev ) {
			this.filterLists( $( ev.target ).val().toLowerCase() );
		}
	} );

	M.define( 'modules/languages/LanguageOverlay', LanguageOverlay );

}( mw.mobileFrontend, jQuery ) );
