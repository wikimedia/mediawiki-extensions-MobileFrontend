/* global ve, $ */
const mobile = require( 'mobile.startup' ),
	EditorOverlayBase = require( './EditorOverlayBase.js' ),
	EditorGateway = require( './EditorGateway.js' ),
	identifyLeadParagraph = require( './identifyLeadParagraph.js' ),
	setPreferredEditor = require( './setPreferredEditor.js' ),
	util = mobile.util,
	overlayManager = mobile.getOverlayManager(),
	currentPageFn = mobile.currentPage;

/**
 * Overlay for VisualEditor view
 *
 * @private
 */
class VisualEditorOverlay extends EditorOverlayBase {
	/**
	 * @param {Object} options Configuration options
	 * @param {SourceEditorOverlay} options.SourceEditorOverlay Class to use for standard
	 *  Wikitext editor. It must be passed in explicitly to avoid a cyclic
	 *  dependency between VisualEditorOverlay and SourceEditorOverlay
	 */
	constructor( options ) {
		const surfaceReady = util.Deferred();

		super(
			util.extend( {
				editSwitcher: false,
				hasToolbar: true,
				onBeforeExit: ( exit, cancel ) => {
					this.onBeforeExit( exit, cancel );
				},
				isBorderBox: false,
				className: 'overlay editor-overlay editor-overlay-ve'
			}, options )
		);
		// VE surfaces must be attached to the DOM while initializing, and measurable
		this.$el.addClass( 'editor-overlay-ve-initializing' );
		overlayManager.container.appendChild( this.$el[ 0 ] );
		this.SourceEditorOverlay = options.SourceEditorOverlay;
		this.isNewPage = options.isNewPage;
		this.fromModified = options.dataPromise && options.switched;

		// Gateway present for a few utility purposes; the VE articletarget
		// handles the actual API calls separately
		this.gateway = new EditorGateway( {
			api: options.api,
			title: options.title,
			sectionId: options.sectionId,
			oldId: options.oldId
		} );

		const origDataPromise = options.dataPromise || mw.libs.ve.targetLoader.requestPageData(
			'visual',
			options.titleObj.getPrefixedDb(),
			{
				sessionStore: true,
				section: options.sectionId || null,
				oldId: options.oldId || undefined,
				targetName: ve.init.mw.MobileArticleTarget.static.trackingName,
				preload: options.preload,
				preloadparams: options.preloadparams,
				editintro: options.editintro
			}
		);

		const modes = [];
		const currentPage = currentPageFn();
		if ( currentPage.isVEVisualAvailable() ) {
			modes.push( 'visual' );
		}
		if ( currentPage.isVESourceAvailable() ) {
			modes.push( 'source' );
		}

		this.target = ve.init.mw.targetFactory.create( 'article', this, {
			$element: this.$el,
			// string or null, but not undefined
			section: this.options.sectionId || null,
			modes,
			// If source is passed in without being in modes, it'll just fall back to visual
			defaultMode: this.options.mode === 'source' ? 'source' : 'visual'
		} );
		this.target.once( 'surfaceReady', () => {
			surfaceReady.resolve();

			this.target.getSurface().getModel().getDocument().once( 'transact', () => {
				this.log( { action: 'firstChange' } );
			} );
		} );
		let firstLoad = true;
		this.target.on( 'surfaceReady', () => {
			setPreferredEditor( this.target.getDefaultMode() === 'source' ? 'SourceEditor' : 'VisualEditor' );
			// On first surfaceReady we wait for any dialogs to be closed before running targetInit.
			// On subsequent surfaceReady's (i.e. edit mode switch) we can initialize immediately.
			if ( !firstLoad ) {
				this.targetInit();
			}
			firstLoad = false;
		} );

		this.target.load( origDataPromise );

		// Overlay is only shown after this is resolved. It must be resolved
		// with the API response regardless of what we are waiting for.
		this.dataPromise = origDataPromise.then( ( data ) => {
			this.gateway.wouldautocreate =
				data && data.visualeditor && data.visualeditor.wouldautocreate;

			return surfaceReady.then( () => {
				this.$el.removeClass( 'editor-overlay-ve-initializing' );
				return data && data.visualeditor;
			} );
		} );
	}

	/**
	 * @inheritdoc
	 */
	get templatePartials() {
		return util.extend( {}, super.templatePartials, {
			editHeader: util.template( `
	<div class="overlay-header header initial-header hideable hidden">
		<div class="toolbar"></div>
	</div>
			` ),
			content: util.template( `
	<div class="surface" lang="{{contentLang}}" dir="{{contentDir}}">
	</div>
			` )
		} );
	}

	/**
	 * @inheritdoc
	 */
	get editor() {
		return 'visualeditor';
	}

	/**
	 * Destroy the existing VisualEditor target.
	 *
	 */
	destroyTarget() {
		if ( this.target ) {
			this.target.destroy();
			this.target = null;
		}
	}

	/**
	 * @inheritdoc
	 */
	show() {
		const
			options = this.options,
			showAnonWarning = options.isAnon && !options.switched;

		super.show();

		// log edit attempt
		this.log( { action: 'ready' } );
		this.log( { action: 'loaded' } );
		// FIXME extracted function to support success/error callbacks, remove
		//  after T408484 experiment concludes
		const renderWarnings = () => {
			this.$anonTalkWarning = this.createAnonTalkWarning();
			this.$el.append( [ this.$anonTalkWarning, this.$anonWarning ] );
			this.$el.find( '.overlay-content' ).hide();
			// De-select the surface so most tools are disabled (T336437)
			this.target.getSurface().getModel().setNullSelection();
		};

		if ( !showAnonWarning ) {
			this.targetInit();
		} else {
			mw.loader.using( 'ext.testKitchen' ).then( () => {
				const experiment = mw.testKitchen.getExperiment( 'growthexperiments-editattempt-anonwarning' );
				if ( experiment.isAssignedGroup( 'treatment' ) ) {
					this.$anonWarning = this.createAnonWarningSoft( this.options );
				} else {
					this.$anonWarning = this.createAnonWarning( this.options );
				}
				renderWarnings();
			}, () => {
				this.$anonWarning = this.createAnonWarning( this.options );
				renderWarnings();
			} );
		}

		this.emit( 'editor-loaded' );
	}

	/**
	 * Initialize the target after it has been made visible
	 */
	targetInit() {
		// Note this.target will not be set if an error occurred and/or destroyTarget was called.
		if ( this.target ) {
			this.target.afterSurfaceReady();
			this.scrollToLeadParagraph();
			this.showEditNotices();
		}
	}

	/**
	 * Scroll so that the lead paragraph in edit mode shows at the same place on the screen
	 * as the lead paragraph in read mode.
	 *
	 * Their normal position is different because of (most importantly) the lead paragraph
	 * transformation to move it before the infobox, and also invisible templates and slugs
	 * caused by the presence of hatnote templates (both only shown in edit mode).
	 */
	scrollToLeadParagraph() {
		let editLead, editLeadView, readLead, offset, initialCursorOffset;

		const
			currentPageHTMLParser = this.options.currentPageHTMLParser,
			fakeScroll = this.options.fakeScroll,
			$window = $( window ),
			section = this.target.section !== null ?
				this.target.section : this.target.visibleSection,
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
	}

	/**
	 * @inheritdoc
	 */
	onBeforeExit( exit, cancel ) {
		super.onBeforeExit( () => {
			// If this function is called, the parent method has decided that we should exit
			exit();
			// VE-specific cleanup
			this.destroyTarget();
		}, cancel );
	}

	/**
	 * @inheritdoc
	 */
	onClickBack() {
		super.onClickBack();
		this.switchToEditor();
	}

	/**
	 * @inheritdoc
	 */
	onClickAnonymous() {
		this.$anonWarning.hide();
		this.$anonTalkWarning.hide();
		this.$el.find( '.overlay-content' ).show();
		this.targetInit();
	}

	/**
	 * Reveal the editing interface.
	 *
	 */
	switchToEditor() {
		this.showHidden( '.initial-header' );
	}

	/**
	 * Loads an {SourceEditorOverlay} and replaces the existing {VisualEditorOverlay}
	 *
	 * @param {jQuery.Promise} [dataPromise] Optional promise for loading content
	 */
	switchToSourceEditor( dataPromise ) {
		const SourceEditorOverlay = this.SourceEditorOverlay,
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
		setPreferredEditor( 'SourceEditor' );

		this.$el.addClass( 'switching' );
		this.$el.find( '.overlay-header-container' ).hide();
		this.$el.append( this.fakeToolbar() );
		this.target.getSurface().setReadOnly( true );

		if ( dataPromise ) {
			// If switching with edits we can't stay in section editing, as a VE edit
			// can always affect the whole document (e.g. references)
			options.sectionId = null;
			history.replaceState( null, document.title, '#/editor/all' );
		}
		const newOverlay = new SourceEditorOverlay( options, dataPromise );
		newOverlay.getLoadingPromise().then( () => {
			this.switching = true;
			this.overlayManager.replaceCurrent( newOverlay );
			this.switching = false;
		} );
	}

	/**
	 * @inheritdoc
	 */
	hasChanged() {
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
}

module.exports = VisualEditorOverlay;
