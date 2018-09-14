( function ( M ) {
	var TalkOverlayBase = M.require( 'mobile.talk.overlays/TalkOverlayBase' ),
		util = M.require( 'mobile.startup/util' ),
		Page = M.require( 'mobile.startup/Page' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		user = M.require( 'mobile.startup/user' );
	/**
	 * Overlay for talk page
	 * @extends TalkOverlayBase
	 * @class TalkOverlay
	 * @uses Page
	 * @uses TalkSectionOverlay
	 * @uses TalkSectionAddOverlay
	 */
	function TalkOverlay() {
		TalkOverlayBase.apply( this, arguments );
	}

	OO.mfExtend( TalkOverlay, TalkOverlayBase, {
		templatePartials: util.extend( {}, TalkOverlayBase.prototype.templatePartials, {
			content: mw.template.get( 'mobile.talk.overlays', 'content.hogan' )
		} ),
		/**
		 * @memberof TalkOverlay
		 * @instance
		 * @mixes TalkOverlayBase#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {Array} defaults.headings A list of {Section} objects to render heading links
		 * for. If not set ajax request will be performed.
		 * @property {string} defaults.heading Heading for talk overlay.
		 * @property {string} defaults.leadHeading Heading for a discussion which has no heading
		 * (lead section of talk page).
		 * @property {string} defaults.headerButtonsListClassName Class name of the header buttons
		 * list
		 * @property {Array} defaults.headerButtons Objects that will be used as defaults for
		 * generating header buttons. Default list includes an 'add' button, which opens
		 * a new talk overlay.
		 */
		defaults: util.extend( {}, TalkOverlayBase.prototype.defaults, {
			headings: undefined,
			heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
			leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
			headerButtonsListClassName: 'header-action',
			headerButtons: [ {
				href: '#/talk/new',
				className: 'add continue hidden',
				msg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' )
			} ],
			footerAnchor: new Anchor( {
				progressive: true,
				additionalClassNames: 'footer-link talk-fullpage',
				label: mw.msg( 'mobile-frontend-talk-fullpage' )
			} ).options
		} ),

		/**
		 * @inheritdoc
		 * @memberof TalkOverlay
		 * @instance
		 */
		postRender: function () {
			TalkOverlayBase.prototype.postRender.apply( this );
			this.$board = this.$( '.board' );
			this.$( '.talk-fullpage' ).attr( 'href', mw.util.getUrl( this.options.title ) )
				.removeClass( 'hidden' );
			if ( !this.options.headings ) {
				this._loadContent( this.options );
			}
			this._setupAddDiscussionButton( this.options );
			this.showHidden( '.initial-header' );
		},

		/**
		 * Show a loading spinner
		 * @memberof TalkOverlay
		 * @instance
		 */
		showSpinner: function () {
			this.$board.hide();
			TalkOverlayBase.prototype.showSpinner.apply( this, arguments );
		},

		/**
		 * Hide the loading spinner
		 * @memberof TalkOverlay
		 * @instance
		 */
		hideSpinner: function () {
			TalkOverlayBase.prototype.hideSpinner.apply( this, arguments );
			this.$board.show();
		},

		/**
		 * Load content of the talk page into the overlay
		 * @memberof TalkOverlay
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
		 * @memberof TalkOverlay
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
		},
		/**
		 * Shows the add topic button to logged in users.
		 * Ensures the overlay refreshes when a discussion is added.
		 * @memberof TalkOverlay
		 * @instance
		 * @private
		 */
		_setupAddDiscussionButton: function () {
			var $add = this.$( '.header-action .add' );
			M.on( 'talk-discussion-added', this._loadContent.bind( this ) );
			if ( !user.isAnon() ) {
				$add.removeClass( 'hidden' );
			} else {
				$add.remove();
			}
		}
	} );

	M.define( 'mobile.talk.overlays/TalkOverlay', TalkOverlay ); // resource-modules-disable-line

}( mw.mobileFrontend ) );
