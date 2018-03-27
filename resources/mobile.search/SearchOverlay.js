( function ( M ) {

	var
		Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		WatchstarPageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		SEARCH_DELAY = 300,
		SEARCH_SPINNER_DELAY = 2000,
		feedbackLink = mw.config.get( 'wgCirrusSearchFeedbackLink' );

	/**
	 * Overlay displaying search results
	 * @class SearchOverlay
	 * @extends Overlay
	 * @uses SearchGateway
	 * @uses Icon
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function SearchOverlay( options ) {
		Overlay.call( this, options );
		this.api = options.api;
		// eslint-disable-next-line new-cap
		this.gateway = new options.gatewayClass( this.api );

		this.router = options.router;
	}

	OO.mfExtend( SearchOverlay, Overlay, {
		isBorderBox: false,
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			header: mw.template.get( 'mobile.search', 'header.hogan' ),
			content: mw.template.get( 'mobile.search', 'content.hogan' ),
			icon: Icon.prototype.template
		} ),
		className: 'overlay search-overlay',
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {SearchGateway} defaults.gatewayClass The class to use to setup an API gateway.
		 *  FIXME: Should be removed when wikidata descriptions in stable (T101719)
		 * @cfg {Router} defaults.router instance
		 * @cfg {Object} defaults.clearIcon options for the button that clears the search text.
		 * @cfg {Object} defaults.searchContentIcon options for the button that allows you to search within content
		 * @cfg {string} defaults.searchTerm Search text.
		 * @cfg {string} defaults.placeholderMsg Search input placeholder text.
		 * @cfg {string} defaults.clearMsg Tooltip for clear button that appears when you type
		 * into search box.
		 * @cfg {string} defaults.searchContentMsg Caption for a button performing full text
		 * search of a given search query.
		 * @cfg {string} defaults.noResultsMsg Message informing user that no pages were found
		 * for a given query.
		 * @cfg {string} defaults.searchContentNoResultsMsg Used when no pages with matching
		 * titles were found.
		 * @cfg {string} defaults.action The value of wgScript
		 * @cfg {Object} defaults.feedback options for the feedback link below the search results
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
			headerChrome: true,
			clearIcon: new Icon( {
				tagName: 'button',
				name: 'clear',
				isSmall: true,
				label: mw.msg( 'mobile-frontend-clear-search' ),
				additionalClassNames: 'clear'
			} ).options,
			searchContentIcon: new Icon( {
				tagName: 'a',
				// When this icon is clicked we want to reset the hash for subsequent views
				href: '#',
				name: 'search-content',
				label: mw.msg( 'mobile-frontend-search-content' )
			} ).options,
			searchTerm: '',
			placeholderMsg: '',
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
		events: util.extend( {}, Overlay.prototype.events, {
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
		 * Make sure search header is docked to the top of the screen when the
		 * user begins typing so that there is adequate space for search results
		 * above the keyboard. (This is only a potential issue when sitenotices
		 * are displayed.)
		 */
		onInputInput: function () {
			this.performSearch();
			this.$clear.toggle( this.$input.val() !== '' );
		},

		/**
		 * Initialize the button that clears the search field
		 * @return {boolean} False to cancel the native event
		 */
		onClickClear: function () {
			this.$input.val( '' ).focus();
			this.performSearch();
			this.$clear.hide();
			// In beta the clear button is on top of the search input.
			// Stop propagation so that the input doesn't receive the click.
			return false;
		},

		/**
		 * Initialize 'search within pages' functionality
		 */
		onClickSearchContent: function () {
			var $el = util.getDocument().find( 'body' ),
				$form = this.$( 'form' );

			// Add fulltext input to force fulltext search
			this.parseHTML( '<input>' )
				.attr( {
					type: 'hidden',
					name: 'fulltext',
					value: 'search'
				} )
				.appendTo( $form );
			// history.back queues a task so might run after this call. Thus we use setTimeout
			// http://www.w3.org/TR/2011/WD-html5-20110113/webappapis.html#queue-a-task
			setTimeout( function () {
				// Firefox doesn't allow submission of a form not in the DOM so temporarily re-add it
				$form.appendTo( $el );
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
			var $link = this.$( ev.currentTarget ),
				$result = $link.closest( 'li' );

			/**
			 * @event search-result-click Fired when the user clicks a search result
			 * @type {Object}
			 * @property {jQuery.Object} result The jQuery-wrapped DOM element that
			 *  the user clicked
			 * @property {number} resultIndex The zero-based index of the
			 *  result in the set of results
			 * @property {jQuery.Event} originalEvent The original event
			 */
			this.emit( 'search-result-click', {
				result: $result,
				resultIndex: this.$results.index( $result ),
				originalEvent: ev
			} );

			// FIXME: ugly hack that removes search from browser history when navigating to search results
			ev.preventDefault();
			this.router.back().done( function () {
				// Router.navigate does not support changing href.
				// FIXME: Needs upstream change T189173
				// eslint-disable-next-line no-restricted-properties
				window.location.href = $link.attr( 'href' );
			} );
		},

		/** @inheritdoc */
		postRender: function () {
			var self = this,
				timer;

			Overlay.prototype.postRender.call( this );

			this.$input = this.$( 'input' );
			this.$clear = this.$( '.clear' );
			this.$searchContent = this.$( '.search-content' ).hide();
			this.$searchFeedback = this.$( '.search-feedback' ).hide();
			this.$resultContainer = this.$( '.results-list-container' );

			/**
			 * Hide the spinner and abort timed spinner shows.
			 * @ignore
			 */
			function clearSearch() {
				self.$spinner.hide();
				clearTimeout( timer );
			}

			// Show a spinner on top of search results
			this.$spinner = this.$( '.spinner-container' );
			this.on( 'search-start', function ( searchData ) {
				if ( timer ) {
					clearSearch();
				}
				timer = setTimeout( function () {
					self.$spinner.show();
				}, SEARCH_SPINNER_DELAY - searchData.delay );
			} );
			this.on( 'search-results', clearSearch );

			// Hide the clear button if the search input is empty
			if ( self.$input.val() === '' ) {
				this.$clear.hide();
			}
		},

		/**
		 * Trigger a focus() event on search input in order to
		 * bring up the virtual keyboard.
		 * @method
		 */
		showKeyboard: function () {
			var len = this.$input.val().length;
			this.$input.focus();
			// Cursor to the end of the input
			if ( this.$input[0].setSelectionRange ) {
				this.$input[0].setSelectionRange( len, len );
			}
		},

		/** @inheritdoc */
		show: function () {
			// Overlay#show defines the actual overlay visibility.
			Overlay.prototype.show.apply( this, arguments );

			this.showKeyboard();
			/**
			 * @event search-show Fired after the search overlay is shown
			 */
			this.emit( 'search-show' );
		},

		/**
		 * Fade out if the browser supports animations
		 * @inheritdoc
		 */
		hide: function () {
			var self = this,
				$html = util.getDocument();

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
				query = this.$input.val(),
				delay = this.gateway.isCached( query ) ? 0 : SEARCH_DELAY;

			// it seems the input event can be fired when virtual keyboard is closed
			// (Chrome for Android)
			if ( query !== this.lastQuery ) {
				if ( self._pendingQuery ) {
					self._pendingQuery.abort();
				}
				clearTimeout( this.timer );

				if ( query.length ) {
					this.timer = setTimeout( function () {
						var xhr;

						/**
						 * @event search-start Fired immediately before the search API request is
						 *  sent
						 * @property {Object} data related to the current search
						 */
						self.emit( 'search-start', {
							query: query,
							delay: delay
						} );

						xhr = self.gateway.search( query );
						self._pendingQuery = xhr.then( function ( data ) {
							// check if we're getting the rights response in case of out of
							// order responses (need to get the current value of the input)
							if ( data && data.query === self.$input.val() ) {
								self.$el.toggleClass( 'no-results', data.results.length === 0 );
								self.$searchContent
									.show()
									.find( 'p' )
									.hide()
									.filter( data.results.length ? '.with-results' : '.without-results' )
									.show();

								// eslint-disable-next-line no-new
								new WatchstarPageList( {
									api: api,
									funnel: 'search',
									pages: data.results,
									el: self.$resultContainer
								} );

								self.$results = self.$resultContainer.find( 'li' );

								/**
								 * @event search-results Fired when search API returns results
								 * @type {Object}
								 * @property {Object[]} results The results returned by the search
								 *  API
								 */
								self.emit( 'search-results', {
									results: data.results
								} );
							}
						} ).promise( { abort: function () { xhr.abort(); } } );
					}, delay );
				} else {
					self.resetSearch();
				}

				this.lastQuery = query;
			}
		},
		/**
		 * Clear results
		 *
		 * @private
		 */
		resetSearch: function () {
			this.$spinner.hide();
			this.$searchContent.hide();
			this.$searchFeedback.hide();
			this.$resultContainer.empty();
		}
	} );

	M.define( 'mobile.search/SearchOverlay', SearchOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
