/* global ve, $ */
var EditorOverlayBase = require( './EditorOverlayBase' ),
	EditorGateway = require( './EditorGateway' ),
	fakeToolbar = require( '../mobile.init/fakeToolbar' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	router = mw.loader.require( 'mediawiki.router' ),
	identifyLeadParagraph = require( './identifyLeadParagraph' ),
	util = require( '../mobile.startup/util' );

/**
 * Overlay for VisualEditor view
 *
 * @class VisualEditorOverlay
 * @extends EditorOverlayBase
 *
 * @param {Object} options Configuration options
 * @param {SourceEditorOverlay} options.SourceEditorOverlay Class to use for standard
 *  Wikitext editor. It must be passed in explicitly to avoid a cyclic
 *  dependency between VisualEditorOverlay and SourceEditorOverlay
 */
function VisualEditorOverlay( options ) {
	var surfaceReady = util.Deferred();

	EditorOverlayBase.call( this,
		util.extend( {
			editSwitcher: false,
			hasToolbar: true,
			onBeforeExit: this.onBeforeExit.bind( this ),
			isBorderBox: false,
			className: 'overlay editor-overlay editor-overlay-ve'
		}, options )
	);
	this.SourceEditorOverlay = options.SourceEditorOverlay;
	this.isNewPage = options.isNewPage;
	this.fromModified = options.dataPromise && options.switched;

	// Gateway present for a few utility purposes; the VE articletarget
	// handles the actual API calls separately
	this.gateway = new EditorGateway( {
		api: options.api,
		title: options.title,
		sectionId: options.sectionId,
		oldId: options.oldId,
		isNewPage: options.isNewPage
	} );

	this.origDataPromise = this.options.dataPromise || mw.libs.ve.targetLoader.requestPageData(
		'visual',
		options.titleObj.getPrefixedDb(),
		{
			sessionStore: true,
			section: options.sectionId || null,
			oldId: options.oldId || undefined,
			targetName: ve.init.mw.MobileArticleTarget.static.trackingName
		}
	);

	this.target = ve.init.mw.targetFactory.create( 'article', this, {
		$element: this.$el,
		// string or null, but not undefined
		section: this.options.sectionId || null
	} );
	this.target.once( 'surfaceReady', function () {
		surfaceReady.resolve();

		this.target.getSurface().getModel().getDocument().once( 'transact', function () {
			this.log( { action: 'firstChange' } );
		}.bind( this ) );
	}.bind( this ) );

	this.target.load( this.origDataPromise );

	// Overlay is only shown after this is resolved. It must be resolved
	// with the API response regardless of what we are waiting for.
	this.dataPromise = this.origDataPromise.then( function ( data ) {
		return surfaceReady.then( function () {
			return data && data.visualeditor;
		} );
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
	 *
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
		var
			options = this.options,
			showAnonWarning = options.isAnon && !options.switched;

		EditorOverlayBase.prototype.show.apply( this, arguments );

		this.emit( 'editor-loaded' );
		// log edit attempt
		this.log( { action: 'ready' } );
		this.log( { action: 'loaded' } );

		if ( !showAnonWarning ) {
			this.redoTargetInit();
		} else {
			this.$anonWarning = this.createAnonWarning( this.options );
			this.$el.append( this.$anonWarning );
			this.$el.find( '.overlay-content' ).hide();
		}
	},
	/**
	 * Re-do some initialization steps that might have happened while the overlay
	 * was hidden, but only work correctly after it is shown.
	 */
	redoTargetInit: function () {
		this.target.adjustContentPadding();
		this.target.restoreEditSection();
		this.scrollToLeadParagraph();
	},
	/**
	 * Scroll so that the lead paragraph in edit mode shows at the same place on the screen
	 * as the lead paragraph in read mode.
	 *
	 * Their normal position is different because of (most importantly) the lead paragraph
	 * transformation to move it before the infobox, and also invisible templates and slugs
	 * caused by the presence of hatnote templates (both only shown in edit mode).
	 */
	scrollToLeadParagraph: function () {
		var editLead, editLeadView, readLead, offset, initialCursorOffset,
			currentPageHTMLParser = this.options.currentPageHTMLParser,
			fakeScroll = this.options.fakeScroll,
			$window = $( window ),
			section = this.target.section,
			surface = this.target.getSurface(),
			mode = surface.getMode();

		if ( ( section === null || section === '0' ) && mode === 'visual' ) {
			editLead = identifyLeadParagraph( surface.getView().$attachedRootNode );
			if ( currentPageHTMLParser.getLeadSectionElement() ) {
				readLead = identifyLeadParagraph( currentPageHTMLParser.getLeadSectionElement() );
			}

			if ( editLead && readLead ) {
				offset = $( editLead ).offset().top - ( $( readLead ).offset().top - fakeScroll );
				// Set a model range to match
				editLeadView = $( editLead ).data( 'view' );
				if ( editLeadView ) {
					surface.getModel().setLinearSelection(
						new ve.Range( editLeadView.getModel().getRange().start )
					);
					initialCursorOffset =
						surface.getView().getSelection().getSelectionBoundingRect().top;
					// Ensure the surface is tall enough to scroll the cursor into view
					surface.$element.css( 'min-height', $window.height() + initialCursorOffset - surface.padding.top );
				}
				$window.scrollTop( offset );
			}
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
		self.$el.find( '.overlay-content' ).show();
		this.redoTargetInit();
	},
	/**
	 * Reveal the editing interface.
	 *
	 * @memberof VisualEditorOverlay
	 * @instance
	 */
	switchToEditor: function () {
		this.showHidden( '.initial-header' );
	},
	/**
	 * Loads an {SourceEditorOverlay} and replaces the existing {VisualEditorOverlay}
	 *
	 * @memberof VisualEditorOverlay
	 * @instance
	 * @param {jQuery.Promise} [dataPromise] Optional promise for loading content
	 */
	switchToSourceEditor: function ( dataPromise ) {
		var self = this,
			SourceEditorOverlay = this.SourceEditorOverlay,
			newOverlay,
			options = this.getOptionsForSwitch();
		this.log( {
			action: 'abort',
			type: 'switchnochange',
			mechanism: 'navigate'
		} );
		this.logFeatureUse( {
			feature: 'editor-switch',
			action: 'source-mobile'
		} );

		// Save a user setting indicating that this user prefers using the SourceEditor
		mw.storage.set( 'preferredEditor', 'SourceEditor' );

		this.$el.addClass( 'switching' );
		this.$el.find( '.overlay-header-container' ).hide();
		this.$el.append( fakeToolbar() );
		this.target.getSurface().setReadOnly( true );

		if ( dataPromise ) {
			// If switching with edits we can't stay in section editing, as a VE edit
			// can always affect the whole document (e.g. references)
			options.sectionId = null;
			router.navigateTo( document.title, {
				path: '#/editor/all',
				useReplaceState: true
			} );
		}
		newOverlay = new SourceEditorOverlay( options, dataPromise );
		newOverlay.getLoadingPromise().then( function () {
			self.switching = true;
			self.overlayManager.replaceCurrent( newOverlay );
			self.switching = false;
		} );
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
		if ( this.saved ) {
			// If we just saved, there's not really any changes, and the
			// target is going to be destroyed in one tick
			return false;
		}
		return this.fromModified || (
			this.target &&
			this.target.getSurface() &&
			this.target.getSurface().getModel().hasBeenModified()
		);
	}
} );

module.exports = VisualEditorOverlay;
