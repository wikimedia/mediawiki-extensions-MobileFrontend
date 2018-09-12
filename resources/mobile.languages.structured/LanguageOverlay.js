( function ( M ) {

	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		langUtil = M.require( 'mobile.languages.structured/util' );

	/**
	 * Overlay displaying a structured list of languages for a page
	 *
	 * @class LanguageOverlay
	 * @extends Overlay
	 *
	 * @param {Object} options Configuration options
	 * @param {Object[]} options.languages list of language objects as returned by the API
	 * @param {Array|boolean} options.variants language variant objects
	 *  or false if no variants exist
	 * @param {string} [options.deviceLanguage] the device's primary language
	 */
	function LanguageOverlay( options ) {
		var languages;

		languages = langUtil.getStructuredLanguages(
			options.languages,
			options.variants,
			langUtil.getFrequentlyUsedLanguages(),
			options.deviceLanguage
		);
		options.allLanguages = languages.all;
		options.allLanguagesCount = languages.all.length;
		options.suggestedLanguages = languages.suggested;
		options.suggestedLanguagesCount = languages.suggested.length;

		Overlay.call( this, options );
	}

	OO.mfExtend( LanguageOverlay, Overlay, {
		/**
		 * @inheritdoc
		 * @memberof LanguageOverlay
		 * @instance
		 */
		className: Overlay.prototype.className + ' language-overlay',
		/**
		 * @memberof LanguageOverlay
		 * @instance
		 * @mixes Overlay#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {Object[]} defaults.languages each object has keys as
		 *  returned by the langlink API https://www.mediawiki.org/wiki/API:Langlinks
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'mobile-frontend-language-heading' ),
			inputPlaceholder: mw.msg( 'mobile-frontend-languages-structured-overlay-search-input-placeholder' ),
			// we can't rely on CSS only to uppercase the headings. See https://stackoverflow.com/questions/3777443/css-text-transform-not-working-properly-for-turkish-characters
			allLanguagesHeader: mw.msg( 'mobile-frontend-languages-structured-overlay-all-languages-header' ).toLocaleUpperCase(),
			suggestedLanguagesHeader: mw.msg( 'mobile-frontend-languages-structured-overlay-suggested-languages-header' ).toLocaleUpperCase()
		} ),
		/**
		 * @inheritdoc
		 * @memberof LanguageOverlay
		 * @instance
		 */
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: mw.template.get( 'mobile.languages.structured', 'LanguageOverlay.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @memberof LanguageOverlay
		 * @instance
		 */
		events: util.extend( {}, Overlay.prototype.events, {
			'click a': 'onLinkClick',
			'input .search': 'onSearchInput'
		} ),
		/**
		 * @inheritdoc
		 * @memberof LanguageOverlay
		 * @instance
		 */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );

			// cache
			this.$siteLinksList = this.$( '.site-link-list' );
			this.$languageItems = this.$siteLinksList.find( 'a' );
			this.$subheaders = this.$( 'h3' );
		},
		/**
		 * Article link click event handler
		 * @memberof LanguageOverlay
		 * @instance
		 * @param {jQuery.Event} ev
		 */
		onLinkClick: function ( ev ) {
			var $link = this.$( ev.currentTarget ),
				lang = $link.attr( 'lang' ),
				self = this,
				$visibleLanguageLinks = this.$languageItems.filter( ':visible' );

			langUtil.saveLanguageUsageCount( lang, langUtil.getFrequentlyUsedLanguages() );

			// find the index of the clicked language in the list of visible results
			$visibleLanguageLinks.each( function ( i, link ) {
				if ( self.$( link ).hasClass( lang ) ) {
					return false;
				}
			} );
		},
		/**
		 * Search input handler
		 * @memberof LanguageOverlay
		 * @instance
		 * @param {jQuery.Event} ev Event object.
		 */
		onSearchInput: function ( ev ) {
			this.filterLanguages( this.$( ev.target ).val().toLowerCase() );
		},
		/**
		 * Filter the language list to only show languages that match the current search term.
		 * @memberof LanguageOverlay
		 * @instance
		 * @param {string} val of search term (lowercase).
		 */
		filterLanguages: function ( val ) {
			var filteredList = [];

			if ( val ) {
				this.options.languages.forEach( function ( language ) {
					var langname = language.langname;
					// search by language code or language name
					if ( language.autonym.toLowerCase().indexOf( val ) > -1 ||
							( langname && langname.toLowerCase().indexOf( val ) > -1 ) ||
							language.lang.toLowerCase().indexOf( val ) > -1
					) {
						filteredList.push( language.lang );
					}
				} );

				if ( this.options.variants ) {
					this.options.variants.forEach( function ( variant ) {
						// search by variant code or variant name
						if ( variant.autonym.toLowerCase().indexOf( val ) > -1 ||
							variant.lang.toLowerCase().indexOf( val ) > -1
						) {
							filteredList.push( variant.lang );
						}
					} );
				}

				this.$languageItems.addClass( 'hidden' );
				if ( filteredList.length ) {
					this.$siteLinksList.find( '.' + filteredList.join( ',.' ) ).removeClass( 'hidden' );
				}
				this.$siteLinksList.addClass( 'filtered' );
				this.$subheaders.addClass( 'hidden' );
			} else {
				this.$languageItems.removeClass( 'hidden' );
				this.$siteLinksList.removeClass( 'filtered' );
				this.$subheaders.removeClass( 'hidden' );
			}
		}
	} );

	M.define( 'mobile.languages.structured/LanguageOverlay', LanguageOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
