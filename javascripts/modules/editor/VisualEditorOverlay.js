( function( M, $, ve ) {
	var OverlayNew = M.require( 'OverlayNew' ),
		Page = M.require( 'Page' ),
		popup = M.require( 'notifications' ),
		VisualEditorOverlay;

	VisualEditorOverlay = OverlayNew.extend( {
		closeOnBack: true,
		className: 'overlay editor-overlay',
		template: M.template.get( 'modules/editor/VisualEditorOverlay' ),
		defaults: {
			continueMsg: mw.msg( 'mobile-frontend-editor-continue' ),
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			keepEditingMsg: mw.msg( 'mobile-frontend-editor-keep-editing' ),
			summaryMsg: mw.msg( 'mobile-frontend-editor-summary-placeholder' ),
			licenseMsg: mw.msg( 'mobile-frontend-editor-license' )
		},
		initialize: function( options ) {
			var self = this;
			this.hasChanged = false;
			this._super( options );
			this.$spinner = self.$( '.spinner' );
			this.$continueBtn = self.$( '.continue' ).prop( 'disabled', true );
			this.target = new ve.init.mw.MobileViewTarget( this.$( '.surface' ), options.sectionId );
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
				saveErrorCaptcha: 'onSaveError',
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
			this._super( options );
		},
		prepareForSave: function() {
			var self = this,
				doc = this.target.surface.getModel().getDocument();
			// Disable VE surface
			this.target.surface.getView().disable();
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
			var summary = this.$( '.save-panel input' ).val();

			this.$spinner.show();
			// Stop the confirmation message from being thrown when you hit save.
			this.canHide = true;
			this.$( '.surface, .summary-area' ).hide();
			this.target.save( this.docToSave, { 'summary': summary } );
		},
		showSpinner: function () {
			this.$spinner.show();
		},
		clearSpinner: function() {
			this.$spinner.hide();
		},
		reportError: function ( msg ) {
			popup.show( msg, 'toast error' );
		},
		onSave: function() {
			var title = mw.config.get( 'wgTitle' );
			// FIXME: use generic method for following 3 lines
			M.pageApi.invalidatePage( title );
			new Page( { title: title, el: $( '#content_wrapper' ) } ).on( 'ready', M.reloadPage );
			M.router.navigate( '' );
			this.clearSpinner();
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
		// FIXME: Code duplication with EditorOverlay.js, Needs abstraction
		hide: function() {
			var confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );
			if ( !this.hasChanged || this.canHide || window.confirm( confirmMessage ) ) {
				return this._super();
			} else {
				return false;
			}
		},
		_showHidden: function( className ) {
			// can't use jQuery's hide() and show() beause show() sets display: block
			// and we want display: table for headers
			this.$( '.hideable' ).addClass( 'hidden' );
			this.$( className ).removeClass( 'hidden' );
		}
	} );

	M.define( 'modules/editor/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, jQuery, window.ve ) );
