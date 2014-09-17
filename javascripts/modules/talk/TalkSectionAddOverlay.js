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
			this.title = options.title;
			// Variable to indicate, if the overlay will be closed by the save function or by the user. If this is false and there is content in the input fields,
			// the user will be asked, if he want to abandon his changes before we close the Overlay, otherwise the Overlay will be closed without any question.
			this._saveHit = false;
		},
		postRender: function( options ) {
			var self = this;
			this._super( options );
			this.$( '.back' ).on( M.tapEvent( 'click' ), $.proxy( self, 'hide' ) );
			this.confirm = this.$( 'button.confirm-save' );
			this.confirm.on( 'click', function() {
				if ( !$( this ).prop( 'disabled' ) ) {
					self.save().done( function( status ) {
						if ( status === 'ok' ) {
							M.pageApi.invalidatePage( self.title );
							toast.show( mw.msg( 'mobile-frontend-talk-topic-feedback' ), 'toast' );
							self.emit( 'talk-discussion-added' );
							self.hide();
						}
					} ).fail( function( error ) {
						self.confirm.prop( 'disabled', false );
						toast.show(
							mw.msg( 'mobile-frontend-talk-topic-error', error.details ),
							'toast error'
						);
					} );
				}
			} );
		},
		hide: function() {
			var confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' ), empty;
			empty = ( !this.$( '.summary' ).val() && !this.$( '.wikitext-editor' ).val() );
			if ( this._saveHit || empty || window.confirm( confirmMessage ) ) {
				return this._super();
			} else {
				return false;
			}
		},
		save: function() {
			var $subject = this.$( 'input' ),
				$ta = this.$( 'textarea' ),
				heading = $subject.val(),
				self = this,
				text = $ta.val(),
				result = $.Deferred();
			$ta.removeClass( 'error' );
			$subject.removeClass( 'error' );
			if ( text && heading ) {
				// propagate, that we save an edit and want to close the Overlay without any interruption (user questions e.g.)
				this._saveHit = true;

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
						result.resolve( 'ok' );
					} ).fail( function( msg ) {
						result.reject( { type: 'error', details: msg } );
					} );
				} ).fail( function( msg ) {
					result.reject( { type: 'error', details: msg } );
				} );
			} else {
				if ( !text ) {
					$ta.addClass( 'error' );
				}
				if ( !heading ) {
					$subject.addClass( 'error' );
				}
				result.reject( { type: 'error', details: 'empty message or heading' } );
			}
			return result;
		}
	} );

	M.define( 'modules/talk/TalkSectionAddOverlay', TalkSectionAddOverlay );

}( mw.mobileFrontend, jQuery ) );
