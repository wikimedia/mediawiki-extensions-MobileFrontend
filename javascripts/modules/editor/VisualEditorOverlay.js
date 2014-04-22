( function( M, $, ve ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		popup = M.require( 'toast' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
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
		initialize: function( options ) {
			var self = this;
			options.previewingMsg = mw.msg( 'mobile-frontend-page-saving', options.title );
			this._super( options );
			this.hasChanged = false;
			this.$spinner = self.$( '.spinner' );
			this.$continueBtn = self.$( '.continue' ).prop( 'disabled', true );
			this.initializeSwitcher();
		},
		destroyTarget: function () {
			if ( this.target ) {
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
			this.$( '.continue' ).on( 'click', $.proxy( this, 'prepareForSave' ) );
			this.$( '.submit' ).on( 'click', $.proxy( this, 'save' ) );
			this.$( '.back' ).on( 'click', $.proxy( this, 'switchToEditor' ) );
			this.$( '.source-editor' ).on( 'click', function() {
				// If changes have been made tell the user they have to save first
				if ( !self.hasChanged ) {
					MobileWebClickTracking.log( 'editor-switch-to-source', options.title );
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
		prepareForSave: function() {
			this.$( '.surface' ).hide();
			this._showHidden( '.save-header, .save-panel' );
		},
		save: function() {
			var
				self = this,
				doc = this.target.surface.getModel().getDocument(),
				summary = this.$( '.save-panel input' ).val(),
				options = { summary: summary };

			// Ask for confirmation in some cases
			if ( !this.confirmSave() ) {
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
		switchToSourceEditor: function( options ) {
			// Save a user setting indicating that this user prefers using the SourceEditor
			M.settings.saveUserSetting( 'preferredEditor', 'SourceEditor', true );
			// Load the SourceEditor and replace the VisualEditor overlay with it
			mw.loader.using( 'mobile.editor.overlay', function() {
				var EditorOverlay = M.require( 'modules/editor/EditorOverlay' );
				M.overlayManager.replaceCurrent( new EditorOverlay( options ) );
			} );
		},
		showSpinner: function () {
			this.$spinner.show();
		},
		clearSpinner: function() {
			this.$spinner.hide();
		},
		onSave: function() {
			this._super();
			this.clearSpinner();
			this.destroyTarget();
		},
		reportError: function ( msg ) {
			popup.show( msg, 'toast error' );
		},
		onSurfaceReady: function () {
			this.clearSpinner();
			this.target.surface.getModel().getDocument().connect( this, { 'transact': 'onTransact' } );
			this.target.surface.$element.addClass( 'content' );

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
			this.reportError( mw.msg( 'mobile-frontend-editor-error-loading' ) );
		},
		onSerializeError: function ( jqXHR, status ) {
			this.reportError( mw.msg( 'visualeditor-serializeerror', status ) );
		},
		onConflictError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error-conflict' ) );
		},
		onShowChangesError: function () {
			this.reportError( mw.msg( 'visualeditor-differror' ) );
		},
		onSaveError: function () {
			this.reportError( mw.msg( 'mobile-frontend-editor-error' ) );
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
