/* global ve */
var EditorOverlayBase = require( './EditorOverlayBase' ),
	EditorGateway = require( './EditorGateway' ),
	BlockMessage = require( './BlockMessage' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	router = mw.loader.require( 'mediawiki.router' ),
	util = require( '../mobile.startup/util' );

/**
 * Overlay for VisualEditor view
 * @class VisualEditorOverlay
 * @extends EditorOverlayBase
 *
 * @param {Object} options Configuration options
 * @param {SourceEditorOverlay} options.SourceEditorOverlay Class to use for standard
 *  Wikitext editor. It must be passed in explicitly to avoid a cyclic
 *  dependency between VisualEditorOverlay and SourceEditorOverlay
 */
function VisualEditorOverlay( options ) {
	EditorOverlayBase.call( this,
		util.extend( {
			hasToolbar: true,
			onBeforeExit: this.onBeforeExit.bind( this ),
			isBorderBox: false,
			className: 'overlay editor-overlay editor-overlay-ve'
		}, options )
	);
	this.SourceEditorOverlay = options.SourceEditorOverlay;
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
		editHeader: util.template( `
<div class="overlay-header header initial-header hideable hidden">
	<div class="toolbar"></div>
</div>
		` ),
		content: util.template( `
<div class="surface" lang="{{contentLang}}" dir="{{contentDir}}">
</div>
		` )
	} ),
	/**
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	editor: 'visualeditor',
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
		var overlay = this,
			options = this.options,
			showAnonWarning = options.isAnon && !options.switched;

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
			// log edit attempt
			overlay.log( { action: 'ready' } );
			overlay.log( { action: 'loaded' } );
		}.bind( this ) );
		this.dataPromise = this.target.load( this.options.dataPromise );

		if ( showAnonWarning ) {
			this.$anonWarning = this.createAnonWarning( this.options );
			this.$el.append( this.$anonWarning );
			this.$el.find( '.overlay-content' ).hide();
			this.$el.removeClass( 'loading' );
		} else {
			this.checkForBlocks();
		}
	},
	/**
	 * @inheritdoc
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	onBeforeExit: function ( exit ) {
		var overlay = this;
		EditorOverlayBase.prototype.onBeforeExit.call( this, function () {
			// If this function is called, the parent method has decided that we should exit
			exit();
			// VE-specific cleanup
			overlay.destroyTarget();
		} );
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
	 * @inheritdoc
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	onClickAnonymous: function () {
		var self = this;
		this.$anonWarning.hide();
		this.checkForBlocks().then( function () {
			self.$el.find( '.overlay-content' ).show();
		} );
	},

	/**
	 * Check if the user is blocked, and close the editor if they are
	 *
	 * @return {jQuery.Promise} Promise which resolves when the check is complete
	 */
	checkForBlocks: function () {
		var self = this;
		return this.dataPromise.then( function ( data ) {
			if ( data.visualeditor && data.visualeditor.blockinfo ) {
				// Lazy-load moment only if it's needed,
				// it's somewhat large (it is already used on
				// mobile by Echo's notifications panel, where it's also lazy-loaded)
				mw.loader.using( 'moment' ).then( function () {
					var block = self.parseBlockInfo( data.visualeditor.blockinfo ),
						message = new BlockMessage( block );
					message.toggle();
					self.hide();
				} );
			}
		} );
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
	 * Loads an {SourceEditorOverlay} and replaces the existing {VisualEditorOverlay}
	 * @memberof VisualEditorOverlay
	 * @instance
	 * @param {jQuery.Promise} [dataPromise] Optional promise for loading content
	 */
	switchToSourceEditor: function ( dataPromise ) {
		var self = this,
			SourceEditorOverlay = this.SourceEditorOverlay,
			options = this.getOptionsForSwitch();
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
		if ( dataPromise ) {
			// If switching with edits we can't stay in section editing, as a VE edit
			// can always affect the whole document (e.g. references)
			options.sectionId = null;
			router.navigateTo( document.title, {
				path: '#/editor/all',
				useReplaceState: true
			} );
		}
		self.switching = true;
		self.overlayManager.replaceCurrent( new SourceEditorOverlay( options, dataPromise ) );
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
