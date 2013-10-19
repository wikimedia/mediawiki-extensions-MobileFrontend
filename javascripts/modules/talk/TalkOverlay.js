( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var
		Overlay = M.require( 'Overlay' ),
		LoadingOverlay = M.require( 'LoadingOverlay' ),
		Page = M.require( 'Page' ),
		TalkSectionOverlay = M.require( 'modules/talk/TalkSectionOverlay' ),
		api = M.require( 'api' ),
		TalkSectionAddOverlay = Overlay.extend( {
			defaults: {
				cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
				confirmMsg: mw.msg( 'mobile-frontend-editor-save' ),
				licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
				heading: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
				topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
				topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' )
			},
			templatePartials: {
				content: M.template.get( 'overlays/talkSectionAdd' )
			},
			initialize: function( options ) {
				this._super( options );
				this.talkOverlay = options.parent;
				this.title = options.title;
			},
			postRender: function( options ) {
				this._super( options );
				this.$( 'button.confirm-save' ).click( $.proxy( this, 'save' ) );
			},
			save: function() {
				var $subject = this.$( 'input' ),
					$ta = this.$( 'textarea' ),
					heading = $subject.val(),
					self = this,
					text = $ta.val();
				$ta.removeClass( 'error' );
				$subject.removeClass( 'error' );
				if ( text && heading ) {
					this.$( '.content' ).empty().addClass( 'loading' );
					this.$( '.buttonBar' ).hide();
					api.getToken().done( function( token ) {
						api.post( {
							action: 'edit',
							section: 'new',
							sectiontitle: heading,
							title: self.title,
							token: token,
							summary: mw.msg( 'mobile-frontend-talk-edit-summary', heading ),
							text: text + ' ~~~~'
						} ).done( function() {
							self.hide();
							// close the list of topics overlay as well
							self.parent.hide();
							// FIXME: give nicer user experience - toast message would be nice at least!
							M.pageApi.invalidatePage( self.title );
						} );
					} );
				} else {
					if ( !text ) {
						$ta.addClass( 'error' );
					}
					if ( !heading ) {
						$subject.addClass( 'error' );
					}
				}
			}
		} ),
		TalkOverlay = Overlay.extend( {
			template: M.template.get( 'overlays/talk' ),
			className: 'mw-mf-overlay',
			defaults: {
				heading: mw.msg( 'mobile-frontend-talk-overlay-header' ),
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
							window.location = mw.util.wikiGetlink( options.title );
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
				if ( M.isLoggedIn() ) {
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
