( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var
		Overlay = M.require( 'Overlay' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
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
			show: function() {
				var self = this, _super = Overlay.prototype.show;
				if ( this._isReady ) {
					_super.apply( this, arguments );
				} else {
					// If _isReady is not set then postRender is yet to run and show has been called before it is in the dom. Delay showing.
					this.one( 'ready', function() {
						_super.apply( self, arguments );
					} );
				}
			},
			initialize: function( options ) {
				var self = this,
					_super = this._super;
				this.loadingOverlay = new LoadingOverlay();
				this.loadingOverlay.show();

				// FIXME: use Page's mechanisms for retrieving page data instead
				M.pageApi.getPage( options.title ).fail( function( resp ) {
					// If the API returns the error code 'missingtitle', that means the
					// talk page doesn't exist yet.
					if ( resp === 'missingtitle' ) {
						// Create an empty page for new pages
						options.page = new Page( { title: options.title, sections: [] } );
						_super.call( self, options );
					} else {
						// If the API request fails for any other reason, load the talk
						// page manually rather than leaving the spinner spinning.
						window.location = mw.util.getUrl( options.title );
					}
				} ).done( function( pageData ) {
					// API request was successful so show the overlay with the talk page content
					options.page = new Page( pageData );
					_super.call( self, options );
				} );
			},
			preRender: function( options ) {
				this.loadingOverlay.hide();
				var page = options.page,
					sections = page.getSubSections(),
					explanation = sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
						mw.msg( 'mobile-frontend-talk-explained-empty' );

				options.sections = sections;
				options.explanation = explanation;
				this._super( options );
			},
			postRender: function( options ) {
				var $add = this.$( 'button.add' ),
					page = options.page, self = this;

				this._isReady = true;
				this.emit( 'ready' );
				this._super( options );
				// FIXME: Make the add button work again. bug 69763
				$add.remove();
				if ( !user.isAnon() ) {
					$add.click( function() {
						var overlay = new TalkSectionAddOverlay( {
							parent: self,
							title: options.title
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
