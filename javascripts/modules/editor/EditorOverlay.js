( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ),
		Page = M.require( 'Page' ),
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
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder' ),
			previewMsg: mw.msg( 'mobile-frontend-editor-preview-header' ),
			waitMsg: mw.msg( 'mobile-frontend-editor-wait' ),
			guiderMsg: mw.msg( 'mobile-frontend-editor-guider' )
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
					namespace: mw.config.get( 'wgNamespaceNumber' ),
					userEditCount: parseInt( mw.config.get( 'wgUserEditCount' ), 10 ),
					isTestA: M.isTestA,
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
			this.api = new EditorApi( {
				title: options.title,
				sectionId: options.sectionId,
				isNew: options.isNew
			} );
			this.sectionId = options.sectionId;
			this.isNewEditor = options.isNewEditor;
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
					self.$( '.continue' ).prop( 'disabled', false );
					self._resizeContent();
				} );
			this.$( '.continue' ).on( 'click', $.proxy( this, '_showPreview' ) );
			this.$( '.back' ).on( 'click', $.proxy( this, '_hidePreview' ) );
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

			this._loadContent();
			// log section edit attempt
			self.log( 'attempt' );
		},

		hide: function() {
			if ( !this.api.hasChanged || window.confirm( mw.msg( 'mobile-frontend-editor-cancel-confirm' ) ) ) {
				return this._super();
			} else {
				return false;
			}
		},

		_showPreview: function() {
			var self = this;

			// log save button click
			this.log( 'save' );
			this.$( '.initial-bar' ).hide();
			this.$( '.save-bar' ).show();

			this.scrollTop = $( 'body' ).scrollTop();
			this.$content.hide();
			this.$spinner.show();

			api.post( {
				action: 'parse',
				// Enable section preview mode to avoid errors (bug 49218)
				sectionpreview: true,
				// needed for pre-save transform to work (bug 53692)
				pst: true,
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
					el: self.$preview.find( '.content' ),
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

		_hidePreview: function() {
			this.$preview.hide();
			this.$content.show();
			window.scrollTo( 0, this.scrollTop );
			this.$( '.save-bar' ).hide();
			this.$( '.initial-bar' ).show();
		},

		_resizeContent: function() {
			if ( this.$content.prop( 'scrollHeight' ) ) {
				this.$content.css( 'height', this.$content.prop( 'scrollHeight' ) + 'px' );
			}
		},

		_loadContent: function() {
			var self = this;

			this.$content.hide();
			this.$spinner.show();

			this.api.getContent().
				done( function( content ) {
					self.$content.
						show().
						val( content );
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
			var self = this, msg, className = 'toast landmark';

			self.log( 'submit' );
			this.$( '.save-bar' ).hide();
			this.$( '.saving-bar' ).show();

			this.api.save( this.$( '.summary' ).val() ).
				done( function() {
					var title = self.options.title,
						editCount = mw.config.get( 'wgUserEditCount' );
					// log success!
					self.log( 'success' );
					M.pageApi.invalidatePage( title );
					new Page( { title: title, el: $( '#content_wrapper' ) } ).on( 'ready', M.reloadPage );
					M.router.navigate( '' );
					self.hide();
					if ( M.isTestA && self.isNewEditor ) {
						msg = 'mobile-frontend-editor-success-landmark-1';
					} else {
						className = 'toast';
						msg = 'mobile-frontend-editor-success';
					}
					// update edit count
					// FIXME: this should be an integer (see bug 51633)
					mw.config.set( 'wgUserEditCount', ( parseInt( editCount, 10 ) + 1 ).toString() );
					popup.show( mw.msg( msg ), className );
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
