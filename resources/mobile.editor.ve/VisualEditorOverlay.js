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
		isBorderBox: false,
		/** @inheritdoc **/
		templatePartials: $.extend( {}, EditorOverlayBase.prototype.templatePartials, {
			editHeader: mw.template.get( 'mobile.editor.ve', 'toolbarVE.hogan' ),
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
			options.isVisualEditor = isVE;
		},
		/** @inheritdoc **/
		initialize: function ( options ) {
			this.applyHeaderOptions( options, true );
			EditorOverlayBase.prototype.initialize.apply( this, arguments );
			this.isNewPage = options.isNewPage;
		},
		/**
		 * Destroy the existing VisualEditor target.
		 * @method
		 */
		destroyTarget: function () {
			if ( this.target ) {
				this.target.destroy();
				this.target = null;
			}
		},
		/** @inheritdoc **/
		show: function () {
			EditorOverlayBase.prototype.show.apply( this, arguments );
			var overlay = this;
			if ( this.target !== undefined ) {
				return;
			}
			// FIXME: we have to initialize MobileFrontendArticleTarget after this.$el
			// is attached to DOM, maybe we should attach it earlier and hide
			// overlays in a different way?
			mw.loader.using( 'ext.visualEditor.targetLoader' )
				.then( mw.libs.ve.targetLoader.loadModules )
				.then( function () {
					overlay.target = new ve.init.mw.MobileFrontendArticleTarget( overlay, {
						$element: overlay.$el,
						// || undefined so that scrolling is not triggered for the lead (0) section
						// (which has no header to scroll to)
						section: overlay.options.sectionId || undefined,
						isIos: overlay.isIos
					} );
					overlay.target.activating = true;
					overlay.target.load();
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
			this.$( '.surface' ).hide();
			EditorOverlayBase.prototype.postRender.apply( this );
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
		},
		/**
		 * Loads an {EditorOverlay} and replaces the existing {VisualEditorOverlay}
		 * @method
		 */
		switchToSourceEditor: function () {
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
				self.applyHeaderOptions( self.options, false );
				overlayManager.replaceCurrent( new EditorOverlay( self.options ) );
			} );
		},
		/** @inheritdoc **/
		onSaveComplete: function () {
			EditorOverlayBase.prototype.onSaveComplete.apply( this, arguments );
			this.destroyTarget();
		},
		/** @inheritdoc **/
		hasChanged: function () {
			return this.target &&
				this.target.getSurface() &&
				this.target.getSurface().getModel().hasBeenModified();
		}
	} );

	M.define( 'modules/editor/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, jQuery, window.ve ) );
