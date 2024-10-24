const
	mfExtend = require( '../mfExtend' ),
	Overlay = require( '../Overlay' ),
	util = require( '../util' ),
	searchHeader = require( './searchHeader' ),
	SearchResultsView = require( './SearchResultsView' ),
	WatchstarPageList = require( '../watchstar/WatchstarPageList' ),
	SEARCH_DELAY = 300,
	SEARCH_SPINNER_DELAY = 2000;

/**
 * Overlay displaying search results
 *
 * @class SearchOverlay
 * @memberof module:mobile.startup/search
 * @extends Overlay
 * @uses SearchGateway
 * @uses IconButton
 *
 * @param {Object} params Configuration options
 * @param {string} params.placeholderMsg Search input placeholder text.
 * @param {string} [params.action] of form defaults to the value of wgScript
 * @param {string} [params.defaultSearchPage] The default search page e.g. Special:Search
 * @param {SearchGateway} [params.gateway]
 */
function SearchOverlay( params ) {
	const header = searchHeader(
			params.placeholderMsg,
			params.action || mw.config.get( 'wgScript' ),
			( query ) => this.performSearch( query ),
			params.defaultSearchPage || '',
			params.autocapitalize
		),
		options = util.extend( true, {
			headerChrome: true,
			isBorderBox: false,
			className: 'overlay search-overlay',
			headers: [ header ],
			events: {
				'click .search-content': 'onClickSearchContent',
				'click .overlay-content': 'onClickOverlayContent',
				'click .overlay-content > div': function ( ev ) {
					ev.stopPropagation();
				},
				'touchstart .results': 'hideKeyboardOnScroll',
				'mousedown .results': 'hideKeyboardOnScroll',
				'click .results a': 'onClickResult'
			}
		},
		params );

	this.header = header;
	Overlay.call( this, options );

	this.api = options.api;
	// eslint-disable-next-line new-cap
	this.gateway = options.gateway || new options.gatewayClass( this.api );

	this.router = options.router;

	this.currentSearchId = null;
}

mfExtend( SearchOverlay, Overlay, {

	/**
	 * Initialize 'search within pages' functionality
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	onClickSearchContent() {
		const
			$form = this.$el.find( 'form' ),
			$el = $form[0].parentNode;

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
		setTimeout( () => {
			// Firefox doesn't allow submission of a form not in the DOM
			// so temporarily re-add it if it's gone.
			if ( !$form[0].parentNode ) {
				$form.appendTo( $el );
			}
			$form.trigger( 'submit' );
		}, 0 );
	},

	/**
	 * Tapping on background only should hide the overlay
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	onClickOverlayContent() {
		this.$el.find( '.cancel' ).trigger( 'click' );
	},

	/**
	 * Hide the keyboard when scrolling starts (avoid weird situation when
	 * user taps on an item, the keyboard hides and wrong item is clicked).
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	hideKeyboardOnScroll() {
		this.$input.trigger( 'blur' );
	},

	/**
	 * Handle the user clicking a result.
	 *
	 * @memberof SearchOverlay
	 * @instance
	 * @param {jQuery.Event} ev
	 */
	onClickResult( ev ) {
		const
			self = this,
			$link = this.$el.find( ev.currentTarget );
		/**
		 * Fired when the user clicks a search result
		 *
		 * @type {Object}
		 * @property {jQuery.Object} result The jQuery-wrapped DOM element that
		 *  the user clicked
		 * @property {number} resultIndex The zero-based index of the
		 *  result in the set of results
		 * @property {jQuery.Event} originalEvent The original event
		 */
		// FIXME: ugly hack that removes search from browser history
		// when navigating to search results
		ev.preventDefault();
		this.router.back().then( () => {
			// T308288: Appends the current search id as a url param on clickthroughs
			if ( self.currentSearchId ) {
				const clickUrl = new URL( location.href );
				clickUrl.searchParams.set( 'searchToken', self.currentSearchId );
				self.router.navigateTo( document.title, {
					path: clickUrl.toString(),
					useReplaceState: true
				} );
				self.currentSearchId = null;
			}
			// Router.navigate does not support changing href.
			// FIXME: Needs upstream change T189173
			// eslint-disable-next-line no-restricted-properties
			window.location.href = $link.attr( 'href' );
		} );
	},

	/**
	 * @inheritdoc
	 * @memberof SearchOverlay
	 * @instance
	 */
	postRender() {
		const self = this,
			searchResults = new SearchResultsView( {
				searchContentLabel: mw.msg( 'mobile-frontend-search-content' ),
				noResultsMsg: mw.msg( 'mobile-frontend-search-no-results' ),
				searchContentNoResultsMsg: mw.message( 'mobile-frontend-search-content-no-results' ).parse()
			} );
		let timer;

		this.$el.find( '.overlay-content' ).append( searchResults.$el );
		Overlay.prototype.postRender.call( this );

		// FIXME: `this.$input` should not be set. Isolate to searchHeader function
		this.$input = this.$el.find( this.header ).find( 'input' );
		// FIXME: `this.$searchContent` should not be set. Isolate to SearchResultsView class.
		this.$searchContent = searchResults.$el.hide();
		// FIXME: `this.$resultContainer` should not be set. Isolate to SearchResultsView class.
		this.$resultContainer = searchResults.$el.find( '.results-list-container' );

		// On iOS a touchstart event while the keyboard is open will result in a scroll
		// leading to an accidental click (T299846)
		// Stopping propagation when the input is focused will prevent scrolling while
		// the keyboard is collapsed.
		this.$resultContainer[0].addEventListener( 'touchstart', ( ev ) => {
			if ( document.activeElement === this.$input[0] ) {
				ev.stopPropagation();
			}
		} );

		/**
		 * Hide the spinner and abort timed spinner shows.
		 * FIXME: Given this manipulates SearchResultsView this should be moved into that class
		 */
		function clearSearch() {
			self.$spinner.hide();
			clearTimeout( timer );
		}

		// Show a spinner on top of search results
		// FIXME: Given this manipulates SearchResultsView this should be moved into that class
		this.$spinner = searchResults.$el.find( '.spinner-container' );
		this.on( 'search-start', ( searchData ) => {
			if ( timer ) {
				clearSearch();
			}
			timer = setTimeout( () => self.$spinner.show(),
				SEARCH_SPINNER_DELAY - searchData.delay );
		} );
		this.on( 'search-results', clearSearch );
	},

	/**
	 * Trigger a focus() event on search input in order to
	 * bring up the virtual keyboard.
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	showKeyboard() {
		const len = this.$input.val().length;
		this.$input.trigger( 'focus' );
		// Cursor to the end of the input
		if ( this.$input[0].setSelectionRange ) {
			this.$input[0].setSelectionRange( len, len );
		}
	},

	/**
	 * @inheritdoc
	 * @memberof SearchOverlay
	 * @instance
	 */
	show() {
		// Overlay#show defines the actual overlay visibility.
		Overlay.prototype.show.apply( this, arguments );

		this.showKeyboard();
	},

	/**
	 * Perform search and render results inside current view.
	 * FIXME: Much of the logic for caching and pending queries inside this function should
	 * actually live in SearchGateway, please move out.
	 *
	 * @memberof SearchOverlay
	 * @instance
	 * @param {string} query
	 */
	performSearch( query ) {
		const
			self = this,
			api = this.api,
			delay = this.gateway.isCached( query ) ? 0 : SEARCH_DELAY;

		// it seems the input event can be fired when virtual keyboard is closed
		// (Chrome for Android)
		if ( query !== this.lastQuery ) {
			if ( self._pendingQuery ) {
				self._pendingQuery.abort();
			}
			clearTimeout( this.timer );

			if ( query.length ) {
				this.timer = setTimeout( () => {
					const xhr = self.gateway.search( query );
					self._pendingQuery = xhr.then( ( data ) => {
						self.currentSearchId = data.searchId;
						// FIXME: Given this manipulates SearchResultsView
						// this should be moved into that class
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
								api,
								funnel: 'search',
								pages: data.results,
								el: self.$resultContainer
							} );

							self.$results = self.$resultContainer.find( 'li' );
						}
					} ).promise( {
						abort() {
							xhr.abort();
						}
					} );
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
	resetSearch() {
		this.$el.find( '.overlay-content' ).children().hide();
	}
} );

module.exports = SearchOverlay;
