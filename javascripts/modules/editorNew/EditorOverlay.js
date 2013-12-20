( function( M, $ ) {

	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' ),
		popup = M.require( 'notifications' ),
		api = M.require( 'api' ),
		inBetaOrAlpha = M.isBetaGroupMember(),
		inCampaign = M.query.campaign ? true : false,
		inKeepGoingCampaign = M.query.campaign === 'mobile-keepgoing',
		Section = M.require( 'Section' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		KeepGoingOverlay,
		AbuseFilterOverlay = M.require( 'modules/editorNew/AbuseFilterOverlay' ),
		EditorOverlay;

	EditorOverlay = EditorOverlayBase.extend( {
		template: M.template.get( 'modules/editorNew/EditorOverlay' ),
		log: function( action, errorText ) {
			var
				data = {
					token: M.getSessionId(),
					action: action,
					section: this.sectionId,
					namespace: mw.config.get( 'wgNamespaceNumber' ),
					userEditCount: user.getEditCount(),
					isTestA: M.isTestA,
					pageId: mw.config.get( 'wgArticleId' ),
					username: user.getName(),
					mobileMode: mw.config.get( 'wgMFMode' ),
					userAgent: window.navigator.userAgent,
					funnel: this.funnel
				};
			if ( errorText ) {
				data.errorText = errorText;
			}
			M.log( 'MobileWebEditing', data );
		},

		initialize: function( options ) {
			this.api = new EditorApi( {
				title: options.title,
				sectionId: options.sectionId,
				isNew: options.isNew
			} );
			this.sectionId = options.sectionId;
			this.isNewEditor = options.isNewEditor;
			this.editCount = user.getEditCount();
			this.funnel = options.funnel;
			this._super( options );
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			this.$spinner = this.$( '.spinner' );
			this.$preview = this.$( '.preview' );
			this.$content = this.$( 'textarea' ).
				on( 'input', function() {
					self.api.setContent( self.$content.val() );
					self.$( '.continue, .submit' ).prop( 'disabled', false );
				} );
			this.$( '.continue' ).on( 'click', $.proxy( this, '_showPreview' ) );
			this.$( '.back' ).on( 'click', $.proxy( this, '_hidePreview' ) );
			this.$( '.submit' ).on( 'click', $.proxy( this, '_save' ) );
			this.$( '.cancel' ).on( 'click', function() {
				// log cancel attempt
				self.log( 'cancel' );
			} );
			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			this._showHidden( '.initial-header' );
			this._loadContent();
			// log section edit attempt
			self.log( 'attempt' );
		},

		_showPreview: function() {
			var self = this;

			// log save button click
			this.log( 'save' );
			this._showHidden( '.save-header, .save-panel' );

			this.scrollTop = $( 'body' ).scrollTop();
			this.$content.hide();
			this.$spinner.show();

			// pre-fetch keep going with expectation user will go on to save
			if ( inBetaOrAlpha &&
				mw.config.get( 'wgMFKeepGoing' ) &&
				( ( this.editCount === 0 && !inCampaign ) || inKeepGoingCampaign )
			) {
				mw.loader.using( 'mobile.keepgoing', function() {
					KeepGoingOverlay = M.require( 'modules/keepgoing/KeepGoingOverlay' );
				} );
			}

			api.post( {
				action: 'parse',
				// Enable section preview mode to avoid errors (bug 49218)
				sectionpreview: true,
				// needed for pre-save transform to work (bug 53692)
				pst: true,
				// Output mobile HTML (bug 54243)
				mobileformat: true,
				title: self.options.title,
				text: self.$content.val(),
				prop: 'text'
			} ).then( function( resp ) {
				var html;
				if ( resp && resp.parse && resp.parse.text ) {
					html = resp.parse.text['*'];
					return $.Deferred().resolve( html );
				} else {
					return $.Deferred().reject();
				}
			} ).done( function( parsedText ) {
				// FIXME: hacky
				var $tmp = $( '<div>' ).html( parsedText );
				// remove heading from the parsed output
				$tmp.find( 'h1, h2' ).eq( 0 ).remove();

				new Section( {
					el: self.$preview,
					content: $tmp.html()
				// bug 49218: stop links from being clickable (note user can still hold down to navigate to them)
				} ).$( 'a' ).on( 'click', false );
				// Emit event so we can perform enhancements to page
				M.emit( 'edit-preview', self );
			} ).fail( function() {
				self.$preview.addClass( 'error' ).text( mw.msg( 'mobile-frontend-editor-error-preview' ) );
			} ).always( function() {
				self.$spinner.hide();
				self.$preview.show();
			} );
		},

		_hidePreview: function() {
			this.$preview.hide();
			this.$content.show();
			window.scrollTo( 0, this.scrollTop );
			this._showHidden( '.initial-header' );
		},

		_loadContent: function() {
			var self = this;

			this.$content.hide();
			this.$spinner.show();

			this.api.getContent().
				done( function( content ) {
					self.$content.
						show().
						val( content ).
						microAutosize();
					self.$spinner.hide();
				} ).
				fail( function( error ) {
					popup.show( mw.msg( 'mobile-frontend-editor-error-loading' ), 'toast error' );
					// log error that occurred in retrieving section
					self.log( 'error', error );
				} );
		},

		_updateEditCount: function() {
			this.editCount += 1;
			mw.config.set( 'wgUserEditCount', this.editCount );
		},

		_showAbuseFilter: function( type, message ) {
			var self = this, msg;

			this.$( '.abusefilter-panel .readmore' ).on( 'click', function() {
				self.canHide = true;
				new AbuseFilterOverlay( { parent: self, message: message } ).show();
				self.canHide = false;
			} );

			if ( type === 'warning' ) {
				msg = mw.msg( 'mobile-frontend-editor-abusefilter-warning' );
			} else if ( type === 'disallow' ) {
				msg = mw.msg( 'mobile-frontend-editor-abusefilter-disallow' );
				// disable continue and save buttons, reenabled when user changes content
				this.$( '.continue, .submit' ).prop( 'disabled', true );
			}

			this.$( '.message p' ).text( msg );
			this._showHidden( '.save-header, .abusefilter-panel' );
		},

		_save: function() {
			var self = this, className = 'toast landmark',
				options = { summary: this.$( '.summary' ).val() },
				msg;

			if ( this.captchaId ) {
				options.captchaId = this.captchaId;
				options.captchaWord = this.$( '.captcha-word' ).val();
			}

			self.log( 'submit' );
			this._showHidden( '.saving-header' );

			this.api.save( options ).
				done( function() {
					var title = self.options.title;
					// Special case behaviour of main page
					if ( mw.config.get( 'wgIsMainPage' ) ) {
						window.location = mw.util.getUrl( title );
						return;
					}

					// log success!
					self.log( 'success' );
					M.pageApi.invalidatePage( title );
					new Page( { title: title, el: $( '#content_wrapper' ) } ).on( 'ready', M.reloadPage );
					M.router.navigate( '' );
					self.hide();
					if ( self.isNewEditor ) {
						msg = 'mobile-frontend-editor-success-landmark-1';
					} else {
						className = 'toast';
						msg = 'mobile-frontend-editor-success';
					}
					self._updateEditCount();
					// Set a cookie for 30 days indicating that this user has edited from
					// the mobile interface.
					$.cookie( 'mobileEditor', 'true', { expires: 30 } );
					// double check it was successfully pre-fetched during preview phase
					if ( KeepGoingOverlay ) {
						// Show KeepGoing overlay at step 1 (ask)
						new KeepGoingOverlay( { step: 1 } );
					} else {
						// just show a toast
						popup.show( mw.msg( msg ), className );
					}
				} ).
				fail( function( data ) {
					var msg;

					if ( data.type === 'captcha' ) {
						self.captchaId = data.details.id;
						self._showCaptcha( data.details.url );
					} else if ( data.type === 'abusefilter' ) {
						self._showAbuseFilter( data.details.type, data.details.message );
					} else {
						if ( data.details === 'editconflict' ) {
							msg = mw.msg( 'mobile-frontend-editor-error-conflict' );
						} else {
							msg = mw.msg( 'mobile-frontend-editor-error' );
						}

						popup.show( msg, 'toast error' );
						self._showHidden( '.save-header, .save-panel' );
						// log error that occurred in retrieving section
						self.log( 'error', data.details );
					}
				} );
		},
		_hasChanged: function () {
			return this.api.hasChanged;
		}
	} );

	M.define( 'modules/editor/EditorOverlay', EditorOverlay );

}( mw.mobileFrontend, jQuery ) );
