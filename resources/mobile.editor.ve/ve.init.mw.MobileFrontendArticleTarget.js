/*!
 * VisualEditor MediaWiki Initialization MobileFrontendArticleTarget class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/* global ve, $ */

// jscs:disable

/**
 * MediaWiki mobile frontend article target.
 *
 * @class
 * @extends ve.init.mw.MobileArticleTarget
 *
 * @constructor
 * @param {VisualEditorOverlay} overlay Mobile frontend overlay
 * @param {Object} [config] Configuration options
 */
ve.init.mw.MobileFrontendArticleTarget = function VeInitMwMobileFrontendArticleTarget( overlay, config ) {
	this.overlay = overlay;
	this.$overlay = overlay.$el;
	this.$overlaySurface = overlay.$el.find( '.surface' );
	this.useScrollContainer = ve.init.platform.constructor.static.isIos();

	// Parent constructor
	ve.init.mw.MobileFrontendArticleTarget.super.call( this, config );

	// Events
	this.onWindowScrollDebounced = ve.debounce( this.onWindowScroll.bind( this ), 100 );
	$( this.getElementWindow() ).on( 'scroll', this.onWindowScrollDebounced );

	// Initialization
	this.$element.addClass( 've-init-mw-mobileFrontendArticleTarget' );
};

/* Inheritance */

OO.inheritClass( ve.init.mw.MobileFrontendArticleTarget, ve.init.mw.MobileArticleTarget );

/* Static Properties */

/* Methods */

/**
 * Destroy the target
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.destroy = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.destroy.call( this );

	$( this.getElementWindow() ).off( 'scroll', this.onWindowScrollDebounced );
	this.$overlay.css( 'padding-top', '' );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.getScrollContainer = function () {
	if ( this.useScrollContainer ) {
		return this.overlay.$el.find( '.overlay-content' );
	}
	// Parent method
	return ve.init.mw.MobileFrontendArticleTarget.super.prototype.getScrollContainer.call( this );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.isToolbarOverSurface = function () {
	return true;
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onContainerScroll = function () {
	// MF provides the toolbar so there is no need to float the toolbar
};

/**
 * Handle window scroll events
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onWindowScroll = function () {
	var target = this;
	// The window can only scroll in iOS if the keyboard has been opened
	if ( this.useScrollContainer ) {
		// iOS applies a scroll offset to the window to move the cursor
		// into view. Apply this offset to the surface instead.
		var $window = $( target.getElementWindow() ),
			windowTop = $window.scrollTop(),
			contentTop = target.$scrollContainer.scrollTop();

		$window.scrollTop( 0 );
		target.scrollTo( contentTop + windowTop );
		// Make sure we didn't overshoot the cursor
		target.scrollCursorIntoView( target.getSurface() );
	}
};

/*
 * Handle surface scroll events
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onSurfaceScroll = function () {
	var nativeSelection, range;

	if ( ve.init.platform.constructor.static.isIos() ) {
		// iOS has another bug (!) where if you change the scroll offset of a
		// contentEditable with a cursor visible it disappears, so remove and
		// reapply the selection in that case.
		nativeSelection = this.getSurface().getView().nativeSelection;
		if ( nativeSelection.rangeCount && document.activeElement.contentEditable === 'true' ) {
			range = nativeSelection.getRangeAt(0);
			nativeSelection.removeAllRanges();
			nativeSelection.addRange( range );
		}
	}
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.createSurface = function ( dmDoc, config ) {
	var surface;
	if ( this.overlay.isNewPage ) {
		config = ve.extendObject( {
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder-new-page', mw.user )
		}, config );
	}

	// Parent method
	surface = ve.init.mw.MobileFrontendArticleTarget.super.prototype.createSurface.call( this, dmDoc, config );

	surface.connect( this, { scroll: 'onSurfaceScroll' } );

	return surface;
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.surfaceReady = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.surfaceReady.apply( this, arguments );

	var surface = this.getSurface();

	this.overlay.clearSpinner();

	this.$overlaySurface
		.append( surface.$element.addClass( 'content' ) )
		.show();

	surface.getContext().connect( this, { resize: 'adjustContentPadding' } );
	this.adjustContentPadding();

	// we have to do it here because contenteditable elements still do not
	// exist when postRender is executed
	// FIXME: Don't call a private method that is outside the class.
	this.overlay._fixIosHeader( '[contenteditable]' );

	this.maybeShowWelcomeDialog();
};

/**
 * Match the content padding to the toolbar height
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.adjustContentPadding = function () {
	var toolbarHeight = this.getToolbar().$element.outerHeight(),
		surface = this.getSurface();
	surface.setToolbarHeight( toolbarHeight );
	this.$overlay.css( 'padding-top', toolbarHeight );
	this.getSurface().scrollCursorIntoView();
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.loadFail = function ( key, text ) {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.loadFail.apply( this, arguments );

	this.overlay.reportError( text );
	this.overlay.hide();
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.editSource = function () {
	// If changes have been made tell the user they have to save first
	if ( !this.getSurface().getModel().hasBeenModified() ) {
		this.overlay.switchToSourceEditor();
	} else if ( window.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ) ) {
		this.showSaveDialog();
	}
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.save = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.save.apply( this, arguments );

	this.overlay.log( {
		action: 'saveAttempt'
	} );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.showSaveDialog = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.showSaveDialog.apply( this, arguments );

	this.overlay.log( {
		action: 'saveIntent'
	} );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.saveComplete = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.saveComplete.apply( this, arguments );

	this.overlay.onSaveComplete();
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.close = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.close.apply( this, arguments );

	window.history.back();
};

/* Registration */

ve.init.mw.targetFactory.register( ve.init.mw.MobileFrontendArticleTarget );
