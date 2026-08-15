// FIXME: make this an object with a constructor to facilitate testing
// (see https://bugzilla.wikimedia.org/show_bug.cgi?id=44264)
/**
 * mobileFrontend namespace
 *
 * @private
 */
let url;

const
	toggling = require( './toggling' ),
	lazyLoadedImages = require( './lazyLoadedImages' ),
	editor = require( './editor' ),
	currentPage = require( '../mobile.startup/currentPage' )(),
	currentPageHTMLParser = require( '../mobile.startup/currentPageHTMLParser' )(),
	mfUtil = require( '../mobile.startup/util' ),
	$window = mfUtil.getWindow(),
	Skin = require( '../mobile.startup/Skin' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' );

const skin = Skin.getSingleton();

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
 * @memberof window
 */

/**
 * The `window`'s scroll event debounced at 100 ms.
 * The `scroll:throttled` event is the `window`'s
 * scroll event throttled to 200 ms.
 *
 * @event scroll
 * @memberof window
 */

$window
	.on( 'resize', apply2(
		mw.util.debounce( () => {
			eventBus.emit( 'resize' );
		}, 100 ),
		mw.util.throttle( () => {
			eventBus.emit( 'resize:throttled' );
		}, 200 )
	) )
	.on( 'scroll', apply2(
		mw.util.debounce( () => {
			eventBus.emit( 'scroll' );
		}, 100 ),
		mw.util.throttle( () => {
			eventBus.emit( 'scroll:throttled' );
		}, 200 )
	) );

// Read the flag before the block below hides it.
// The parameter name is repeated from mobile.returnToApp, which keeps that
// module off page loads which are not a handover.
const returnToAppSaved = mw.util.getParamValue( 'returntoappsaved' );

// Hide URL flags used to pass state through reloads
// venotify is normally handled in ve.init.mw.DesktopArticleTarget.init.js
// but that's not loaded on mobile
// eslint-disable-next-line no-restricted-properties
if ( window.history && history.pushState ) {
	// eslint-disable-next-line no-restricted-properties
	url = new URL( window.location.href );
	if ( url.searchParams.has( 'venotify' ) || url.searchParams.has( 'mfnotify' ) ||
		url.searchParams.has( 'returntoappsaved' ) ) {
		url.searchParams.delete( 'venotify' );
		url.searchParams.delete( 'mfnotify' );
		// Otherwise a reload, a back navigation, or a shared URL starts the
		// handover again, when the revision it needs is already used
		url.searchParams.delete( 'returntoappsaved' );
		// eslint-disable-next-line no-restricted-properties
		window.history.replaceState( null, document.title, url.toString() );
	}
}

// Saving created a temporary account, which sent the browser away to an opaque
// URL and back. The editor is gone, so finish the handover to the app here.
if ( returnToAppSaved ) {
	mw.loader.using( 'mobile.returnToApp' ).then( () => {
		// Use MediaWiki ResourceLoader require(), not Webpack require()
		const returnToApp = __non_webpack_require__( 'mobile.returnToApp' );
		returnToApp.finishHandover();
	} );
}

// Recruit volunteers through the console
// (note console.log may not be a function so check via apply)
/* eslint-disable no-console */
if ( window.console && window.console.log && window.console.log.apply &&
		mw.config.get( 'wgMFEnableJSConsoleRecruitment' ) ) {
	console.log( mw.msg( 'mobile-frontend-console-recruit' ) );
}
/* eslint-enable no-console */

editor( currentPage, currentPageHTMLParser, skin );
toggling();
lazyLoadedImages();
