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
		/** @inheritdoc **/
		templatePartials: $.extend( {}, EditorOverlayBase.prototype.templatePartials, {
			content: mw.template.get( 'mobile.editor.ve', 'contentVE.hogan' )
		} ),
		className: 'overlay editor-overlay editor-overlay-ve',
		editor: 'VisualEditor',
		/**
		 * Set options that apply specifically to VisualEditorOverlay but not
		 * EditorOverlay so that an EditorOverlay instance can be created effortlessy.
		 * FIXME: Must be smarter way to do this.
		 * @param {Object} options
		 * @param {Boolean} isVE whether the options are being generated for a VisualEditorOverlay
		 *  or a EditorOverlay
		 */
		applyHeaderOptions: function ( options, isVE ) {
			// Set things that are known to be true.
			options.hasToolbar = isVE;
			options.editSwitcher = isVE;
			options.isVisualEditor = isVE;
		},
		/** @inheritdoc **/
		initialize: function ( options ) {
			var self = this;
			this.applyHeaderOptions( options, true );
			options.previewingMsg = mw.msg( 'mobile-frontend-page-edit-summary', options.title );
			options.editingMsg = mw.msg( 'mobile-frontend-editor-editing' );
			EditorOverlayBase.prototype.initialize.apply( this, arguments );
			this.hasChanged = false;
			this.$continueBtn = self.$( '.continue' ).prop( 'disabled', true );
			this.initializeSwitcher();
		},
		/**
		 * Destroy the existing VisualEditor target.
		 */
		destroyTarget: function () {
			if ( this.target ) {
				// keyboard stays open on iOS when we close the editor if we don't blur
				this.$( '[contenteditable]' ).blur();
				this.target.destroy();
				this.target = null;
				this.docToSave = null;
			}
		},
		/** @inheritdoc **/
		show: function () {
			EditorOverlayBase.prototype.show.apply( this, arguments );
			if ( this.target === undefined ) {
				// FIXME: we have to initialize MobileViewTarget after this.$el
				// is attached to DOM, maybe we should attach it earlier and hide
				// overlays in a different way?
				this.target = new ve.init.mw.MobileViewTarget( {
					// || undefined so that scrolling is not triggered for the lead (0) section
					// (which has no header to scroll to)
					section: this.options.sectionId || undefined,
					isIos: M.isIos
				} );
				this.$( '.surface' ).append( this.target.$element );
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
		/** @inheritdoc **/
		hide: function () {
			var retval = EditorOverlayBase.prototype.hide.apply( this, arguments );
			if ( retval ) {
				this.destroyTarget();
			}
			return retval;
		},
		/** @inheritdoc **/
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
		/**
		 * Reveal the editing interface.
		 */
		switchToEditor: function () {
			this._showHidden( '.initial-header' );
			this.$( '.surface' ).show();
			this.docToSave = false;
		},
		/**
		 * Disables the VE editor interface in preparation for saving.
		 * @private
		 * @inheritdoc
		 */
		_prepareForSave: function () {
			// need to blur contenteditable to be sure that keyboard is properly closed
			this.$( '[contenteditable]' ).blur();
			this.$( '.surface' ).hide();
			EditorOverlayBase.prototype._prepareForSave.apply( this, arguments );
		},
		/** @inheritdoc **/
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
		/**
		 * Loads an {EditorOverlay} and replaces the existing {VisualEditorOverlay}
		 *
		 * @param {Object} options to pass to new EditorOverlay
		 */
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
				self.applyHeaderOptions( options, false );
				M.overlayManager.replaceCurrent( new EditorOverlay( options ) );
			} );
		},
		/** @inheritdoc **/
		onSave: function () {
			EditorOverlayBase.prototype.onSave.apply( this, arguments );
			this.clearSpinner();
			this.destroyTarget();
		},
		/**
		 * Event handler.
		 */
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
		/**
		 * Event handler.
		 */
		onTransact: function () {
			this.hasChanged = true;
			this.$continueBtn.prop( 'disabled', false );
		},
		/**
		 * Event handler.
		 */
		onLoadError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ), 've-load-error' );
		},
		/**
		 * Event handler.
		 */
		onSerializeError: function ( jqXHR, status ) {
			this.reportError( mw.msg( 'visualeditor-serializeerror', status ), 've-serialize-error' );
		},
		/**
		 * Event handler.
		 */
		onConflictError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-conflict' ), 've-conflict-error' );
		},
		/**
		 * Event handler.
		 */
		onShowChangesError: function () {
			this.reportError( mw.msg( 'visualeditor-differror' ), 've-show-changes-error' );
		},
		/**
		 * Event handler.
		 */
		onSaveError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error' ), 've-save-error' );
		},
		/**
		 * Event handler.
		 */
		onSaveErrorCaptcha: function ( editApi ) {
			this.captchaId = editApi.captcha.id;
			this._showCaptcha( editApi.captcha.url );
		},
		/** @inheritdoc **/
		_hasChanged: function () {
			return this.hasChanged;
		}
	} );

	M.define( 'modules/editor/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, jQuery, window.ve ) );
