( function ( M, $, ve ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		settings = M.require( 'settings' ),
		overlayManager = M.require( 'overlayManager' ),
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
		/** @inheritdoc **/
		className: 'overlay editor-overlay editor-overlay-ve',
		editor: 'VisualEditor',
		/**
		 * Set options that apply specifically to VisualEditorOverlay but not
		 * EditorOverlay so that an EditorOverlay instance can be created effortlessly.
		 * FIXME: Must be smarter way to do this.
		 * @method
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
			this._hasChanged = false;
			// force editor preview step for VE
			this.config = $.extend( this.config, {
				skipPreview: false
			} );
			this.$continueBtn = self.$( '.continue' ).prop( 'disabled', true );
			// FIXME: This should be done by manipulating className
			this.$el.removeClass( 'view-border-box' );
		},
		/**
		 * Destroy the existing VisualEditor target.
		 * @method
		 */
		destroyTarget: function () {
			if ( this.target ) {
				this.target.destroy();
				this.target = null;
				this.docToSave = null;
			}
		},
		/** @inheritdoc **/
		show: function () {
			EditorOverlayBase.prototype.show.apply( this, arguments );
			var overlay = this;
			if ( this.target !== undefined ) {
				return;
			}
			// FIXME: we have to initialize MobileViewTarget after this.$el
			// is attached to DOM, maybe we should attach it earlier and hide
			// overlays in a different way?
			mw.loader.using( 'ext.visualEditor.targetLoader' )
				.then( mw.libs.ve.targetLoader.loadModules() )
				.then( function () {
					overlay.target = new ve.init.mw.MobileViewTarget( {
						// || undefined so that scrolling is not triggered for the lead (0) section
						// (which has no header to scroll to)
						section: overlay.options.sectionId || undefined,
						isIos: overlay.isIos
					} );
					overlay.$( '.surface' ).append( overlay.target.$element );
					overlay.target.activating = true;
					overlay.target.load();
					overlay.target.connect( overlay, {
						save: 'onSaveComplete',
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
				}, function ( e ) {
					mw.log.warn( 'VisualEditor failed to load: ' + e );
				} );
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
		postRender: function () {
			var self = this;

			this.initializeSwitcher();
			this.switcherToolbar.tools.editVe.setActive( true );
			/**
			 * 'Edit source' button handler
			 */
			this.switcherToolbar.tools.editSource.onSelect = function () {
				// If changes have been made tell the user they have to save first
				if ( !self.hasChanged() ) {
					self.switchToSourceEditor( self.options );
				} else {
					if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
						self.onStageChanges();
					} else {
						self.switcherToolbar.tools.editSource.setActive( false );
					}
				}
			};

			this.$( '.surface' ).hide();
			EditorOverlayBase.prototype.postRender.apply( this, arguments );
		},
		/**
		 * @inheritdoc
		 */
		onClickBack: function () {
			EditorOverlayBase.prototype.onClickBack.apply( this, arguments );
			this.switchToEditor();
		},
		/**
		 * Reveal the editing interface.
		 * @method
		 */
		switchToEditor: function () {
			this.showHidden( '.initial-header' );
			this.$( '.surface' ).show();
			this.docToSave = false;
		},
		/**
		 * Disables the VE editor interface in preparation for saving.
		 * @inheritdoc
		 */
		onStageChanges: function () {
			// need to blur contenteditable to be sure that keyboard is properly closed
			this.$( '[contenteditable]' ).blur();
			this.$( '.surface' ).hide();
			EditorOverlayBase.prototype.onStageChanges.apply( this, arguments );
		},
		/** @inheritdoc **/
		onSaveBegin: function () {
			var
				self = this,
				doc = this.target.surface.getModel().getDocument(),
				summary = this.$( '.save-panel .summary' ).val(),
				options = {
					summary: summary
				};

			EditorOverlayBase.prototype.onSaveBegin.apply( this, arguments );
			if ( this.confirmAborted ) {
				return;
			}
			this.showHidden( '.saving-header' );
			// Stop the confirmation message from being thrown when you hit save.
			this._hasChanged = false;
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
		 * @method
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
				overlayManager.replaceCurrent( new EditorOverlay( options ) );
			} );
		},
		/** @inheritdoc **/
		onSaveComplete: function () {
			EditorOverlayBase.prototype.onSaveComplete.apply( this, arguments );
			this.clearSpinner();
			this.destroyTarget();
		},
		/**
		 * Event handler.
		 * @method
		 */
		onSurfaceReady: function () {
			this.clearSpinner();
			this.$( '.surface' ).show();
			this.target.getSurface().getModel().getDocument().connect( this, {
				transact: 'onTransact'
			} );
			this.target.getSurface().$element.addClass( 'content' );

			// we have to do it here because contenteditable elements still do not
			// exist when postRender is executed
			// FIXME: Don't call a private method that is outside the class.
			this._fixIosHeader( '[contenteditable]' );
		},
		/**
		 * Event handler.
		 * @method
		 */
		onTransact: function () {
			this._hasChanged = true;
			this.$continueBtn.prop( 'disabled', false );
		},
		/**
		 * Event handler.
		 * @method
		 */
		onLoadError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ), 've-load-error' );
		},
		/**
		 * Event handler.
		 * @method
		 * @param {jqXHR} jqXHR
		 * @param {String} status
		 */
		onSerializeError: function ( jqXHR, status ) {
			this.reportError( mw.msg( 'visualeditor-serializeerror', status ), 've-serialize-error' );
		},
		/**
		 * Event handler.
		 * @method
		 */
		onConflictError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-conflict' ), 've-conflict-error' );
		},
		/**
		 * Event handler.
		 * @method
		 */
		onShowChangesError: function () {
			this.reportError( mw.msg( 'visualeditor-differror' ), 've-show-changes-error' );
		},
		/**
		 * Event handler.
		 * @method
		 */
		onSaveError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error' ), 've-save-error' );
		},
		/**
		 * Event handler.
		 * @method
		 * @param {Object} editApi response from api
		 */
		onSaveErrorCaptcha: function ( editApi ) {
			this.captchaId = editApi.captcha.id;
			// FIXME: Don't call a private method that is outside the class.
			this._showCaptcha( editApi.captcha.url );
		},
		/** @inheritdoc **/
		hasChanged: function () {
			return this._hasChanged;
		}
	} );

	M.define( 'modules/editor/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, jQuery, window.ve ) );
