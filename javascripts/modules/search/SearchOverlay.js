( function ( M, $ ) {

	var
		Overlay = M.require( 'Overlay' ),
		SearchApi = M.require( 'modules/search/SearchApi' ),
		Icon = M.require( 'Icon' ),
		PageList = M.require( 'modules/PageList' ),
		SEARCH_DELAY = 300,
		$html = $( 'html' ),
		router = M.require( 'router' ),
		SearchOverlay;

	/**
	 * Overlay displaying search results
	 * @class SearchOverlay
	 * @extends Overlay
	 * @uses PageList
	 * @uses SearchApi
	 * @uses Icon
	 */
	SearchOverlay = Overlay.extend( {
		className: 'overlay search-overlay',
		template: mw.template.get( 'mobile.search', 'SearchOverlay.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.clearIcon HTML of the button that clears the search text.
		 * @cfg {String} defaults.searchTerm Search text.
		 * @cfg {String} defaults.placeholderMsg Search input placeholder text.
		 * @cfg {String} defaults.clearMsg Tooltip for clear button that appears when you type
		 * into search box.
		 * @cfg {String} defaults.searchContentMsg Caption for a button performing full text
		 * search of a given search query.
		 * @cfg {String} defaults.noResultsMsg Message informing user that no pages were found
		 * for a given query.
		 * @cfg {String} defaults.searchContentNoResultsMsg Used when no pages with matching
		 * titles were found.
		 * @cfg {String} defaults.action The value of wgScript
		 */
		defaults: {
			clearIcon: new Icon( {
				tagName: 'button',
				name: 'clear',
				label: mw.msg( 'mobile-frontend-clear-search' ),
				additionalClassNames: 'clear'
			} ).toHtmlString(),
			searchTerm: '',
			placeholderMsg: $( '#searchInput' ).attr( 'placeholder' ),
			searchContentMsg: mw.msg( 'mobile-frontend-search-content' ),
			noResultsMsg: mw.msg( 'mobile-frontend-search-no-results' ),
			searchContentNoResultsMsg: mw.msg( 'mobile-frontend-search-content-no-results' ),
			action: mw.config.get( 'wgScript' )
		},

		/**
		 * Hide self when the route is visited
		 * @method
		 * @private
		 * FIXME: Remove when search registers route with overlay manager
		 */
		_hideOnRoute: function () {
			var self = this;
			router.once( 'route', function ( ev ) {
				if ( !self.hide() ) {
					ev.preventDefault();
					self._hideOnRoute();
				}
			} );
		},

		/** @inheritdoc */
		initialize: function ( options ) {
			var self = this;
			Overlay.prototype.initialize.call( this, options );
			this.api = new SearchApi();

			// FIXME: Remove when search registers route with overlay manager
			// we need this because of the focus/delay hack in search.js
			router.once( 'route', function () {
				self._hideOnRoute();
			} );
		},

		/** @inheritdoc */
		postRender: function ( options ) {
			var
				self = this,
				$clear = this.$( '.clear' ),
				$form = this.$( 'form' );

			// Make sure search overlay lines up with search header when the overlay is
			// rendered. This is necessary to prevent bug 67140 while sitenotices are
			// displayed.
			this.$( '.overlay-header-container' ).css( 'top', $( '.header' ).offset().top );
			// No search happening by default
			this.$( '.spinner' ).hide();

			Overlay.prototype.postRender.call( this, options );

			this.$input = this.$( 'input' ).on( 'input', function () {
				// Make sure search header is docked to the top of the screen when the
				// user begins typing so that there is adequate space for search results
				// above the keyboard. (This is only a potential issue when sitenotices
				// are displayed.)
				self.$( '.overlay-header-container' ).css( 'top', 0 );
				self.performSearch();
				$clear.toggle( self.$input.val() !== '' );
			} );

			// Hide the clear button if the search input is empty
			if ( self.$input.val() === '' ) {
				$clear.hide();
			}
			// initialize the button that clears the search field
			$clear.on( 'click', function () {
				self.$input.val( '' ).focus();
				self.performSearch();
				$clear.hide();
			} );

			// Initialize 'search within pages' functionality
			this.$searchContent = this.$( '.search-content' )
				.hide()
				// can't use $.proxy because it would pass ev to submit() which would
				// be treated as alternative form data
				.on( 'click', function () {
					window.history.back();
					// Add fulltext input to force fulltext search
					$( '<input>' )
						.attr( {
							type: 'hidden',
							name: 'fulltext',
							value: 'search'
						} )
						.appendTo( $form );
					$form.submit();
				} );

			// tapping on background only should hide the overlay
			this.$overlayContent
				.on( 'click', function () {
					self.$( '.cancel' ).trigger( 'click' );
				} )
				.find( '> div' ).on( 'click', function ( ev ) {
					ev.stopPropagation();
				} );

			// hide the keyboard when scrolling starts (avoid weird situation when
			// user taps on an item, the keyboard hides and wrong item is clicked)
			this.$( '.results' ).on( 'touchstart mousedown', function () {
				self.$input.blur();
			} );
		},

		/** @inheritdoc */
		show: function () {
			var len = this.$input.val().length;
			Overlay.prototype.show.apply( this, arguments );
			this.$input.focus();
			// Cursor to the end of the input
			if ( this.$input[0].setSelectionRange ) {
				this.$input[0].setSelectionRange( len, len );
			}
		},

		/**
		 * Fade out if the browser supports animations
		 * @inheritdoc
		 */
		hide: function () {
			var self = this;

			if ( $html.hasClass( 'animations' ) ) {
				self.$el.addClass( 'fade-out' );
				setTimeout( function () {
					Overlay.prototype.hide.apply( self, arguments );
				}, 500 );
			} else {
				Overlay.prototype.hide.apply( self, arguments );
			}
			return true;
		},

		/**
		 * Perform search and render results inside current view.
		 * @method
		 */
		performSearch: function () {
			var
				self = this,
				pageList,
				query = this.$input.val(),
				$results = this.$( '.results' );

			// it seems the input event can be fired when virtual keyboard is closed
			// (Chrome for Android)
			if ( query !== this.lastQuery ) {
				this.api.abort();
				clearTimeout( this.timer );
				self.$searchContent.hide();
				$results.empty();

				if ( query.length ) {
					this.$( '.spinner' ).show();

					this.timer = setTimeout( function () {
						self.api.search( query ).done( function ( data ) {
							// check if we're getting the rights response in case of out of
							// order responses (need to get the current value of the input)
							if ( data.query === self.$input.val() ) {
								self.$searchContent
									.show()
									.find( 'p' )
									.hide()
									.filter( data.results.length ? '.with-results' : '.without-results' )
									.show();
								self.$( '.spinner' ).hide();
								pageList = new PageList( {
									pages: data.results,
									el: $results
								} );
								pageList.renderPageImages();
								/**
								 * @event search-results
								 * Fired when search API returns results
								 */
								M.emit( 'search-results', self, data.results );
							}
						} );
					}, this.api.isCached( query ) ? 0 : SEARCH_DELAY );
				} else {
					self.$( '.spinner' ).hide();
				}

				this.lastQuery = query;
			}
		}
	} );

	M.define( 'modules/search/SearchOverlay', SearchOverlay );

}( mw.mobileFrontend, jQuery ) );
