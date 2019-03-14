/* global ve */
var EditorOverlayBase = require( './EditorOverlayBase' ),
	EditorGateway = require( './EditorGateway' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	util = require( '../mobile.startup/util' );

/**
 * Overlay for VisualEditor view
 * @class VisualEditorOverlay
 * @extends EditorOverlayBase
 *
 * @param {Object} options Configuration options
 * @param {EditorOverlay} options.EditorOverlay Class to use for standard
 *  Wikitext editor. It must be passed in explicitly to avoid a cyclic
 *  dependency between VisualEdtiorOverlay and EditorOverlay
 */
function VisualEditorOverlay( options ) {
	this.applyHeaderOptions( options, true );
	EditorOverlayBase.call( this,
		util.extend( {
			isBorderBox: false,
			className: 'overlay editor-overlay editor-overlay-ve'
		}, options )
	);
	this.EditorOverlay = options.EditorOverlay;
	this.isNewPage = options.isNewPage;

	// Gateway present for a few utility purposes; the VE articletarget
	// handles the actual API calls separately
	this.gateway = new EditorGateway( {
		api: options.api,
		title: options.title,
		sectionId: options.sectionId,
		oldId: options.oldId,
		isNewPage: options.isNewPage
	} );
}

mfExtend( VisualEditorOverlay, EditorOverlayBase, {
	/**
	 * @inheritdoc
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	templatePartials: util.extend( {}, EditorOverlayBase.prototype.templatePartials, {
		editHeader: mw.template.get( 'mobile.editor.overlay', 'toolbarVE.hogan' ),
		content: mw.template.get( 'mobile.editor.overlay', 'contentVE.hogan' )
	} ),
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
		}
	},
	/**
	 * @inheritdoc
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	show: function () {
		EditorOverlayBase.prototype.show.apply( this, arguments );

		// We don't use the default spinner. Instead, rely on the progressbar from init/editor.js.
		if ( !this.options.switched ) {
			this.hideSpinner();
			this.$el.addClass( 'loading' );
		}

		this.target = ve.init.mw.targetFactory.create( 'article', this, {
			$element: this.$el,
			// || null so that scrolling is not triggered for the lead (0) section
			// (which has no header to scroll to)
			section: this.options.sectionId || null
		} );
		this.target.once( 'surfaceReady', function () {
			this.emit( 'editor-loaded' );
			this.$el.removeClass( 'loading' );
		}.bind( this ) );
		this.target.load( this.options.dataPromise );
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
		var self = this,
			EditorOverlay = this.EditorOverlay;
		this.log( {
			action: 'abort',
			type: 'switchnochange',
			mechanism: 'navigate'
		} );
		// Save a user setting indicating that this user prefers using the SourceEditor
		mw.storage.set( 'preferredEditor', 'SourceEditor' );
		this.showSpinner();
		this.$el.find( '.surface' ).hide();
		self.hideSpinner();
		self.applyHeaderOptions( self.options, false );
		// Unset classes from other editor
		delete self.options.className;
		self.switching = true;
		self.overlayManager.replaceCurrent( new EditorOverlay( self.options ) );
		self.switching = false;
	},
	/**
	 * @inheritdoc
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	onSaveComplete: function () {
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

module.exports = VisualEditorOverlay;
