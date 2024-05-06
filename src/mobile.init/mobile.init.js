// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 *
 * @class mw.mobileFrontend
 * @singleton
 */
var skin,
	url,
	toggling = require( './toggling' ),
	FONT_SIZE_KEY = 'mf-font-size',
	SECTION_COLLAPSING_TOGGLE = 'mf-expand-sections',
	storage = mw.storage,
	api = new mw.Api(),
	lazyLoadedImages = require( './lazyLoadedImages' ),
	editor = require( './editor' ),
	currentPage = require( '../mobile.startup/currentPage' )(),
	currentPageHTMLParser = require( '../mobile.startup/currentPageHTMLParser' )(),
	mfUtil = require( '../mobile.startup/util' ),
	$window = mfUtil.getWindow(),
	Skin = require( '../mobile.startup/Skin' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' );

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
		mw.util.debounce( function () {
			eventBus.emit( 'resize' );
		}, 100 ),
		mw.util.throttle( function () {
			eventBus.emit( 'resize:throttled' );
		}, 200 )
	) )
	.on( 'scroll', apply2(
		mw.util.debounce( function () {
			eventBus.emit( 'scroll' );
		}, 100 ),
		mw.util.throttle( function () {
			eventBus.emit( 'scroll:throttled' );
		}, 200 )
	) );

// Hide URL flags used to pass state through reloads
// venotify is normally handled in ve.init.mw.DesktopArticleTarget.init.js
// but that's not loaded on mobile
// eslint-disable-next-line no-restricted-properties
if ( window.history && history.pushState ) {
	// eslint-disable-next-line no-restricted-properties
	url = new URL( window.location.href );
	if ( url.searchParams.has( 'venotify' ) || url.searchParams.has( 'mfnotify' ) ) {
		url.searchParams.delete( 'venotify' );
		url.searchParams.delete( 'mfnotify' );
		// eslint-disable-next-line no-restricted-properties
		window.history.replaceState( null, document.title, url.toString() );
	}
}

// Recruit volunteers through the console
// (note console.log may not be a function so check via apply)
/* eslint-disable no-console */
if ( window.console && window.console.log && window.console.log.apply &&
		mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
	console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
}
/* eslint-enable no-console */

// Setup editor, if supported for the current page view
if ( mw.config.get( 'wgMFIsSupportedEditRequest' ) ) {
	editor( currentPage, currentPageHTMLParser, skin );
}

function migrateXLargeToLarge() {
	if ( document.documentElement.classList.contains( 'mf-font-size-clientpref-xlarge' ) ) {
		if ( mw.user.isAnon() ) {
			mw.user.clientPrefs.set( FONT_SIZE_KEY, 'large' );
		} else {
			api.saveOption( FONT_SIZE_KEY, 'large' );
		}
	}
}

function migrateLegacyExpandAllSectionsToggle() {
	const currentValue = mw.storage.get( 'expandSections' );
	if ( currentValue ) {
		if ( mw.user.isAnon() ) {
			mw.user.clientPrefs.set( SECTION_COLLAPSING_TOGGLE, '1' );
		} else {
			api.saveOption( SECTION_COLLAPSING_TOGGLE, '1' );
		}
		storage.remove( 'expandSections' );
	}
}

migrateXLargeToLarge();
migrateLegacyExpandAllSectionsToggle();
toggling();
lazyLoadedImages();
