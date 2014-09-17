( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var
		Overlay = M.require( 'Overlay' ),
		Page = M.require( 'Page' ),
		TalkSectionAddOverlay = M.require( 'modules/talk/TalkSectionAddOverlay' ),
		TalkSectionOverlay = M.require( 'modules/talk/TalkSectionOverlay' ),
		user = M.require( 'user' ),
		TalkOverlay = Overlay.extend( {
			templatePartials: {
				content: M.template.get( 'modules/talk/talk.hogan' )
			},
			defaults: {
				addTopicLabel: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
				heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
				leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' )
			},
			postRender: function( options ) {
				this._super( options );
				this.$board = this.$( '.board' );
				this._loadContent( options );
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
			clearSpinner: function() {
				this.$( '.spinner' ).hide();
				this.$board.show();
			},

			/**
			 * Load content of the talk page via PageApi
			 * @method
			 */
			_loadContent: function( options ) {
				var self = this;

				// show a spinner
				this.showSpinner();

				// FIXME: use Page's mechanisms for retrieving page data instead
				M.pageApi.getPage( options.title ).fail( function( resp ) {
					// If the API returns the error code 'missingtitle', that means the
					// talk page doesn't exist yet.
					if ( resp === 'missingtitle' ) {
						// Create an empty page for new pages
						self._addContent( { title: options.title, sections: [] } );
					} else {
						// If the API request fails for any other reason, load the talk
						// page manually rather than leaving the spinner spinning.
						window.location = mw.util.getUrl( options.title );
					}
				} ).done( function( pageData ) {
					self._addContent( pageData );
				} );
			},

			/**
			 * Adds the content received from _loadContent to the Overlay
			 * @method
			 */
			_addContent: function( pageData ) {
				var $add = this.$( 'button.add' ), page, sections, self = this;
				// API request was successful so show the talk page content
				page = new Page( pageData );
				// used for TalkSectionOverlay to access page sections
				this.page = page;

				this.$content = this.$( '.overlay-content' );

				// clear actual content, if any
				this.$( '.page-list.actionable' ).empty().prepend(
					'<li class="lead-discussion">' +
						'<a data-id="0">' + self.defaults.leadHeading + '</a>' +
					'</li>'
				);
				sections = page.getSubSections();

				// Add content header explanation
				this.$( '.content-header' ).prepend(
					sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
					mw.msg( 'mobile-frontend-talk-explained-empty' )
				);

				// Write down talk sections
				$.each( sections, function( id, el ) {
					self.$( '.page-list.actionable' ).prepend(
						'<li>' +
							'<a data-id="' + el.id + '">' + el.line + '</a>' +
						'</li>'
					);
				} );

				// content is there, hide the spinner
				this.clearSpinner();

				// FIXME: Make the add button work again. bug 69763
				$add.remove();
				if ( !user.isAnon() ) {
					$add.click( function() {
						var overlay = new TalkSectionAddOverlay( {
							parent: self,
							title: page.title
						} );
						overlay.show();
						overlay.on( 'hide', function() {
							// re-enable TalkOverlay (it's closed by hide event (in Overlay)
							// from TalkSectionAddOverlay)
							self.show();
						} );
					} );
				} else {
					$add.remove();
				}

				// FIXME: Use Router instead for this
				this.$( 'a' ).on( 'click', function() {
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
					childOverlay.show();
					// When closing this overlay, also close the child section overlay
					self.on( 'hide', function() {
						childOverlay.remove();
					} );
				} );
				if ( !$.trim( page.lead ) ) {
					this.$( '.lead-discussion' ).remove();
				}
			}
		} );

	M.define( 'modules/talk/TalkOverlay', TalkOverlay );

}( mw.mobileFrontend, jQuery ) );
