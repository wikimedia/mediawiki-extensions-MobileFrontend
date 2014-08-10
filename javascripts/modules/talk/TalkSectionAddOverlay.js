( function( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var
		Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		toast = M.require( 'toast' ),
		TalkSectionAddOverlay;

	TalkSectionAddOverlay = Overlay.extend( {
		defaults: {
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			confirmMsg: mw.msg( 'mobile-frontend-editor-save' ),
			topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
			topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' ),
			editingMsg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' )
		},
		template: M.template.get( 'modules/talk/talkSectionAdd.hogan' ),
		templatePartials: {
			header: M.template.get( 'modules/talk/talkSectionAddHeader.hogan' )
		},
		initialize: function( options ) {
			// If terms of use is enabled, include it in the licensing message
			if ( $( '#footer-places-terms-use' ).length > 0 ) {
				options.licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing-with-terms',
					$( '#footer-places-terms-use' ).html(),
					mw.config.get( 'wgMFLicenseLink' )
				);
			} else {
				options.licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing',
					mw.config.get( 'wgMFLicenseLink' )
				);
			}
			this._super( options );
			this.talkOverlay = options.parent;
			this.title = options.title;
		},
		postRender: function( options ) {
			var self = this;
			this._super( options );
			this.$( '.back' ).on( M.tapEvent( 'click' ), $.proxy( self, 'hide' ) );
			this.confirm = this.$( 'button.confirm-save' );
			this.confirm.on( 'click', function() {
				if ( !$( this ).prop( 'disabled' ) ) {
					self.save();
				}
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
				this.confirm.prop( 'disabled', true );
				this.$( '.content' ).empty().addClass( 'loading' );
				this.$( '.buttonBar' ).hide();
				api.getTokenWithEndpoint().done( function( token ) {
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
						M.pageApi.invalidatePage( self.title );
						toast.show( mw.msg( 'mobile-frontend-talk-topic-feedback' ), 'toast' );
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
	} );

	M.define( 'modules/talk/TalkSectionAddOverlay', TalkSectionAddOverlay );

}( mw.mobileFrontend, jQuery ) );
