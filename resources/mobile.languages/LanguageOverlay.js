( function ( M, $ ) {

	var Overlay = M.require( 'mobile.overlays/Overlay' ),
		settings = M.require( 'mobile.settings/settings' );

	/**
	 * Overlay displaying list of languages for a page
	 * @class LanguageOverlay
	 * @extends Overlay
	 */
	function LanguageOverlay( options ) {
		var langMap;

		if ( options.languages && options.languages.length ) {
			options.header = mw.msg( 'mobile-frontend-language-header', options.languages.length );
		}
		if ( options.variants && options.variants.length ) {
			options.variantHeader = mw.msg( 'mobile-frontend-language-variant-header' );
		}
		langMap = settings.get( 'langMap' );
		this.languageMap = langMap ? $.parseJSON( langMap ) : {};
		if ( options.currentLanguage ) {
			this.trackLanguage( options.currentLanguage );
		}
		options = this._sortLanguages( options );
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( LanguageOverlay, Overlay, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading The title for the list of languages for a page.
		 * @cfg {String} defaults.placeholder Placeholder text for the search input.
		 * @cfg {Object} defaults.languages a list of languages with keys {langname, lang, title, url}
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			placeholder: mw.msg( 'mobile-frontend-language-site-choose' )
		} ),
		/**
		 * @inheritdoc
		 */
		className: 'language-overlay overlay',
		/**
		 * @inheritdoc
		 */
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.languages', 'LanguageOverlay.hogan' )
		} ),
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, Overlay.prototype.events, {
			'click ul a': 'onLinkClick',
			'input .search': 'onSearchInput'
		} ),
		/** @inheritdoc */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );
			this.options.languageSwitcherSchema.log( {
				event: 'languageListLoaded',
				languageOverlayVersion: 'simpler-overlay',
				languageCount: this.$( '.site-link-list li' ).length
			} );
		},
		/** @inheritdoc */
		onExit: function () {
			this.options.languageSwitcherSchema.log( {
				event: 'exitModal',
				exitModal: 'dismissed',
				searchInputHasQuery: this.$( 'input.search' ).val().length > 0,
				languageCount: this.$( '.site-link-list' ).children( ':visible' ).length
			} );
			// stop logging when the user decides to close the modal
			this.options.languageSwitcherSchema.stopLogging = true;
			Overlay.prototype.onExit.apply( this, arguments );
		},
		/**
		 * Sorts the provided languages based on previous usage and tags them
		 * with a property preferred for template usage
		 * @private
		 * @param {Object} options
		 */
		_sortLanguages: function ( options ) {
			var langMap = this.languageMap;
			options.languages = options.languages.sort( function ( a, b ) {
				var x = langMap[ a.lang ] || 0,
					y = langMap[ b.lang ] || 0;
				if ( x === y ) {
					return a.langname < b.langname ? -1 : 1;
				} else {
					return x > y ? -1 : 1;
				}
			} );
			return options;
		},
		/**
		 * Track locally the language of the user for future renders.
		 * @param {String} languageCode to track
		 */
		trackLanguage: function ( languageCode ) {
			var count,
				langMap = this.languageMap || {};

			if ( langMap ) {
				count = langMap[ languageCode ] || 0;
				count += 1;
				// cap at 100 as this is enough data to work on
				langMap[ languageCode ] = count > 100 ? 100 : count;
			}

			this.languageMap = langMap;
			// Attempt to store the map. mw.storage might fail but it's not essential so we don't care.
			settings.save( 'langMap', JSON.stringify( langMap ) );
		},

		/**
		 * Filter the language list to only show languages that match the current search term.
		 * @param {String} val of search term (lowercase).
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
			var $link = this.$( ev.currentTarget ),
				lang = $link.attr( 'lang' );

			this.options.languageSwitcherSchema.log( {
				event: 'exitModal',
				exitModal: 'tapped-on-result',
				languageTapped: lang,
				positionOfLanguageTapped: $link.parents( 'li' ).index() + 1,
				searchInputHasQuery: this.$( 'input.search' ).val().length > 0,
				languageCount: this.$( '.site-link-list' ).children( ':visible' ).length
			} );
			this.trackLanguage( lang );
		},

		/**
		 * Search input handler
		 * @param {jQuery.Event} ev Event object.
		 */
		onSearchInput: function ( ev ) {
			// log when the first search character is entered
			if ( !this.hasFirstSearchBeenLogged ) {
				this.options.languageSwitcherSchema.log( {
					event: 'startLanguageSearch'
				} );
				this.hasFirstSearchBeenLogged = true;
			}
			this.filterLists( $( ev.target ).val().toLowerCase() );
		}
	} );

	M.define( 'mobile.languages/LanguageOverlay', LanguageOverlay );

}( mw.mobileFrontend, jQuery ) );
