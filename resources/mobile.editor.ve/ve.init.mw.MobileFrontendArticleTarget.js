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
	// Parent constructor
	ve.init.mw.MobileFrontendArticleTarget.super.call( this, config );

	this.overlay = overlay;
	this.$overlay = overlay.$el;
	this.$overlayContent = overlay.$el.find( '.overlay-content' );
	this.$overlaySurface = overlay.$el.find( '.surface' );

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

/**
 * Handle window scroll events
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onWindowScroll = function () {
	var target = this;
	// The window can only scroll in iOS if the keyboard has been opened
	if ( ve.init.platform.constructor.static.isIos() ) {
		// iOS applies a scroll offset to the window to move the cursor
		// into view. Apply this offset to the surface instead.
		var range,
			nativeSelection = target.getSurface().getView().nativeSelection,
			windowTop = $( window ).scrollTop(),
			contentTop = target.$overlayContent.scrollTop();

		$( window ).scrollTop( 0 );
		target.$overlayContent.scrollTop( contentTop + windowTop );

		// iOS has another bug (!) where if you change the scroll offset of a
		// contentEditable with a cursor visible it disappears, so remove and
		// reapply the selection in that case.
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
	if ( this.overlay.isNewPage ) {
		config = ve.extendObject( {
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder-new-page', mw.user )
		}, config );
	}

	// Parent method
	return ve.init.mw.MobileFrontendArticleTarget.super.prototype.createSurface.call( this, dmDoc, config );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onSurfaceReady = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.onSurfaceReady.apply( this, arguments );

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
};

/**
 * Match the content padding to the toolbar height
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.adjustContentPadding = function () {
	this.$overlay.css(
		'padding-top',
		this.getToolbar().$element.outerHeight()
	);
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.loadFail = function ( errorText ) {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.loadFail.apply( this, arguments );

	this.overlay.reportError( errorText, 'visualeditor-load-error' );
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
