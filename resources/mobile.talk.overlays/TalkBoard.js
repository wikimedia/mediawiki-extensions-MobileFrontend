( function ( M ) {
	var util = M.require( 'mobile.startup/util' ),
		View = M.require( 'mobile.startup/View' ),
		PageGateway = M.require( 'mobile.startup/PageGateway' ),
		icons = M.require( 'mobile.startup/icons' ),
		Page = M.require( 'mobile.startup/Page' );
	/**
	 * Board of talk topics
	 * @class TalkBoard
	 * @extends View
	 * @uses Page
	 * @uses PageGateway
	 * @param {Object} options
	 * @param {Section[]} [options.headings] for rendering heading links.
	 *   Api will be used if absent.
	 * @param {mw.Api} options.api
	 * @param {OO.EventEmitter} options.eventBus Object used to listen for
	 * talk-discussion-added events
	 */
	function TalkBoard( options ) {
		this.eventBus = options.eventBus;
		this.pageGateway = new PageGateway( options.api );
		View.call( this,
			util.extend( options, {
				className: 'talk-board'
			} )
		);
	}

	OO.mfExtend( TalkBoard, View, {
		isTemplateMode: true,
		template: mw.template.get( 'mobile.talk.overlays', 'TalkBoard.hogan' ),
		/**
		 * @inheritdoc
		 * @memberof TalkBoard
		 * @instance
		 */
		postRender: function ( options ) {
			View.prototype.postRender.call( this, options );
			this.$el.append( icons.spinner().$el );
			this.$spinner = this.$( '.spinner' );
			this.$board = this.$( '.board' );
			if ( !this.options.headings ) {
				this._loadContent( this.options );
			}
			this.eventBus.on( 'talk-discussion-added', this._loadContent.bind( this ) );
		},

		/**
		 * Show a loading spinner
		 * @memberof TalkBoard
		 * @instance
		 */
		showSpinner: function () {
			this.$board.hide();
			this.$spinner.show();
		},

		/**
		 * Hide the loading spinner
		 * @memberof TalkBoard
		 * @instance
		 */
		hideSpinner: function () {
			this.$spinner.hide();
			this.$board.show();
		},

		/**
		 * Load content of the talk page into the overlay
		 * @memberof TalkBoard
		 * @instance
		 * @param {Object} options for the overlay
		 * @private
		 */
		_loadContent: function ( options ) {
			var self = this;
			options = options || this.options;

			// show a spinner
			this.showSpinner();
			// clear actual content, if any
			this.$( '.topic-title-list' ).empty();

			this.pageGateway.getPage( options.title ).then( function ( pageData ) {
				self._addContent( pageData, options );
			}, function ( resp ) {
				// If the API returns the error code 'missingtitle', that means the
				// talk page doesn't exist yet.
				if ( resp === 'missingtitle' ) {
					// Create an empty page for new pages
					self._addContent( {
						title: options.title,
						sections: []
					}, options );
				} else {
					if ( self.options.onFail ) {
						// Run failure callback with current title
						self.options.onFail( options.title );
					} else {
						// If the API request fails for any other reason, load the talk
						// page manually rather than leaving the spinner spinning.
						// eslint-disable-next-line no-restricted-properties
						window.location = mw.util.getUrl( options.title );
					}
				}
			} );
		},

		/**
		 * Adds the content received from _loadContent to the Overlay and re-renders it.
		 * @memberof TalkBoard
		 * @instance
		 * @private
		 * @param {Object} pageData As returned from PageApi#getPage
		 * @param {Object} options for the overlay
		 */
		_addContent: function ( pageData, options ) {
			var page = new Page( pageData ),
				sections = page.getSections();

			this.page = page;

			options.explanation = sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
				mw.msg( 'mobile-frontend-talk-explained-empty' );
			options.headings = sections;

			// content is there so re-render and hide the spinner
			this.render( options );
			this.hideSpinner();
		}
	} );

	M.define( 'mobile.talk.overlays/TalkBoard', TalkBoard );
}( mw.mobileFrontend ) );
