( function( M, $ ) {

	var Overlay = M.require( 'navigation' ).Overlay,
		popup = M.require( 'notifications' ),
		EditorApi = M.require( 'modules/editor/EditorApi' ),
		EditorOverlay;

	EditorOverlay = Overlay.extend( {
		defaults: {
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' ),
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			confirmMsg: mw.msg( 'mobile-frontend-editor-confirm' ),
			previousMsg: mw.msg ( 'mobile-frontend-editor-previous' ),
			nextMsg: mw.msg ( 'mobile-frontend-editor-next' ),
			licenseMsg: mw.msg( 'mobile-frontend-editor-license' ),
			waitMsg: mw.msg( 'mobile-frontend-editor-wait' )
		},
		template: M.template.get( 'overlays/editor' ),
		className: 'mw-mf-overlay editor-overlay',

		initialize: function( options ) {
			var self = this;
			this._super( options );

			this.api = new EditorApi( { title: options.title, isNew: options.isNew } );
			this.sectionCount = options.sectionCount;
			this.$spinner = this.$( '.spinner' );
			this.$content = this.$( 'textarea' ).
				// can't use $.proxy because self.section changes
				on( 'change', function() {
					self.api.stageSection( self.sectionId, self.$content.val() );
				} ).
				on( 'input', function() {
					self.$( '.save' ).prop( 'disabled', false );
					self._resizeContent();
				} );
			this.$prev = this.$( '.prev-section' ).
				on( 'click', function() {
					self._loadSection( self.sectionId - 1 );
				} );
			this.$next = this.$( '.next-section' ).
				on( 'click', function() {
					self._loadSection( self.sectionId + 1 );
				} );
			this.$( '.save' ).on( 'click', function() {
				self.$( '.count' ).text( mw.msg( 'mobile-frontend-editor-section-count', self.api.getStagedCount() ) );
				self.$( '.initial-bar' ).hide();
				self.$( '.confirm-bar' ).show();
			} );
			this.$( '.confirm-save' ).on( 'click', $.proxy( this, '_save' ) );

			// This is used to avoid position: fixed weirdness in mobile Safari when
			// the keyboard is visible
			if ( ( /ipad|iphone/i ).test( navigator.userAgent ) ) {
				this.$content.
					on( 'focus', function() {
						self.$( '.buttonBar' ).addClass( 'unpinned' );
					} ).
					on( 'blur', function() {
						self.$( '.buttonBar' ).removeClass( 'unpinned' );
					} );
			}

			this._loadSection( options.section );
		},

		hide: function() {
			if ( !this.api.getStagedCount() || window.confirm( mw.msg( 'mobile-frontend-editor-cancel-confirm' ) ) ) {
				this._super();
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
				} );
		},

		_save: function() {
			var self = this;

			this.$( '.confirm-bar' ).hide();
			this.$( '.saving-bar' ).show();

			this.api.save().
				done( function() {
					self.hide();
					popup.show(
						mw.msg( 'mobile-frontend-editor-success' ) + ' ' + mw.msg( 'mobile-frontend-editor-refresh' ),
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
				} );
		}
	} );

	M.define( 'modules/editor/EditorOverlay', EditorOverlay );

}( mw.mobileFrontend, jQuery ) );
