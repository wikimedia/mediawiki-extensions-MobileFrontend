( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var
		Overlay = M.require( 'OverlayNew' ),
		LoadingOverlay = M.require( 'LoadingOverlayNew' ),
		Page = M.require( 'Page' ),
		TalkSectionAddOverlay = M.require( 'modules/talk/TalkSectionAddOverlay' ),
		TalkSectionOverlay = M.require( 'modules/talk/TalkSectionOverlay' ),
		user = M.require( 'user' ),
		TalkOverlay = Overlay.extend( {
			templatePartials: {
				content: M.template.get( 'overlays/talk' )
			},
			defaults: {
				addTopicLabel: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
				heading: '<strong>' + mw.msg( 'mobile-frontend-talk-overlay-header' ) + '</strong>',
				leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' )
			},
			initialize: function( options ) {
				var self = this,
					_super = this._super;
				this.loadingOverlay = new LoadingOverlay();
				this.loadingOverlay.show();

				// FIXME: use Page's mechanisms for retrieving page data instead
				M.pageApi.getPage( options.title ).fail( function( resp ) {
					var code;
					if ( resp.error ) {
						code = resp.error.code;
						if ( code === 'missingtitle' ) {
							// Create an empty page for new pages
							options.page = new Page( { title: options.title, sections: [] } );
							_super.call( self, options );
							self.show();
						// FIXME: [LQT] remove when liquid threads is dead (see Bug 51586)
						} else if ( code === 'lqt' ) {
							// Force a visit to the page
							window.location = mw.util.getUrl( options.title );
						}
					}
				} ).done( function( pageData ) {
					options.page = new Page( pageData );
					_super.call( self, options );
					self.show();
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
				var self = this,
					$add = this.$( 'button.add' ),
					page = options.page;

				this._super( options );
				if ( !user.isAnon() ) {
					$add.click( function() {
						var overlay = new TalkSectionAddOverlay( {
							parent: self,
							title: options.title
						} );
						overlay.show();
					} );
				} else {
					$add.remove();
				}

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
				} );
				if ( !$.trim( page.lead ) ) {
					this.$( '.lead-discussion' ).remove();
				}
			}
		} );

	M.define( 'modules/talk/TalkOverlay', TalkOverlay );

}( mw.mobileFrontend, jQuery ) );
