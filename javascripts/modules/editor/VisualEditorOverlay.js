( function ( M, $, ve ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		settings = M.require( 'settings' ),
		VisualEditorOverlay;

	/**
	 * Overlay for VisualEditor view
	 * @class VisualEditorOverlay
	 * @extends EditorOverlayBase
	 */
	VisualEditorOverlay = EditorOverlayBase.extend( {
		templatePartials: {
			switcher: mw.template.get( 'mobile.editor.common', 'switcher.hogan' ),
			header: mw.template.get( 'mobile.editor.ve', 'OverlayHeader.hogan' ),
			content: mw.template.get( 'mobile.editor.ve', 'OverlayContent.hogan' )
		},
		className: 'overlay editor-overlay editor-overlay-ve',
		editor: 'VisualEditor',
		initialize: function ( options ) {
			var self = this;
			options.isVisualEditor = true;
			options.previewingMsg = mw.msg( 'mobile-frontend-page-edit-summary', options.title );
			options.editingMsg = mw.msg( 'mobile-frontend-editor-editing' );
			EditorOverlayBase.prototype.initialize.apply( this, arguments );
			this.hasChanged = false;
			this.$continueBtn = self.$( '.continue' ).prop( 'disabled', true );
			this.initializeSwitcher();
		},
		destroyTarget: function () {
			if ( this.target ) {
				// keyboard stays open on iOS when we close the editor if we don't blur
				this.$( '[contenteditable]' ).blur();
				this.target.destroy();
				this.target = null;
				this.docToSave = null;
			}
		},
		show: function () {
			EditorOverlayBase.prototype.show.apply( this, arguments );
			if ( this.target === undefined ) {
				// FIXME: we have to initialize MobileViewTarget after this.$el
				// is attached to DOM, maybe we should attach it earlier and hide
				// overlays in a different way?
				this.target = new ve.init.mw.MobileViewTarget( this.$( '.surface' ), {
					// || undefined so that scrolling is not triggered for the lead (0) section
					// (which has no header to scroll to)
					section: this.options.sectionId || undefined,
					isIos: M.isIos
				} );
				this.target.activating = true;
				this.target.load();
				this.target.connect( this, {
					save: 'onSave',
					saveAsyncBegin: 'showSpinner',
					saveAsyncComplete: 'clearSpinner',
					saveErrorEmpty: 'onSaveError',
					// FIXME: Expand on save errors by having a method for each
					saveErrorSpamBlacklist: 'onSaveError',
					saveErrorAbuseFilter: 'onSaveError',
					saveErrorBlocked: 'onSaveError',
					saveErrorNewUser: 'onSaveError',
					saveErrorCaptcha: 'onSaveErrorCaptcha',
					saveErrorUnknown: 'onSaveError',
					surfaceReady: 'onSurfaceReady',
					loadError: 'onLoadError',
					conflictError: 'onConflictError',
					showChangesError: 'onShowChangesError',
					serializeError: 'onSerializeError'
				} );
			}
		},
		hide: function () {
			var retval = EditorOverlayBase.prototype.hide.apply( this, arguments );
			if ( retval ) {
				this.destroyTarget();
			}
			return retval;
		},
		postRender: function ( options ) {
			var self = this;
			// Save button
			this.$( '.continue' ).on( 'click', $.proxy( this, '_prepareForSave' ) );
			this.$( '.submit' ).on( 'click', $.proxy( this, '_save' ) );
			this.$( '.back' ).on( 'click', $.proxy( this, 'switchToEditor' ) );
			this.$( '.source-editor' ).on( 'click', function () {
				// If changes have been made tell the user they have to save first
				if ( !self.hasChanged ) {
					self.switchToSourceEditor( options );
				} else {
					if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
						self.prepareForSave();
					}
				}
			} );
			this.$( '.surface' ).hide();
			EditorOverlayBase.prototype.postRender.apply( this, arguments );
		},
		switchToEditor: function () {
			this._showHidden( '.initial-header' );
			this.$( '.surface' ).show();
			this.docToSave = false;
		},
		_prepareForSave: function () {
			// need to blur contenteditable to be sure that keyboard is properly closed
			this.$( '[contenteditable]' ).blur();
			this.$( '.surface' ).hide();
			this._showHidden( '.save-header, .save-panel' );
			EditorOverlayBase.prototype._prepareForSave.apply( this, arguments );
		},
		_save: function () {
			var
				self = this,
				doc = this.target.surface.getModel().getDocument(),
				summary = this.$( '.save-panel .summary' ).val(),
				options = {
					summary: summary
				};

			EditorOverlayBase.prototype._save.apply( this, arguments );
			if ( this.confirmAborted ) {
				return;
			}
			this._showHidden( '.saving-header' );
			// Stop the confirmation message from being thrown when you hit save.
			this.hasChanged = false;
			this.$( '.surface, .summary-area' ).hide();
			if ( this.captchaId ) {
				// Intentional Lcase ve save api properties
				options.captchaid = this.captchaId;
				options.captchaword = this.$( '.captcha-word' ).val();
			}

			// Preload the serialization
			if ( !this.docToSave ) {
				this.docToSave = ve.dm.converter.getDomFromModel( doc );
			}
			this.target.prepareCacheKey( this.docToSave ).done( function () {
				self.target.save( self.docToSave, options );
			} );
		},
		switchToSourceEditor: function ( options ) {
			var self = this;
			this.log( 'switch' );
			// Save a user setting indicating that this user prefers using the SourceEditor
			settings.save( 'preferredEditor', 'SourceEditor', true );
			this.showSpinner();
			this.$( '.surface' ).hide();
			// Load the SourceEditor and replace the VisualEditor overlay with it
			mw.loader.using( 'mobile.editor.overlay', function () {
				var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );
				self.clearSpinner();
				M.overlayManager.replaceCurrent( new EditorOverlay( options ) );
			} );
		},
		onSave: function () {
			EditorOverlayBase.prototype.onSave.apply( this, arguments );
			this.clearSpinner();
			this.destroyTarget();
		},
		onSurfaceReady: function () {
			this.clearSpinner();
			this.$( '.surface' ).show();
			this.target.surface.getModel().getDocument().connect( this, {
				transact: 'onTransact'
			} );
			this.target.surface.$element.addClass( 'content' );

			// we have to do it here because contenteditable elements still do not
			// exist when postRender is executed
			this._fixIosHeader( '[contenteditable]' );
		},
		onTransact: function () {
			this.hasChanged = true;
			this.$continueBtn.prop( 'disabled', false );
		},
		onLoadError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ), 've-load-error' );
		},
		onSerializeError: function ( jqXHR, status ) {
			this.reportError( mw.msg( 'visualeditor-serializeerror', status ), 've-serialize-error' );
		},
		onConflictError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-conflict' ), 've-conflict-error' );
		},
		onShowChangesError: function () {
			this.reportError( mw.msg( 'visualeditor-differror' ), 've-show-changes-error' );
		},
		onSaveError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error' ), 've-save-error' );
		},
		onSaveErrorCaptcha: function ( editApi ) {
			this.captchaId = editApi.captcha.id;
			this._showCaptcha( editApi.captcha.url );
		},
		_hasChanged: function () {
			return this.hasChanged;
		}
	} );

	M.define( 'modules/editor/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, jQuery, window.ve ) );
