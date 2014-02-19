( function( M, $, ve ) {
	var EditorOverlayBase = M.require( 'modules/editor/EditorOverlayBase' ),
		popup = M.require( 'toast' ),
		VisualEditorOverlay;

	VisualEditorOverlay = EditorOverlayBase.extend( {
		templatePartials: {
			header: M.template.get( 'modules/editor/VisualEditorOverlayHeader' ),
			content: M.template.get( 'modules/editor/VisualEditorOverlay' )
		},
		className: 'overlay editor-overlay editor-overlay-ve',
		initialize: function( options ) {
			var self = this;
			this._super( options );
			this.hasChanged = false;
			this.$spinner = self.$( '.spinner' );
			this.$continueBtn = self.$( '.continue' ).prop( 'disabled', true );
		},
		show: function() {
			this._super();
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
		},
		postRender: function( options ) {
			// Save button
			this.$( '.continue' ).on( 'click', $.proxy( this, 'prepareForSave' ) );
			this.$( '.submit' ).on( 'click', $.proxy( this, 'save' ) );
			this.$( '.back' ).on( 'click', $.proxy( this, 'switchToEditor' ) );
			this._super( options );
		},
		switchToEditor: function() {
			this._showHidden( '.initial-header' );
			this.$( '.surface' ).show();
			this.docToSave = false;
		},
		prepareForSave: function() {
			var self = this,
				doc = this.target.surface.getModel().getDocument();
			this.$( '.surface' ).hide();
			self._showHidden( '.save-header, .save-panel' );
			self.$( '.submit' ).prop( 'disabled', true );
			this.$spinner.show();
			// Preload the serialization
			if ( !this.docToSave ) {
				this.docToSave = ve.dm.converter.getDomFromModel( doc );
			}
			this.target.prepareCacheKey( this.docToSave ).done( function () {
				self.clearSpinner();
				self.$( '.submit' ).prop( 'disabled', false );
			} );
		},
		save: function() {
			var summary = this.$( '.save-panel input' ).val(),
				options = { summary: summary };

			this.$spinner.show();
			// Stop the confirmation message from being thrown when you hit save.
			this.hasChanged = false;
			this.$( '.surface, .summary-area' ).hide();
			if ( this.captchaId ) {
				// Intentional Lcase ve save api properties
				options.captchaid = this.captchaId;
				options.captchaword = this.$( '.captcha-word' ).val();
			}
			this.target.save( this.docToSave, options );
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
		},
		reportError: function ( msg ) {
			popup.show( msg, 'toast error' );
		},
		onSurfaceReady: function () {
			this.clearSpinner();
			this.target.surface.getModel().getDocument().connect( this, { 'transact': 'onTransact' } );
			this.target.surface.$element.addClass( 'content' );
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
