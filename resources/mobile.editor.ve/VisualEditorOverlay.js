( function ( M, $, ve ) {
	var EditorOverlayBase = M.require( 'mobile.editor.common/EditorOverlayBase' ),
		settings = M.require( 'mobile.settings/settings' ),
		overlayManager = M.require( 'mobile.startup/overlayManager' );

	/**
	 * Overlay for VisualEditor view
	 * @class VisualEditorOverlay
	 * @extends EditorOverlayBase
	 */
	function VisualEditorOverlay( options ) {
		this.applyHeaderOptions( options, true );
		EditorOverlayBase.apply( this, arguments );
		this.isNewPage = options.isNewPage;
	}

	OO.mfExtend( VisualEditorOverlay, EditorOverlayBase, {
		/** @inheritdoc **/
		isBorderBox: false,
		/** @inheritdoc **/
		templatePartials: $.extend( {}, EditorOverlayBase.prototype.templatePartials, {
			editHeader: mw.template.get( 'mobile.editor.ve', 'toolbarVE.hogan' ),
			content: mw.template.get( 'mobile.editor.ve', 'contentVE.hogan' )
		} ),
		/** @inheritdoc **/
		className: 'overlay editor-overlay editor-overlay-ve',
		editor: 'visualeditor',
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
			var overlay = this;
			EditorOverlayBase.prototype.show.apply( this, arguments );
			if ( this.target !== undefined ) {
				return;
			}
			// FIXME: we have to initialize MobileFrontendArticleTarget after this.$el
			// is attached to DOM, maybe we should attach it earlier and hide
			// overlays in a different way?
			mw.loader.using( 'ext.visualEditor.targetLoader' )
				.then( mw.libs.ve.targetLoader.loadModules )
				.then( function () {
					overlay.target = ve.init.mw.targetFactory.create( 'article', overlay, {
						$element: overlay.$el,
						// || undefined so that scrolling is not triggered for the lead (0) section
						// (which has no header to scroll to)
						section: overlay.options.sectionId || undefined
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
			this.log( {
				action: 'abort',
				type: 'switchnochange',
				mechanism: 'navigate'
			} );
			// Save a user setting indicating that this user prefers using the SourceEditor
			settings.save( 'preferredEditor', 'SourceEditor', true );
			this.showSpinner();
			this.$( '.surface' ).hide();
			// Load the SourceEditor and replace the VisualEditor overlay with it
			mw.loader.using( 'mobile.editor.overlay', function () {
				var EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' );

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

	M.define( 'mobile.editor.ve/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, jQuery, window.ve ) );
