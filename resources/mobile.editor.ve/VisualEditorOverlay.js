( function ( M, ve ) {
	var EditorOverlayBase = M.require( 'mobile.editor.common/EditorOverlayBase' ),
		util = M.require( 'mobile.startup/util' );

	/**
	 * Overlay for VisualEditor view
	 * @class VisualEditorOverlay
	 * @extends EditorOverlayBase
	 *
	 * @param {Object} options Configuration options
	 */
	function VisualEditorOverlay( options ) {
		this.applyHeaderOptions( options, true );
		EditorOverlayBase.apply( this, arguments );
		this.isNewPage = options.isNewPage;
	}

	OO.mfExtend( VisualEditorOverlay, EditorOverlayBase, {
		/**
		 * Disable this for now as it breaks OOUI dialogs (T126240)
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		hasFixedHeader: false,
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		isBorderBox: false,
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		templatePartials: util.extend( {}, EditorOverlayBase.prototype.templatePartials, {
			editHeader: mw.template.get( 'mobile.editor.ve', 'toolbarVE.hogan' ),
			content: mw.template.get( 'mobile.editor.ve', 'contentVE.hogan' )
		} ),
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		className: 'overlay editor-overlay editor-overlay-ve',
		/**
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		editor: 'visualeditor',
		/**
		 * Set options that apply specifically to VisualEditorOverlay but not
		 * EditorOverlay so that an EditorOverlay instance can be created effortlessly.
		 * FIXME: Must be smarter way to do this.
		 * @memberof VisualEditorOverlay
		 * @instance
		 * @param {Object} options Configuration options
		 * @param {boolean} isVE whether the options are being generated for a VisualEditorOverlay
		 *  or a EditorOverlay
		 */
		applyHeaderOptions: function ( options, isVE ) {
			// Set things that are known to be true.
			options.hasToolbar = isVE;
			options.isVisualEditor = isVE;
		},
		/**
		 * Destroy the existing VisualEditor target.
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		destroyTarget: function () {
			if ( this.target ) {
				this.target.destroy();
				this.target = null;
				// TODO: Make this abortable so we can destroy a not-yet created target
				this.targetPromise = null;
			}
		},
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		show: function () {
			var overlay = this;
			EditorOverlayBase.prototype.show.apply( this, arguments );
			if ( this.targetPromise ) {
				return;
			}
			// FIXME: we have to initialize MobileFrontendArticleTarget after this.$el
			// is attached to DOM, maybe we should attach it earlier and hide
			// overlays in a different way?
			this.targetPromise = mw.loader.using( 'ext.visualEditor.targetLoader' )
				.then( mw.libs.ve.targetLoader.loadModules )
				.then( function () {
					overlay.target = ve.init.mw.targetFactory.create( 'article', overlay, {
						$element: overlay.$el,
						// || null so that scrolling is not triggered for the lead (0) section
						// (which has no header to scroll to)
						section: overlay.options.sectionId || null
					} );
					overlay.target.load();
					overlay.saved = false;
				}, function ( e ) {
					mw.log.warn( 'VisualEditor failed to load: ' + e );
					overlay.hide();
				} );
		},
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		hide: function () {
			var overlay = this,
				retval = EditorOverlayBase.prototype.hide.apply( this, arguments );
			if ( retval === true ) {
				this.destroyTarget();
			} else if ( retval && retval.then ) {
				retval.then( function ( hide ) {
					if ( hide ) {
						overlay.destroyTarget();
					}
				} );
			}
			return retval;
		},
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		onClickBack: function () {
			EditorOverlayBase.prototype.onClickBack.apply( this, arguments );
			this.switchToEditor();
		},

		/**
		 * Reveal the editing interface.
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		switchToEditor: function () {
			this.showHidden( '.initial-header' );
		},
		/**
		 * Loads an {EditorOverlay} and replaces the existing {VisualEditorOverlay}
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		switchToSourceEditor: function () {
			var self = this;
			this.log( {
				action: 'abort',
				type: 'switchnochange',
				mechanism: 'navigate'
			} );
			// Save a user setting indicating that this user prefers using the SourceEditor
			mw.storage.set( 'preferredEditor', 'SourceEditor' );
			this.showSpinner();
			this.$( '.surface' ).hide();
			// Load the SourceEditor and replace the VisualEditor overlay with it
			mw.loader.using( 'mobile.editor.overlay', function () {
				var EditorOverlay = M.require( 'mobile.editor.overlay/EditorOverlay' );

				self.hideSpinner();
				self.applyHeaderOptions( self.options, false );
				self.overlayManager.replaceCurrent( new EditorOverlay( self.options ) );
			} );
		},
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		onSaveComplete: function () {
			this.saved = true;
			EditorOverlayBase.prototype.onSaveComplete.apply( this, arguments );
			this.destroyTarget();
		},
		/**
		 * @inheritdoc
		 * @memberof VisualEditorOverlay
		 * @instance
		 */
		hasChanged: function () {
			return this.target &&
				this.target.getSurface() &&
				this.target.getSurface().getModel().hasBeenModified() &&
				// If we just saved, there's not really any changes, and the
				// target is going to be destroyed in one tick
				!this.saved;
		}
	} );

	M.define( 'mobile.editor.ve/VisualEditorOverlay', VisualEditorOverlay );

}( mw.mobileFrontend, window.ve ) );
