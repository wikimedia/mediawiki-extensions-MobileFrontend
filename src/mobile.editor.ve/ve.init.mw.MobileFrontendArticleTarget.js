/* global $ */

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
	this.useScrollContainer = ve.init.platform.constructor.static.isIos();

	// Parent constructor
	MobileFrontendArticleTarget.super.call( this, config );

	// Events
	this.onWindowScrollDebounced = ve.debounce( this.onWindowScroll.bind( this ), 100 );
	$( this.getElementWindow() ).on( 'scroll', this.onWindowScrollDebounced );

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

	$( this.getElementWindow() ).off( 'scroll', this.onWindowScrollDebounced );
	this.$overlay.css( 'padding-top', '' );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.getScrollContainer = function () {
	if ( this.useScrollContainer ) {
		return this.overlay.$el.find( '.overlay-content' );
	}
	// Parent method
	return MobileFrontendArticleTarget.super.prototype.getScrollContainer.call( this );
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
 * Handle window scroll events
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.onWindowScroll = function () {
	var $window, windowTop, contentTop,
		surface = this.surface,
		surfaceView = surface.getView(),
		target = this;
	// iOS applies a scroll offset to the window when opening the keyboard to move the cursor into
	// view. On the editing surface, this is not necessary (we set large padding-bottom so that the
	// keyboard covers nothing); apply this offset to the surface instead. But in other cases allow
	// it to happen, otherwise the user can't scroll to see whatever is underneath the keyboard.
	// (T210559, T215604, T212967)
	if ( this.useScrollContainer && surfaceView.isFocused() && !surfaceView.deactivated ) {
		$window = $( target.getElementWindow() );
		windowTop = $window.scrollTop();
		contentTop = target.$scrollContainer.scrollTop();

		$window.scrollTop( 0 );
		surface.scrollTo( contentTop + windowTop );
		// Make sure we didn't overshoot the cursor
		surface.scrollCursorIntoView( target.getSurface() );
	}
};

/**
 * Handle surface scroll events
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
MobileFrontendArticleTarget.prototype.onSurfaceScroll = function () {
	var nativeSelection, range;

	if ( ve.init.platform.constructor.static.isIos() ) {
		// iOS has another bug (!) where if you change the scroll offset of a
		// contentEditable with a cursor visible it disappears, so remove and
		// reapply the selection in that case.
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
		surface.$element.addClass( 'content loading' );
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

	// Parent method
	MobileFrontendArticleTarget.super.prototype.surfaceReady.apply( this, arguments );

	this.overlay.hideSpinner();
	surface.$element.removeClass( 'loading' );

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

	this.overlay.sectionLine = '#' + fragment;
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

module.exports = MobileFrontendArticleTarget;
