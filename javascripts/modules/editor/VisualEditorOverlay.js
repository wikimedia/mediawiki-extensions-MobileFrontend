( function( M, $, ve ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		VisualEditorOverlay;

	/**
	 * @class VisualEditorOverlay
	 * @extends EditorOverlayBase
	 */
	VisualEditorOverlay = EditorOverlayBase.extend( {
		templatePartials: {
			header: M.template.get( 'modules/editor/VisualEditorOverlayHeader' ),
			content: M.template.get( 'modules/editor/VisualEditorOverlay' )
		},
		className: 'overlay editor-overlay editor-overlay-ve',
		editor: 'VisualEditor',
		initialize: function( options ) {
			var self = this;
			options.previewingMsg = mw.msg( 'mobile-frontend-page-saving', options.title );
			this._super( options );
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
		show: function() {
			this._super();
			if ( this.target === undefined ) {
				// FIXME: MobileViewTarget does not accept a second argument
				// FIXME: we have to initialize MobileViewTarget after this.$el
				// is attached to DOM, maybe we should attach it earlier and hide
				// overlays in a different way?
				this.target = new ve.init.mw.MobileViewTarget( this.$( '.surface' ), {
					// || undefined so that scrolling is not triggered for the lead (0) section
					// (which has no header to scroll to)
					section: this.options.sectionId || undefined
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
		hide: function( force ) {
			var retval = this._super( force );
			if ( retval ) {
				this.destroyTarget();
			}
			return retval;
		},
		postRender: function( options ) {
			var self = this;
			// Save button
			this.$( '.continue' ).on( 'click', $.proxy( this, '_prepareForSave' ) );
			this.$( '.submit' ).on( 'click', $.proxy( this, '_save' ) );
			this.$( '.back' ).on( 'click', $.proxy( this, 'switchToEditor' ) );
			this.$( '.source-editor' ).on( 'click', function() {
				// If changes have been made tell the user they have to save first
				if ( !self.hasChanged ) {
					self.switchToSourceEditor( options );
				} else {
					if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
						self.prepareForSave();
					}
				}
			} );
			this._super( options );
		},
		switchToEditor: function() {
			this._showHidden( '.initial-header' );
			this.$( '.surface' ).show();
			this.docToSave = false;
		},
		_prepareForSave: function() {
			// need to blur contenteditable to be sure that keyboard is properly closed
			this.$( '[contenteditable]' ).blur();
			this.$( '.surface' ).hide();
			this._showHidden( '.save-header, .save-panel' );
			this._super();
		},
		_save: function() {
			var
				self = this,
				doc = this.target.surface.getModel().getDocument(),
				summary = this.$( '.save-panel input' ).val(),
				options = { summary: summary };

			this._super();
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
		switchToSourceEditor: function( options ) {
			var self = this;
			this.log( 'switch' );
			// Save a user setting indicating that this user prefers using the SourceEditor
			M.settings.saveUserSetting( 'preferredEditor', 'SourceEditor', true );
			this.showSpinner();
			this.$( '.surface' ).hide();
			// Load the SourceEditor and replace the VisualEditor overlay with it
			mw.loader.using( 'mobile.editor.overlay', function() {
				var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );
				self.clearSpinner();
				M.overlayManager.replaceCurrent( new EditorOverlay( options ) );
			} );
		},
		onSave: function() {
			this._super();
			this.clearSpinner();
			this.destroyTarget();
		},
		onSurfaceReady: function () {
			this.clearSpinner();
			this.target.surface.getModel().getDocument().connect( this, { 'transact': 'onTransact' } );
			this.target.surface.$element.addClass( 'content' );

			// make _fixIosHeader work with mobile context (2nd line toolbar)
			this.$( '.ve-ui-mobileContext' ).addClass( 'overlay-header-container position-fixed visible' );
			// for some reason the first time contenteditables are focused, focus
			// event doesn't fire if we don't blur them first
			this.$( '[contenteditable]' ).blur();
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
