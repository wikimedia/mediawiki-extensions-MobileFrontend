var
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
 * @extends Overlay
 * @uses SearchGateway
 * @uses Icon
 *
 * @param {Object} params Configuration options
 * @param {string} params.placeholderMsg Search input placeholder text.
 * @param {string} [params.action] of form defaults to the value of wgScript
 * @param {SearchGateway} [params.gateway]
 * @fires SearchOverlay#search-show
 * @fires SearchOverlay#search-start
 * @fires SearchOverlay#search-results
 * @fires SearchOverlay#search-result-click
 */
function SearchOverlay( params ) {
	var header = searchHeader(
			params.placeholderMsg,
			params.action || mw.config.get( 'wgScript' ),
			function ( query ) {
				this.performSearch( query );
			}.bind( this )
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
}

mfExtend( SearchOverlay, Overlay, {

	/**
	 * Initialize 'search within pages' functionality
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	onClickSearchContent: function () {
		var $el = util.getDocument().find( 'body' ),
			$form = this.$el.find( 'form' );

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
			// Firefox doesn't allow submission of a form not in the DOM
			// so temporarily re-add it
			$form.appendTo( $el );
			$form.trigger( 'submit' );
		}, 0 );
	},

	/**
	 * Tapping on background only should hide the overlay
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	onClickOverlayContent: function () {
		this.$el.find( '.cancel' ).trigger( 'click' );
	},

	/**
	 * Hide the keyboard when scrolling starts (avoid weird situation when
	 * user taps on an item, the keyboard hides and wrong item is clicked).
	 *
	 * @memberof SearchOverlay
	 * @instance
	 */
	hideKeyboardOnScroll: function () {
		this.$input.trigger( 'blur' );
	},

	/**
	 * Handle the user clicking a result.
	 *
	 * @memberof SearchOverlay
	 * @instance
	 * @param {jQuery.Event} ev
	 */
	onClickResult: function ( ev ) {
		var $link = this.$el.find( ev.currentTarget ),
			$result = $link.closest( 'li' );
		/**
		 * Fired when the user clicks a search result
		 *
		 * @event SearchOverlay#search-result-click
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

		// FIXME: ugly hack that removes search from browser history
		// when navigating to search results
		ev.preventDefault();
		this.router.back().then( function () {
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
	postRender: function () {
		var self = this,
			searchResults = new SearchResultsView( {
				searchContentLabel: mw.msg( 'mobile-frontend-search-content' ),
				noResultsMsg: mw.msg( 'mobile-frontend-search-no-results' ),
				searchContentNoResultsMsg: mw.message( 'mobile-frontend-search-content-no-results' ).parse()
			} ),
			timer;

		this.$el.find( '.overlay-content' ).append( searchResults.$el );
		Overlay.prototype.postRender.call( this );

		// FIXME: `this.$input` should not be set. Isolate to searchHeader function
		this.$input = this.$el.find( this.header ).find( 'input' );
		// FIXME: `this.$searchContent` should not be set. Isolate to SearchResultsView class.
		this.$searchContent = searchResults.$el.hide();
		// FIXME: `this.$resultContainer` should not be set. Isolate to SearchResultsView class.
		this.$resultContainer = searchResults.$el.find( '.results-list-container' );

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
		this.on( 'search-start', function ( searchData ) {
			if ( timer ) {
				clearSearch();
			}
			timer = setTimeout( function () {
				self.$spinner.show();
			}, SEARCH_SPINNER_DELAY - searchData.delay );
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
	showKeyboard: function () {
		var len = this.$input.val().length;
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
	show: function () {
		// Overlay#show defines the actual overlay visibility.
		Overlay.prototype.show.apply( this, arguments );

		this.showKeyboard();
		/**
		 * Fired after the search overlay is shown
		 *
		 * @event SearchOverlay#search-show
		 */
		this.emit( 'search-show' );
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
	performSearch: function ( query ) {
		var
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
				this.timer = setTimeout( function () {
					var xhr;
					/**
					 * Fired immediately before the search API request is sent
					 *
					 * @event SearchOverlay#search-start
					 * @property {Object} data related to the current search
					 */
					self.emit( 'search-start', {
						query: query,
						delay: delay
					} );

					xhr = self.gateway.search( query );
					self._pendingQuery = xhr.then( function ( data ) {
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
								api: api,
								funnel: 'search',
								pages: data.results,
								el: self.$resultContainer
							} );

							self.$results = self.$resultContainer.find( 'li' );

							/**
							 * Fired when search API returns results
							 *
							 * @event SearchOverlay#search-results
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
		this.$el.find( '.overlay-content' ).children().hide();
	}
} );

module.exports = SearchOverlay;
