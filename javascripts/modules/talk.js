( function( M, $ ) {

	var
		Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		leadHeading = mw.msg( 'mobile-frontend-talk-overlay-lead-header' ),
		TalkSectionAddOverlay = Overlay.extend( {
			defaults: {
				cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
				confirmMsg: mw.msg( 'mobile-frontend-editor-confirm' ),
				licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
				topicAdd: mw.msg( 'mobile-frontend-talk-add-overlay-submit' ),
				topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
				topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' )
			},
			template: M.template.get( 'overlays/talkSectionAdd' ),
			initialize: function( options ) {
				var self = this;
				this._super( options );
				this.talkOverlay = options.parent;
				this.title = 'Talk:' + mw.config.get( 'wgTitle' );
				this.$( 'button.confirm-save' ).click( function() {
					self.save();
				} );
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
			appendSection: function( heading, text ) {
				var $newTopic;
				this.options.page.appendSection( heading, text );
				this.render( this.options );
				$newTopic = this.$( 'li' ).last();
				window.scrollTo( 0, $newTopic.offset().top );
				// FIXME: add fade in animation
			},
			initialize: function( options ) {
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
							heading: leadHeading
						},
						section = id === 0 ? leadSection : page.getSubSection( id ),
						childOverlay = new Overlay( {
							content: M.template.get( 'talkSection' ).render( section ),
							parent: self
						} );
					childOverlay.show();
				} );
				if ( !$.trim( page.lead ) ) {
					this.$( '.lead-discussion' ).remove();
				}
			}
		} ),
		Page = M.require( 'page'),
		req;

	function onTalkClick( ev ) {
		var $talk = $( this ), talkPage = $talk.data( 'title' );
		// FIXME: this currently gives an indication something async is happening. We can do better.
		$talk.css( 'opacity', 0.2 );
		ev.preventDefault();
		req = req || api.get( {
			action: 'mobileview', page: talkPage,
			variant: mw.config.get( 'wgPreferredVariant' ),
			prop: 'sections|text', noheadings: 'yes',
			noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
			sectionprop: 'level|line|anchor', sections: 'all'
		} );
		req.done( function( resp ) {
			var topOverlay, sections, page,
				explanation;

			if ( resp.error ) {
				// page doesn't exist
				page = new Page( { sections: {} } );
			} else {
				page = new Page( { sections: resp.mobileview.sections } );
			}

			$talk.css( 'opacity', '' );
			sections = page.getSubSections();
			explanation = sections.length > 0 ? mw.msg( 'mobile-frontend-talk-explained' ) :
				mw.msg( 'mobile-frontend-talk-explained-empty' );
			topOverlay = new TalkOverlay( {
				heading: mw.msg( 'mobile-frontend-talk-overlay-header' ),
				leadHeading: leadHeading,
				explanation: explanation,
				page: page,
				sections: sections
			} );
			topOverlay.show();
		} ).error( function() {
			$talk.css( 'opacity', '' );
		} );
	}

	function init( title ) {
		var talkPrefix = mw.config.get( 'wgFormattedNamespaces' ) [mw.config.get( 'wgNamespaceNumber' ) + 1 ] + ':';
		$( '#ca-talk' ).on( 'click', onTalkClick ).data( 'title', talkPrefix + title );
	}

	init( mw.config.get( 'wgTitle' ) );
	M.on( 'page-loaded', function( page ) {
		init( page.title );
	} );

}( mw.mobileFrontend, jQuery ) );
