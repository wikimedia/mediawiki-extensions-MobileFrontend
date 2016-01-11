( function ( M, $ ) {

	var
		Overlay = M.require( 'mobile.overlays/Overlay' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		WatchstarPageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		SEARCH_DELAY = 300,
		$html = $( 'html' ),
		router = M.require( 'mobile.startup/router' ),
		feedbackLink = mw.config.get( 'wgCirrusSearchFeedbackLink' );

	/**
	 * Overlay displaying search results
	 * @class SearchOverlay
	 * @extends Overlay
	 * @uses SearchGateway
	 * @uses Icon
	 */
	function SearchOverlay( options ) {
		var self = this;
		Overlay.call( this, options );
		this.api = options.api;
		this.gateway = new options.gatewayClass( this.api );

		// FIXME: Remove when search registers route with overlay manager
		// we need this because of the focus/delay hack in search.js
		router.once( 'route', function () {
			self._hideOnRoute();
		} );
	}

	OO.mfExtend( SearchOverlay, Overlay, {
		templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
			anchor: Anchor.prototype.template,
			icon: Icon.prototype.template
		} ),
		className: 'overlay search-overlay',
		template: mw.template.get( 'mobile.search', 'SearchOverlay.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {SearchGateway} defaults.gatewayClass The class to use to setup an API gateway.
		 *  FIXME: Should be removed when wikidata descriptions in stable (T101719)
		 * @cfg {Object} defaults.clearIcon options for the button that clears the search text.
		 * @cfg {Object} defaults.searchContentIcon options for the button that allows you to search within content
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
		 * @cfg {Object} defaults.feedback options for the feedback link below the search results
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			clearIcon: new Icon( {
				tagName: 'button',
				name: 'clear',
				label: mw.msg( 'mobile-frontend-clear-search' ),
				additionalClassNames: 'clear'
			} ).options,
			searchContentIcon: new Icon( {
				tagName: 'button',
				name: 'search-content',
				label: mw.msg( 'mobile-frontend-search-content' )
			} ).options,
			searchTerm: '',
			placeholderMsg: $( '#searchInput' ).attr( 'placeholder' ),
			noResultsMsg: mw.msg( 'mobile-frontend-search-no-results' ),
			searchContentNoResultsMsg: mw.msg( 'mobile-frontend-search-content-no-results' ),
			action: mw.config.get( 'wgScript' ),
			feedback: !feedbackLink ? false : {
				feedback: new Anchor( {
					label: mw.msg( 'mobile-frontend-search-feedback-link-text' ),
					href: feedbackLink
				} ).options,
				prompt: mw.msg( 'mobile-frontend-search-feedback-prompt' )
			}
		} ),
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, Overlay.prototype.events, {
			'input input': 'onInputInput',
			'click .clear': 'onClickClear',
			'click .search-content': 'onClickSearchContent',
			'click .overlay-content': 'onClickOverlayContent',
			'click .overlay-content > div': 'onClickOverlayContentDiv',
			'touchstart .results': 'hideKeyboardOnScroll',
			'mousedown .results': 'hideKeyboardOnScroll',
			'click .results a': 'onClickResult'
		} ),

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

		/**
		 * SearchOverlay is not managed by OverlayManager and using window.history.back() causes
		 * problems described in T102946, i.e. the users should not be taken to the previous page
		 * when landing on /wiki/Foo#/search directly. The overlay should just close.
		 * @inheritdoc
		 * @param {Object} ev Event Object
		 */
		onExit: function ( ev ) {
			ev.preventDefault();
			ev.stopPropagation();
			this.hide();
			window.location.hash = '';
		},

		/**
		 * Make sure search header is docked to the top of the screen when the
		 * user begins typing so that there is adequate space for search results
		 * above the keyboard. (This is only a potential issue when sitenotices
		 * are displayed.)
		 */
		onInputInput: function () {
			this.$( '.overlay-header-container' ).css( 'top', 0 );
			this.performSearch();
			this.$clear.toggle( this.$input.val() !== '' );
		},

		/**
		 * Initialize the button that clears the search field
		 */
		onClickClear: function () {
			this.$input.val( '' ).focus();
			this.performSearch();
			this.$clear.hide();
		},

		/**
		 * Initialize 'search within pages' functionality
		 */
		onClickSearchContent: function () {
			var $form = this.$( 'form' );

			window.history.back();

			// Add fulltext input to force fulltext search
			$( '<input>' )
				.attr( {
					type: 'hidden',
					name: 'fulltext',
					value: 'search'
				} )
				.appendTo( $form );
			// history.back queues a task so might run after this call. Thus we use setTimeout
			// http://www.w3.org/TR/2011/WD-html5-20110113/webappapis.html#queue-a-task
			window.setTimeout( function () {
				// Firefox doesn't allow submission of a form not in the DOM so temporarily re-add it
				$form.appendTo( document.body );
				$form.submit();
			}, 0 );
		},

		/**
		 * Tapping on background only should hide the overlay
		 */
		onClickOverlayContent: function () {
			this.$( '.cancel' ).trigger( 'click' );
		},

		/**
		 * Stop propagation
		 * @param {jQuery.Event} ev
		 */
		onClickOverlayContentDiv: function ( ev ) {
			ev.stopPropagation();
		},

		/**
		 * Hide the keyboard when scrolling starts (avoid weird situation when
		 * user taps on an item, the keyboard hides and wrong item is clicked).
		 */
		hideKeyboardOnScroll: function () {
			this.$input.blur();
		},

		/**
		 * Handle the user clicking a result.
		 *
		 * @param {jQuery.Event} ev
		 */
		onClickResult: function ( ev ) {
			var $link = $( ev.currentTarget ),
				$result = $link.closest( 'li' );

			/**
			 * @event search-result-click Fired when the user clicks a search result
			 * @type {Object}
			 * @property {jQuery.Object} result The jQuery-wrapped DOM element that
			 *  the user clicked
			 * @property {Number} resultIndex The zero-based index of the
			 *  result in the set of results
			 * @property {jQuery.Event} originalEvent The original event
			 */
			M.emit( 'search-result-click', {
				result: $result,
				resultIndex: this.$results.index( $result ),
				originalEvent: ev
			} );

			// FIXME: ugly hack that removes search from browser history when navigating to search results
			ev.preventDefault();
			router.back().done( function () {
				window.location.href = $link.attr( 'href' );
			} );
		},

		/** @inheritdoc */
		postRender: function () {
			var self = this;

			// Make sure search overlay lines up with search header when the overlay is
			// rendered. This is necessary to prevent bug 67140 while sitenotices are
			// displayed.
			this.$( '.overlay-header-container' ).css( 'top', $( '.header' ).offset().top );
			// No search happening by default
			this.$( '.spinner' ).hide();

			Overlay.prototype.postRender.call( this );

			this.$input = this.$( 'input' );
			this.$clear = this.$( '.clear' );
			this.$searchContent = this.$( '.search-content' ).hide();
			this.$searchFeedback = this.$( '.search-feedback' ).hide();

			// Hide the clear button if the search input is empty
			if ( self.$input.val() === '' ) {
				this.$clear.hide();
			}
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

			/**
			 * @event search-show Fired after the search overlay is shown
			 */
			M.emit( 'search-show' );
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
		 * FIXME: Much of the logic for caching and pending queries inside this function should
		 * actually live in SearchGateway, please move out.
		 * @method
		 */
		performSearch: function () {
			var
				self = this,
				api = this.api,
				pageList,
				query = this.$input.val(),
				$resultContainer = this.$( '.results' );

			// it seems the input event can be fired when virtual keyboard is closed
			// (Chrome for Android)
			if ( query !== this.lastQuery ) {
				if ( self._pendingQuery ) {
					self._pendingQuery.abort();
				}
				clearTimeout( this.timer );
				self.$searchContent.hide();
				self.$searchFeedback.hide();
				$resultContainer.empty();

				if ( query.length ) {
					this.$( '.spinner' ).show();

					this.timer = setTimeout( function () {

						// FIXME: The query might be useful here, bit it ain't necessary right now.
						/**
						 * @event search-start Fired immediately before the search API request is
						 *  sent
						 */
						M.emit( 'search-start' );

						self._pendingQuery = self.gateway.search( query ).done( function ( data ) {
							// check if we're getting the rights response in case of out of
							// order responses (need to get the current value of the input)
							if ( data.query === self.$input.val() ) {
								self.$el.toggleClass( 'no-results', data.results.length === 0 );
								self.$searchFeedback.show();
								self.$searchContent
									.show()
									.find( 'p' )
									.hide()
									.filter( data.results.length ? '.with-results' : '.without-results' )
									.show();
								self.$( '.spinner' ).hide();
								pageList = new WatchstarPageList( {
									api: api,
									funnel: 'search',
									pages: data.results,
									el: $resultContainer
								} );

								self.$results = $resultContainer.find( 'li' );

								/**
								 * @event search-results Fired when search API returns results
								 * @type {Object}
								 * @property {Object[]} results The results returned by the search
								 *  API
								 */
								M.emit( 'search-results', {
									results: data.results
								} );
							}
						} );
					}, this.gateway.isCached( query ) ? 0 : SEARCH_DELAY );
				} else {
					self.$( '.spinner' ).hide();
				}

				this.lastQuery = query;
			}
		}
	} );

	M.define( 'mobile.search/SearchOverlay', SearchOverlay );

}( mw.mobileFrontend, jQuery ) );
