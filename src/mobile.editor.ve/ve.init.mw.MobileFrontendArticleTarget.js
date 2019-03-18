/*!
 * VisualEditor MediaWiki Initialization MobileFrontendArticleTarget class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/* global ve */
var MobileArticleTarget = ve.init.mw.MobileArticleTarget,
	parseSaveError = require( '../mobile.editor.overlay/parseSaveError' ),
	Target = ve.init.mw.Target;

/**
 * MediaWiki mobile frontend article target.
 *
 * @class
 * @extends MobileArticleTarget
 *
 * @param {VisualEditorOverlay} overlay Mobile frontend overlay
 * @param {Object} [config] Configuration options
 */
function MobileFrontendArticleTarget( overlay, config ) {
	this.overlay = overlay;
	this.$overlay = overlay.$el;
	this.$overlaySurface = overlay.$el.find( '.surface' );

	// Parent constructor
	MobileFrontendArticleTarget.super.call( this, config );

	// Initialization
	this.$element.addClass( 've-init-mw-mobileFrontendArticleTarget' );
}

/* Inheritance */

OO.inheritClass( MobileFrontendArticleTarget, MobileArticleTarget );

/* Static Properties */

MobileFrontendArticleTarget.static.parseSaveError = parseSaveError;

/* Methods */

/**
 * Destroy the target
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.destroy = function () {
	// Parent method
	MobileFrontendArticleTarget.super.prototype.destroy.call( this );

	this.$overlay.css( 'padding-top', '' );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.isToolbarOverSurface = function () {
	return true;
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.onContainerScroll = function () {
	// MF provides the toolbar so there is no need to float the toolbar
};

/**
 * Handle surface scroll events
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.onSurfaceScroll = function () {
	var nativeSelection, range;

	if ( ve.init.platform.constructor.static.isIos() ) {
		// iOS has a bug where if you change the scroll offset of a
		// contentEditable or textarea with a cursor visible, it disappears.
		// This function works around it by removing and reapplying the selection.
		nativeSelection = this.getSurface().getView().nativeSelection;
		if ( nativeSelection.rangeCount && document.activeElement.contentEditable === 'true' ) {
			range = nativeSelection.getRangeAt( 0 );
			nativeSelection.removeAllRanges();
			nativeSelection.addRange( range );
		}
	}
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.createSurface = function ( dmDoc, config ) {
	var surface;
	if ( this.overlay.isNewPage ) {
		config = ve.extendObject( {
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder-new-page', mw.user )
		}, config );
	}

	// Parent method
	surface = MobileFrontendArticleTarget
		.super.prototype.createSurface.call( this, dmDoc, config );

	surface.connect( this, { scroll: 'onSurfaceScroll' } );

	return surface;
};

/**
 * @inheritdoc
 */
MobileFrontendArticleTarget.prototype.setSurface = function ( surface ) {
	var changed = surface !== this.surface;

	// Parent method
	Target.super.prototype.setSurface.apply( this, arguments );

	if ( changed ) {
		surface.$element.addClass( 'content' );
		this.$overlaySurface.append( surface.$element );
	}
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.surfaceReady = function () {
	var surface = this.getSurface();

	if ( this.teardownPromise ) {
		// Loading was cancelled, the overlay is already closed at this point. Do nothing.
		// Otherwise e.g. scrolling from #goToHeading would kick in and mess things up.
		return;
	}

	// Parent method
	MobileFrontendArticleTarget.super.prototype.surfaceReady.apply( this, arguments );

	this.overlay.hideSpinner();

	surface.getContext().connect( this, { resize: 'adjustContentPadding' } );
	this.adjustContentPadding();

	this.maybeShowWelcomeDialog();
};

/**
 * Match the content padding to the toolbar height
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.adjustContentPadding = function () {
	var toolbarHeight = this.getToolbar().$element.outerHeight(),
		surface = this.getSurface();
	surface.setToolbarHeight( toolbarHeight );
	this.$overlay.css( 'padding-top', toolbarHeight );
	this.getSurface().scrollCursorIntoView();
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.loadFail = function ( key, text ) {
	// Parent method
	MobileFrontendArticleTarget.super.prototype.loadFail.apply( this, arguments );

	this.overlay.reportError( text );
	this.overlay.hide();
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.editSource = function () {
	var target = this;
	// If changes have been made tell the user they have to save first
	if ( !this.getSurface().getModel().hasBeenModified() ) {
		this.overlay.switchToSourceEditor();
	} else {
		OO.ui.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ).then( function ( confirmed ) {
			if ( confirmed ) {
				target.showSaveDialog();
			}
		} );
	}
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.save = function () {
	// Parent method
	MobileFrontendArticleTarget.super.prototype.save.apply( this, arguments );

	this.overlay.log( {
		action: 'saveAttempt'
	} );
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.showSaveDialog = function () {
	// Parent method
	MobileFrontendArticleTarget.super.prototype.showSaveDialog.apply( this, arguments );

	this.overlay.log( {
		action: 'saveIntent'
	} );
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.saveComplete = function () {
	var fragment = this.getSectionFragmentFromPage();
	// Parent method
	MobileFrontendArticleTarget.super.prototype.saveComplete.apply( this, arguments );

	this.overlay.sectionId = fragment;
	this.overlay.onSaveComplete();
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 * @param {HTMLDocument} doc HTML document we tried to save
 * @param {Object} saveData Options that were used
 * @param {boolean} wasRetry Whether this was a retry after a 'badtoken' error
 * @param {Object} jqXHR
 * @param {string} status Text status message
 * @param {Object|null} response API response data
 */
// eslint-disable-next-line max-len
MobileFrontendArticleTarget.prototype.saveFail = function ( doc, saveData, wasRetry, jqXHR, status, response ) {

	// parent method
	MobileFrontendArticleTarget.super.prototype.saveFail.apply( this, arguments );

	this.overlay.onSaveFailure( this.constructor.static.parseSaveError( response, status ) );
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.tryTeardown = function () {
	// Parent method
	MobileFrontendArticleTarget.super.prototype.tryTeardown.apply( this, arguments )
		.then( function () {
			// eslint-disable-next-line no-restricted-properties
			window.history.back();
		} );
};

MobileFrontendArticleTarget.prototype.load = function () {
	var surface;

	// Create dummy surface to show toolbar while loading
	// Call ve.init.Target directly to avoid firing surfaceReady
	surface = ve.init.Target.prototype.addSurface.call( this, new ve.dm.Document( [
		{ type: 'paragraph' }, { type: '/paragraph' },
		{ type: 'internalList' }, { type: '/internalList' }
	] ) );
	surface.setReadOnly( true );
	// setSurface creates dummy toolbar
	this.setSurface( surface );

	return MobileFrontendArticleTarget.super.prototype.load.apply( this, arguments );
};

MobileFrontendArticleTarget.prototype.setupToolbar = function ( surface ) {
	var $header = this.overlay.$el.find( '.overlay-header-container' );

	// Parent method
	MobileFrontendArticleTarget.super.prototype.setupToolbar.call( this, surface );

	// Animate the toolbar sliding into place.
	// Do not animate if we're replacing the wikitext editor toolbar.
	if ( !this.overlay.options.switched ) {
		$header.addClass( 'toolbar-hidden' );
		setTimeout( function () {
			$header.addClass( 'toolbar-shown' );
			setTimeout( function () {
				$header.addClass( 'toolbar-shown-done' );
			}, 250 );
		} );
	}
};

MobileFrontendArticleTarget.prototype.attachToolbar = function () {
	// Move the toolbar to the overlay header
	// FIXME We override the parent method because it does this wrong
	// (uses a global selector for the .toolbar)
	this.overlay.$el.find( '.overlay-header > .toolbar' ).append( this.toolbar.$element );
	this.toolbar.initialize();
};

module.exports = MobileFrontendArticleTarget;
