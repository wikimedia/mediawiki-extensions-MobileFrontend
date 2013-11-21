( function( M, $ ) {

	var OverlayNew = M.require( 'OverlayNew' ),
		Page = M.require( 'Page' ),
		popup = M.require( 'notifications' ),
		api = M.require( 'api' ),
		inBetaOrAlpha = mw.config.get( 'wgMFMode' ) !== 'stable',
		inCampaign = M.query.campaign ? true : false,
		inKeepGoingCampaign = M.query.campaign === 'mobile-keepgoing',
		Section = M.require( 'Section' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		KeepGoingDrawer,
		AbuseFilterOverlay = M.require( 'modules/editorNew/AbuseFilterOverlay' ),
		EditorOverlay;

	EditorOverlay = OverlayNew.extend( {
		defaults: {
			continueMsg: mw.msg( 'mobile-frontend-editor-continue' ),
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			keepEditingMsg: mw.msg( 'mobile-frontend-editor-keep-editing' ),
			summaryMsg: mw.msg( 'mobile-frontend-editor-summary-placeholder' ),
			licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder' ),
			waitMsg: mw.msg( 'mobile-frontend-editor-wait' ),
			captchaMsg: mw.msg( 'mobile-frontend-account-create-captcha-placeholder' ),
			captchaTryAgainMsg: mw.msg( 'mobile-frontend-editor-captcha-try-again' ),
			abusefilterReadMoreMsg: mw.msg( 'mobile-frontend-editor-abusefilter-read-more')
		},
		template: M.template.get( 'modules/editorNew/EditorOverlay' ),
		className: 'overlay editor-overlay',
		closeOnBack: true,

		log: function( action, errorText ) {
			var
				data = {
					token: M.getSessionId(),
					action: action,
					section: this.sectionId,
					namespace: mw.config.get( 'wgNamespaceNumber' ),
					userEditCount: mw.config.get( 'wgUserEditCount' ),
					isTestA: M.isTestA,
					pageId: mw.config.get( 'wgArticleId' ),
					username: mw.config.get( 'wgUserName' ),
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
			// FIXME: isNewEditor and isFirstEdit are the same thing
			this.isNewEditor = options.isNewEditor;
			this.editCount = mw.config.get( 'wgUserEditCount' );
			this.isFirstEdit = this.editCount === 0;
			this.funnel = options.funnel;

			options.editingMsg = mw.msg( 'mobile-frontend-editor-editing', options.title );
			options.previewingMsg = mw.msg( 'mobile-frontend-editor-previewing', options.title );

			this._super( options );
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			this.$spinner = this.$( '.spinner' );
			this.$preview = this.$( '.preview' );
			this.$content = this.$( 'textarea' ).
				microAutosize().
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

		hide: function() {
			var confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );
			if ( !this.api.hasChanged || this.canHide || window.confirm( confirmMessage ) ) {
				return this._super();
			} else {
				return false;
			}
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
			if ( inBetaOrAlpha && ( ( this.isFirstEdit && !inCampaign ) || inKeepGoingCampaign ) ) {
				mw.loader.using( 'mobile.keepgoing', function() {
					KeepGoingDrawer = M.require( 'modules/keepgoing/KeepGoingDrawer' );
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
						trigger( 'input' );
					self.$( '.continue, .submit' ).prop( 'disabled', true );
					self.$spinner.hide();
				} ).
				fail( function( error ) {
					popup.show( mw.msg( 'mobile-frontend-editor-error-loading' ), 'toast error' );
					// log error that occurred in retrieving section
					self.log( 'error', error );
				} );
		},

		_showCaptcha: function( url ) {
			var self = this, $input = this.$( '.captcha-word' );

			if ( this.captchaShown ) {
				$input.val( '' );
				$input.attr( 'placeholder', this.options.captchaTryAgainMsg );
				setTimeout( function() {
					$input.attr( 'placeholder', self.options.captchaMsg );
				}, 2000 );
			}

			this.$( '.captcha-panel img' ).attr( 'src', url );
			this._showHidden( '.save-header, .captcha-panel' );

			this.captchaShown = true;
		},

		_updateEditCount: function() {
			this.isFirstEdit = false;
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
					if ( KeepGoingDrawer ) {
						new KeepGoingDrawer( { isFirstEdit: self.isFirstEdit } );
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

		_showHidden: function( className ) {
			// can't use jQuery's hide() and show() beause show() sets display: block
			// and we want display: table for headers
			this.$( '.hideable' ).addClass( 'hidden' );
			this.$( className ).removeClass( 'hidden' );
		}
	} );

	M.define( 'modules/editorNew/EditorOverlay', EditorOverlay );

}( mw.mobileFrontend, jQuery ) );
