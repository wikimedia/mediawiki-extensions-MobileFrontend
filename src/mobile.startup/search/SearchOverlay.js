var
	mfExtend = require( '../mfExtend' ),
	Overlay = require( '../Overlay' ),
	util = require( '../util' ),
	Anchor = require( '../Anchor' ),
	Icon = require( '../Icon' ),
	WatchstarPageList = require( '../watchstar/WatchstarPageList' ),
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
 * @param {Object} params Configuration options
 * @fires SearchOverlay#search-show
 * @fires SearchOverlay#search-start
 * @fires SearchOverlay#search-results
 * @fires SearchOverlay#search-result-click
 */
function SearchOverlay( params ) {
	var options = util.extend(
		true,
		{
			isBorderBox: false,
			className: 'overlay search-overlay',
			events: {
				'input input': 'onInputInput',
				'click .clear': 'onClickClear',
				'click .search-content': 'onClickSearchContent',
				'click .overlay-content': 'onClickOverlayContent',
				'click .overlay-content > div': 'onClickOverlayContentDiv',
				'touchstart .results': 'hideKeyboardOnScroll',
				'mousedown .results': 'hideKeyboardOnScroll',
				'click .results a': 'onClickResult'
			}
		},
		params
	);

	Overlay.call( this, options );

	this.api = options.api;
	// eslint-disable-next-line new-cap
	this.gateway = new options.gatewayClass( this.api );

	this.router = options.router;
}

mfExtend( SearchOverlay, Overlay, {
	/**
	 * @memberof SearchOverlay
	 * @instance
	 */
	templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
		header: mw.template.get( 'mobile.startup', 'search/SearchHeader.hogan' ),
		content: mw.template.get( 'mobile.startup', 'search/SearchContent.hogan' ),
		icon: Icon.prototype.template
	} ),
	/**
	 * @memberof SearchOverlay
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {SearchGateway} defaults.gatewayClass The class to use to setup an API gateway.
	 *  FIXME: Should be removed when wikidata descriptions in stable (T101719)
	 * @property {Router} defaults.router instance
	 * @property {Object} defaults.clearIcon options for the button that clears the search text.
	 * @property {Object} defaults.searchContentIcon options for the button that allows you to
	 *  search within content
	 * @property {string} defaults.searchTerm Search text.
	 * @property {string} defaults.placeholderMsg Search input placeholder text.
	 * @property {string} defaults.clearMsg Tooltip for clear button that appears when you type
	 * into search box.
	 * @property {string} defaults.searchContentMsg Caption for a button performing full text
	 * search of a given search query.
	 * @property {string} defaults.noResultsMsg Message informing user that no pages were found
	 * for a given query.
	 * @property {string} defaults.searchContentNoResultsMsg Used when no pages with matching
	 * titles were found.
	 * @property {string} defaults.action The value of wgScript
	 * @property {Object} defaults.feedback options for the feedback link
	 *  below the search results
	 */
	defaults: util.extend( {}, Overlay.prototype.defaults, {
		headerChrome: true,
		clearIcon: new Icon( {
			tagName: 'button',
			name: 'search-clear',
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
		searchContentNoResultsMsg: mw.message( 'mobile-frontend-search-content-no-results' ).parse(),
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
	 * Make sure search header is docked to the top of the screen when the
	 * user begins typing so that there is adequate space for search results
	 * above the keyboard. (This is only a potential issue when sitenotices
	 * are displayed.)
	 * @memberof SearchOverlay
	 * @instance
	 */
	onInputInput: function () {
		this.performSearch();
		this.$clear.toggle( this.$input.val() !== '' );
	},

	/**
	 * Initialize the button that clears the search field
	 * @memberof SearchOverlay
	 * @instance
	 * @return {boolean} False to cancel the native event
	 */
	onClickClear: function () {
		this.$input.val( '' ).trigger( 'focus' );
		this.performSearch();
		this.$clear.hide();
		// In beta the clear button is on top of the search input.
		// Stop propagation so that the input doesn't receive the click.
		return false;
	},

	/**
	 * Initialize 'search within pages' functionality
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
	 * @memberof SearchOverlay
	 * @instance
	 */
	onClickOverlayContent: function () {
		this.$el.find( '.cancel' ).trigger( 'click' );
	},

	/**
	 * Stop propagation
	 * @memberof SearchOverlay
	 * @instance
	 * @param {jQuery.Event} ev
	 */
	onClickOverlayContentDiv: function ( ev ) {
		ev.stopPropagation();
	},

	/**
	 * Hide the keyboard when scrolling starts (avoid weird situation when
	 * user taps on an item, the keyboard hides and wrong item is clicked).
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
			timer;

		Overlay.prototype.postRender.call( this );

		this.$input = this.$el.find( 'input' );
		this.$clear = this.$el.find( '.clear' );
		this.$searchContent = this.$el.find( '.search-content' ).hide();
		this.$searchFeedback = this.$el.find( '.search-feedback' ).hide();
		this.$resultContainer = this.$el.find( '.results-list-container' );

		/**
		 * Hide the spinner and abort timed spinner shows.
		 */
		function clearSearch() {
			self.$spinner.hide();
			clearTimeout( timer );
		}

		// Show a spinner on top of search results
		this.$spinner = this.$el.find( '.spinner-container' );
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
		 * @event SearchOverlay#search-show
		 */
		this.emit( 'search-show' );
	},

	/**
	 * Perform search and render results inside current view.
	 * FIXME: Much of the logic for caching and pending queries inside this function should
	 * actually live in SearchGateway, please move out.
	 * @memberof SearchOverlay
	 * @instance
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
					 * Fired immediately before the search API request is sent
					 * @event SearchOverlay#search-start
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
							 * Fired when search API returns results
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
		this.$spinner.hide();
		this.$searchContent.hide();
		this.$searchFeedback.hide();
		this.$resultContainer.empty();
	}
} );

module.exports = SearchOverlay;
