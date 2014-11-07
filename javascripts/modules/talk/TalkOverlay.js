( function ( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var
		Overlay = M.require( 'Overlay' ),
		Page = M.require( 'Page' ),
		user = M.require( 'user' ),
		/**
		 * Overlay for talk page
		 * @extends Overlay
		 * @class TalkOverlay
		 * @uses Page
		 * @uses TalkSectionOverlay
		 * @uses TalkSectionAddOverlay
		 */
		TalkOverlay = Overlay.extend( {
			templatePartials: $.extend( {}, Overlay.prototype.templatePartials, {
				content: mw.template.get( 'mobile.talk.overlays', 'content.hogan' ),
				footer: mw.template.get( 'mobile.overlays', 'OverlayFooterLink.hogan' )
			} ),
			defaults: {
				/**
				 * A list of sections to render heading links for. If not set ajax request will be performed.
				 * @type {Array}
				 **/
				headings: undefined,
				heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
				leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
				headerButtonsListClassName: 'overlay-action',
				headerButtons: [ {
					href: '#/talk/new',
					className: 'add continue hidden',
					msg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' )
				} ],
				linkMsg: mw.msg( 'mobile-frontend-talk-fullpage' ),
				linkClass: 'talk-fullpage'
			},

			postRender: function ( options ) {
				Overlay.prototype.postRender.apply( this, arguments );
				this.$board = this.$( '.board' );
				this.$( '.talk-fullpage' ).attr( 'href', mw.util.getUrl( options.title ) )
					.removeClass( 'hidden' );
				if ( !options.headings ) {
					this._loadContent( options );
				}
				this._setupAddDiscussionButton( options );
				this._showHidden( '.initial-header' );
			},

			/**
			 * Show a loading spinner
			 * @method
			 */
			showSpinner: function () {
				this.$board.hide();
				this.$( '.spinner' ).show();
			},

			/**
			 * Hide the loading spinner
			 * @method
			 */
			clearSpinner: function () {
				this.$( '.spinner' ).hide();
				this.$board.show();
			},

			/**
			 * Load content of the talk page via PageApi
			 * @method
			 */
			_loadContent: function ( options ) {
				var self = this;

				// show a spinner
				this.showSpinner();

				// clear actual content, if any
				this.$( '.page-list' ).empty();

				// FIXME: use Page's mechanisms for retrieving page data instead
				M.pageApi.getPage( options.title ).fail( function ( resp ) {
					// If the API returns the error code 'missingtitle', that means the
					// talk page doesn't exist yet.
					if ( resp === 'missingtitle' ) {
						// Create an empty page for new pages
						self._addContent( { title: options.title, sections: [] }, options );
					} else {
						// If the API request fails for any other reason, load the talk
						// page manually rather than leaving the spinner spinning.
						window.location = mw.util.getUrl( options.title );
					}
				} ).done( function ( pageData ) {
					self._addContent( pageData, options );
				} );
			},

			/**
			 * Adds the content received from _loadContent to the Overlay and re-renders it.
			 * @method
			 * @param {Object} pageData As returned from PageApi#getPage
			 * @param {Object} options for the overlay
			 */
			_addContent: function ( pageData, options ) {
				var page = new Page( pageData ),
					sections = page.getSubSections();

				this.page = page;

				options.explanation = sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
					mw.msg( 'mobile-frontend-talk-explained-empty' );
				options.headings = sections;

				// content is there so re-render and hide the spinner
				this.render( options );
				this.clearSpinner();
			},
			/**
			 * Shows the add topic button to logged in users.
			 * Ensures the overlay refreshes when a discussion is added.
			 * @method
			 */
			_setupAddDiscussionButton: function () {
				var $add = this.$( '.overlay-action .add' );
				M.on( 'talk-discussion-added', $.proxy( this, '_loadContent', this.options ) );
				if ( !user.isAnon() ) {
					$add.removeClass( 'hidden' );
				} else {
					$add.remove();
				}
			}
		} );

	M.define( 'modules/talk/TalkOverlay', TalkOverlay );

}( mw.mobileFrontend, jQuery ) );
