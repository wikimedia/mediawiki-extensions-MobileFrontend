( function ( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var
		Overlay = M.require( 'Overlay' ),
		Page = M.require( 'Page' ),
		TalkSectionAddOverlay = M.require( 'modules/talk/TalkSectionAddOverlay' ),
		TalkSectionOverlay = M.require( 'modules/talk/TalkSectionOverlay' ),
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
			templatePartials: {
				content: M.template.get( 'modules/talk/talk.hogan' ),
				footer: mw.template.get( 'mobile.overlays', 'OverlayFooterLink.hogan' )
			},
			defaults: {
				heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
				leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
				headerButtonsListClassName: 'overlay-action',
				headerButtons: [ {
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
				this._loadContent( options );
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
			 * Adds the content received from _loadContent to the Overlay
			 * @method
			 */
			_addContent: function ( pageData, options ) {
				var $add = this.$( 'button.add' ), page, sections, self = this;
				// API request was successful so show the talk page content
				page = new Page( pageData );
				// FIXME: just for tests
				this.page = page;

				sections = page.getSubSections();

				// Add content header explanation
				this.$( '.content-header' ).text(
					sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
					mw.msg( 'mobile-frontend-talk-explained-empty' )
				);

				// Write down talk sections
				$.each( sections, function ( id, el ) {
					self.$( '.page-list' ).prepend(
						'<li>' +
							'<a data-id="' + el.id + '">' + el.line + '</a>' +
						'</li>'
					);
				} );

				// content is there, hide the spinner
				this.clearSpinner();

				if ( !user.isAnon() ) {
					$add.removeClass( 'hidden' );
					$add.click( function () {
						var overlay = new TalkSectionAddOverlay( {
							title: page.title
						} );
						// Hide discussion list to disable scrolling - bug 70989
						// FIXME: Kill when OverlayManager is used for TalkSectionAdd
						self.$board.hide();
						overlay.on( 'talk-discussion-added', function () {
							// reload the content
							self._loadContent( options );
						} ).on( 'hide', function () {
							// re-enable TalkOverlay (it's closed by hide event (in Overlay)
							// from TalkSectionAddOverlay)
							self.show();
							// FIXME: Kill when OverlayManager is used for TalkSectionAdd
							self.$board.show();
						} ).show();
						// When closing this overlay, also close the child section overlay
						self.on( 'hide', function () {
							overlay.remove();
						} );
					} );
				} else {
					$add.remove();
				}

				// FIXME: Use Router instead for this
				this.$( '.page-list a' ).on( 'click', function () {
					var id = parseFloat( $( this ).data( 'id' ), 10 ),
						leadSection = {
							content: page.lead,
							id: 0,
							heading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' )
						},
						section = id === 0 ? leadSection : page.getSubSection( id ),
						childOverlay = new TalkSectionOverlay( {
							parent: self,
							title: page.title,
							section: section
						} );
					// Hide discussion list to disable scrolling - bug 70989
					// FIXME: Kill when OverlayManager is used for TalkSections
					self.$board.hide();
					childOverlay.show();
					// When closing this overlay, also close the child section overlay
					self.on( 'hide', function () {
						childOverlay.remove();
					} );
				} );
			}
		} );

	M.define( 'modules/talk/TalkOverlay', TalkOverlay );

}( mw.mobileFrontend, jQuery ) );
