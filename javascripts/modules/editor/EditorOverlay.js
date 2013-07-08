( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ),
		Page = M.require( 'page' ),
		popup = M.require( 'notifications' ),
		api = M.require( 'api' ),
		Section = M.require( 'Section' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		EditorOverlay;

	EditorOverlay = Overlay.extend( {
		defaults: {
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' ),
			continueMsg: mw.msg( 'mobile-frontend-editor-continue' ),
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			keepEditingMsg: mw.msg( 'mobile-frontend-editor-keep-editing' ),
			summaryMsg: mw.msg( 'mobile-frontend-editor-summary-placeholder' ),
			licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
			waitMsg: mw.msg( 'mobile-frontend-editor-wait' )
		},
		template: M.template.get( 'overlays/editor' ),
		className: 'mw-mf-overlay editor-overlay',
		closeOnBack: true,

		log: function( action, errorText ) {
			var
				data = {
					token: M.getSessionId(),
					action: action,
					section: this.sectionId,
					pageId: mw.config.get( 'wgArticleId' ),
					username: mw.config.get( 'wgUserName' ),
					mobileMode: mw.config.get( 'wgMFMode' ),
					userAgent: window.navigator.userAgent
				};
			if ( errorText ) {
				data.errorText = errorText;
			}
			M.log( 'MobileWebEditing', data );
		},

		initialize: function( options ) {
			this.api = new EditorApi( { title: options.title, isNew: options.isNew } );
			this._super( options );
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			this.$spinner = this.$( '.spinner' );
			this.$preview = this.$( '.preview' );
			this.$content = this.$( 'textarea' ).
				on( 'input', function() {
					self.api.stageSection( self.sectionId, self.$content.val() );
					self.$( '.continue' ).prop( 'disabled', false );
					self._resizeContent();
				} );
			this.$( '.continue' ).on( 'click', function() {
				// log save button click
				self.log( 'save' );
				self._showPreview();
				self.$( '.initial-bar' ).hide();
				self.$( '.save-bar' ).show();
			} );
			this.$( '.back' ).on( 'click', function() {
				self.$preview.hide();
				self.$content.show();
				self.$( '.save-bar' ).hide();
				self.$( '.initial-bar' ).show();
			} );
			this.$( '.save' ).on( 'click', $.proxy( this, '_save' ) );
			this.$( '.cancel' ).on( 'click', function() {
				// log cancel attempt
				self.log( 'cancel' );
			} );
			// make license links open in separate tabs
			this.$( '.license a' ).attr( 'target', '_blank' );

			// This is used to avoid position: fixed weirdness in mobile Safari when
			// the keyboard is visible
			if ( ( /ipad|iphone/i ).test( navigator.userAgent ) ) {
				this.$content.
					on( 'focus', function() {
						self.$( '.buttonBar' ).removeClass( 'position-fixed' );
					} ).
					on( 'blur', function() {
						self.$( '.buttonBar' ).addClass( 'position-fixed' );
					} );
			}

			this._loadSection( options.section );
			// log section edit attempt
			self.log( 'attempt' );
		},

		hide: function() {
			if ( this.previewClicked ) {
				this.previewClicked = false;
				return this._super();
			} else if ( !this.api.getStagedCount() || window.confirm( mw.msg( 'mobile-frontend-editor-cancel-confirm' ) ) ) {
				return this._super();
			} else {
				return false;
			}
		},

		_showPreview: function() {
			var self = this;

			this.$content.hide();
			this.$spinner.show();

			api.post( {
				action: 'parse',
				// Enable section preview mode to avoid errors (bug 49218)
				sectionpreview: true,
				title: self.options.title,
				text: self.$content.val(),
				prop: 'text'
			} ).then( function( resp ) {
				// FIXME: Don't trust the api response
				if ( resp && resp.parse && resp.parse.text ) {
					return $.Deferred().resolve( resp.parse.text['*'] );
				} else {
					return $.Deferred().reject();
				}
			} ).done( function( parsedText ) {
				// FIXME: hacky
				var $tmp = $( '<div>' ).html( parsedText ), heading;
				// FIXME: yuck.
				$tmp.find( '.mw-editsection' ).remove();
				// Extract the first heading
				heading = $tmp.find( 'h2' ).eq( 0 ).text();
				// remove heading from the parsed output
				$tmp.find( 'h2' ).eq( 0 ).remove();

				new Section( {
					el: self.$preview,
					index: 'preview',
					// doesn't account for headings with html inside
					heading: heading,
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

		_resizeContent: function() {
			if ( this.$content.prop( 'scrollHeight' ) ) {
				this.$content.css( 'height', this.$content.prop( 'scrollHeight' ) + 'px' );
			}
		},

		_loadSection: function( id ) {
			var self = this;

			this.$content.hide();
			this.$spinner.show();

			this.sectionId = id;

			this.api.getSection( id ).
				done( function( section ) {
					self.$content.
						show().
						val( section.content );
					self._resizeContent();
					self.$spinner.hide();
				} ).
				fail( function( error ) {
					popup.show( mw.msg( 'mobile-frontend-editor-error-loading' ), 'toast error' );
					// log error that occurred in retrieving section
					self.log( 'error', error );
				} );
		},

		_save: function() {
			var self = this;

			self.log( 'submit' );
			this.$( '.save-bar' ).hide();
			this.$( '.saving-bar' ).show();

			this.api.save( this.$( '.summary' ).val() ).
				done( function() {
					var title = self.options.title;
					// log success!
					self.log( 'success' );
					M.history.invalidateCachedPage( title );
					new Page( { title: title, el: $( '#content_wrapper' ) } );
					M.router.navigate( '' );
					self.hide();
					popup.show( mw.msg( 'mobile-frontend-editor-success' ), 'toast' );
				} ).
				fail( function( err ) {
					var msg;

					if ( err === 'editconflict' ) {
						msg = mw.msg( 'mobile-frontend-editor-error-conflict' );
					} else {
						msg = mw.msg( 'mobile-frontend-editor-error' );
					}

					popup.show( msg, 'toast error' );
					self.$( '.saving-bar' ).hide();
					self.$( '.initial-bar' ).show();
					// log error that occurred in retrieving section
					self.log( 'error', err );
				} );
		}
	} );

	M.define( 'modules/editor/EditorOverlay', EditorOverlay );

}( mw.mobileFrontend, jQuery ) );
