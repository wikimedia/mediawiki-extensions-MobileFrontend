( function( M, $ ) {

	var
		Overlay = M.require( 'Overlay' ),
		TalkSectionOverlay = M.require( 'modules/talk/TalkSectionOverlay' ),
		api = M.require( 'api' ),
		leadHeading = mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
		TalkSectionAddOverlay = Overlay.extend( {
			defaults: {
				cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
				confirmMsg: mw.msg( 'mobile-frontend-editor-save' ),
				licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
				topicAdd: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
				topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
				topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' )
			},
			template: M.template.get( 'overlays/talkSectionAdd' ),
			initialize: function( options ) {
				this._super( options );
				this.talkOverlay = options.parent;
				this.title = 'Talk:' + mw.config.get( 'wgTitle' );
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
							M.history.invalidateCachedPage( self.title );
							self.talkOverlay.appendSection( { heading: heading, content: text } ); // FIXME: doesn't add signature and doesn't wikify
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
			className: 'mw-mf-overlay list-overlay',
			appendSection: function( heading, text ) {
				var $newTopic;
				this.options.page.appendSection( heading, text );
				this.render( this.options );
				$newTopic = this.$( 'li' ).last();
				window.scrollTo( 0, $newTopic.offset().top );
				// FIXME: add fade in animation
			},
			preRender: function( options ) {
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
							parent: self
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
							heading: leadHeading
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
		} ),
		Page = M.require( 'page' );

	function renderTalkOverlay( pageData ) {
		var topOverlay,
			page = new Page( pageData );

		topOverlay = new TalkOverlay( {
			heading: mw.msg( 'mobile-frontend-talk-overlay-header' ),
			leadHeading: mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
			page: page
		} );
		topOverlay.show();
	}

	function onTalkClick( ev ) {
		var $talk = $( this ), talkPage = $talk.data( 'title' );
		// FIXME: this currently gives an indication something async is happening. We can do better.
		$talk.addClass( 'loading' );
		ev.preventDefault();

		M.history.retrievePage( talkPage ).fail( function( resp ) {
			if ( resp.error && resp.error.code === 'missingtitle' ) {
				renderTalkOverlay( {
					sections: [], title: talkPage
				} );
			}
			$talk.removeClass( 'loading' );
		} ).done( function( pageData ) {
			renderTalkOverlay( pageData );
			$talk.removeClass( 'loading' );
		} );
	}

	function init( title ) {
		var talkPrefix = mw.config.get( 'wgFormattedNamespaces' ) [mw.config.get( 'wgNamespaceNumber' ) + 1 ] + ':';
		// FIXME change when micro.tap.js in stable
		$( '#ca-talk' ).on( mw.config.get( 'wgMFMode' ) === 'alpha' ? 'tap' : 'click', onTalkClick ).data( 'title', talkPrefix + title );
	}

	init( mw.config.get( 'wgTitle' ) );
	M.on( 'page-loaded', function( page ) {
		init( page.title );
	} );

}( mw.mobileFrontend, jQuery ) );
