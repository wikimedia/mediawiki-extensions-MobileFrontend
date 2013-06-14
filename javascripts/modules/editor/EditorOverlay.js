( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ),
		Page = M.require( 'page' ),
		popup = M.require( 'notifications' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		PreviewOverlay = M.require( 'modules/editor/PreviewOverlay' ),
		EditorOverlay;

	EditorOverlay = Overlay.extend( {
		defaults: {
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' ),
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			confirmMsg: mw.msg( 'mobile-frontend-editor-confirm' ),
			previousMsg: mw.msg ( 'mobile-frontend-editor-previous' ),
			previewMsg: mw.msg( 'mobile-frontend-editor-preview' ),
			nextMsg: mw.msg ( 'mobile-frontend-editor-next' ),
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
			this._super( options );
			this.api = new EditorApi( { title: options.title, isNew: options.isNew } );
			this.sectionCount = options.sectionCount;
		},

		postRender: function( options ) {
			var self = this;
			this._super( options );

			this.$( '.preview' ).on( 'click', function() {
				var overlay = new PreviewOverlay( {
					parent: self,
					title: options.title,
					wikitext: self.$( 'textarea' ).val()
				} );
				self.previewClicked = true;
				overlay.show();
			} );
			this.$spinner = this.$( '.spinner' );
			this.$content = this.$( 'textarea' ).
				on( 'input', function() {
					self.api.stageSection( self.sectionId, self.$content.val() );
					self.$( '.save' ).prop( 'disabled', false );
					self._resizeContent();
				} );
			this.$prev = this.$( '.prev-section' ).
				on( 'click', function() {
					self._loadSection( self.sectionId - 1 );
					self.log( 'sectionPrevious' );
				} );
			this.$next = this.$( '.next-section' ).
				on( 'click', function() {
					self._loadSection( self.sectionId + 1 );
					self.log( 'sectionNext' );
				} );
			this.$( '.save' ).on( 'click', function() {
				// log save button click
				self.log( 'save' );
				self.$( '.count' ).text( mw.msg( 'mobile-frontend-editor-section-count', self.api.getStagedCount() ) );
				self.$( '.initial-bar' ).hide();
				self.$( '.confirm-bar' ).show();
			} );
			this.$( '.confirm-save' ).on( 'click', $.proxy( this, '_save' ) );
			this.$( '.cancel' ).on( 'click', function() {
				// log cancel attempt
				self.log( 'cancel' );
			} );

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

		_resizeContent: function() {
			if ( this.$content.prop( 'scrollHeight' ) ) {
				this.$content.css( 'height', this.$content.prop( 'scrollHeight' ) + 'px' );
			}
		},

		_loadSection: function( id ) {
			var self = this;

			this.$content.hide();
			this.$spinner.show();

			this.$prev.prop( 'disabled', id === 0 );
			this.$next.prop( 'disabled', id === this.sectionCount - 1 );
			this.sectionId = id;

			this.api.getSection( id ).
				done( function( section ) {
					// prevent delayed response overriding content on multiple prev/next clicks
					if ( section.id === id ) {
						self.$content.
							show().
							val( section.content ).
							// shrink the textarea if needed
							css( 'height', 'auto' );
						self._resizeContent();
						self.$spinner.hide();
					}
				} ).
				fail( function( error ) {
					if ( error === 'rvnosuchsection' ) {
						// disable next button if section not found (this happens if
						// additional non-section heading <h2> tags are present)
						self.sectionCount = id;
						self.$next.prop( 'disabled', true );
						self._loadSection( id - 1 );
					} else {
						popup.show( mw.msg( 'mobile-frontend-editor-error-loading' ), 'toast error' );
					}
					// log error that occurred in retrieving section
					self.log( 'error', error );
				} );
		},

		_save: function() {
			var self = this;

			self.log( 'submit' );
			this.$( '.confirm-bar' ).hide();
			this.$( '.saving-bar' ).show();

			this.api.save().
				done( function() {
					var title = self.options.title;
					// log success!
					self.log( 'success' );
					M.history.invalidateCachedPage( title );
					new Page( { title: title, el: $( '#content' ) } );
					self.hide();
					popup.show(
						mw.msg( 'mobile-frontend-editor-success' ),
						'toast'
					);
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
