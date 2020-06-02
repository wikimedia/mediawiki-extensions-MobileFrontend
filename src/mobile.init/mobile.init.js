/* global $ */

// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 *
 * @class mw.mobileFrontend
 * @singleton
 */
var skin,
	storage = mw.storage,
	toggling = require( './toggling' ),
	lazyLoadedImages = require( './lazyLoadedImages' ),
	skinName = mw.config.get( 'skin' ),
	isPageContentModelEditable = mw.config.get( 'wgMFIsPageContentModelEditable' ),
	editor = require( './editor' ),
	currentPage = require( '../mobile.startup/currentPage' )(),
	currentPageHTMLParser = require( '../mobile.startup/currentPageHTMLParser' )(),
	mfUtil = require( '../mobile.startup/util' ),
	$window = mfUtil.getWindow(),
	$html = mfUtil.getDocument(),
	Skin = require( '../mobile.startup/Skin' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' ),
	schemaMobileWebSearch = require( './eventLogging/schemaMobileWebSearch' ),
	schemaEditAttemptStep = require( './eventLogging/schemaEditAttemptStep' ),
	schemaVisualEditorFeatureUse = require( './eventLogging/schemaVisualEditorFeatureUse' );

skin = Skin.getSingleton();

/**
 * Given 2 functions, it returns a function that will run both with it's
 * context and parameters and return the results combined
 *
 * @private
 * @param {Function} fn1
 * @param {Function} fn2
 * @return {Function} which returns void
 */
function apply2( fn1, fn2 ) {
	return function () {
		fn1.apply( this, arguments );
		fn2.apply( this, arguments );
	};
}

/**
 * The `window`'s resize event debounced at 100 ms.
 * The `resize:throttled` event is the `window`'s
 * resize event throttled to 200 ms.
 *
 * @event resize
 */

/**
 * The `window`'s scroll event debounced at 100 ms.
 * The `scroll:throttled` event is the `window`'s
 * scroll event throttled to 200 ms.
 *
 * @event scroll
 */

$window
	.on( 'resize', apply2(
		mw.util.debounce( 100, function () { eventBus.emit( 'resize' ); } ),
		$.throttle( 200, function () { eventBus.emit( 'resize:throttled' ); } )
	) )
	.on( 'scroll', apply2(
		mw.util.debounce( 100, function () { eventBus.emit( 'scroll' ); } ),
		$.throttle( 200, function () { eventBus.emit( 'scroll:throttled' ); } )
	) );

/**
 * Updates the font size based on the current value in storage
 */
function updateFontSize() {
	// FIXME: Ideally 'regular' would come from a shared constant
	// (currently not possible without using webpack)
	var userFontSize = storage.get( 'userFontSize', 'regular' );
	// The following classes are used here:
	// * mf-font-size-small
	// * mf-font-size-regular
	// * mf-font-size-large
	// * mf-font-size-x-large
	$html.addClass( 'mf-font-size-' + userFontSize );
}

// Font must be updated on back button press as users may click
// back after changing font.
$window.on( 'pageshow', function () {
	updateFontSize();
} );
updateFontSize();

// Recruit volunteers through the console
// (note console.log may not be a function so check via apply)
/* eslint-disable no-console */
if ( window.console && window.console.log && window.console.log.apply &&
		mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
	console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
}
/* eslint-enable no-console */

// setup editor
if ( !currentPage.inNamespace( 'special' ) && isPageContentModelEditable ) {
	// TODO: Mobile editor doesn't work well with other skins yet (it looks horribly broken
	// without some styles that are only defined by Minerva).
	if ( skinName === 'minerva' ) {
		// TODO: This code should not even be loaded on desktop.
		// Remove this check when that is fixed (T216537).
		if ( mw.config.get( 'wgMFMode' ) !== null ) {
			editor( currentPage, currentPageHTMLParser, skin );
		}
	}
}

toggling();
lazyLoadedImages();

// Set up recording for the events we track. The module 'ext.eventLogging'
// should already be loaded (this doesn't trigger a new HTTP request), but we
// don't specify a hard dependency because EventLogging may not be installed.
mw.loader.using( 'ext.eventLogging' ).then( function () {
	schemaMobileWebSearch();
	schemaEditAttemptStep();
	schemaVisualEditorFeatureUse();
} );
