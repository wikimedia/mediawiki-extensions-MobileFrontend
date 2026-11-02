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
	editor = require( './editor' ),
	currentPageHTMLParser = require( '../mobile.startup/currentPageHTMLParser' )(),
	Skin = require( '../mobile.startup/Skin' );

const skin = Skin.getSingleton();

/**
 * Temporary compatibility code for pages that use the legacy parser to
 * generate lazy-image-placeholder elements. This can be removed in 2
 * weeks from its introduction. Images are not guaranteed to be lazy in this mode,
 * the goal is only to make them accessible.
 * @ignore
 */
function fixLegacyParserImagesIfNeeded() {
	const legacyImages = document.querySelectorAll( '.lazy-image-placeholder' );
	if ( legacyImages.length ) {
		Array.from( legacyImages ).forEach( ( node ) => {
			const dataset = node.dataset;
			const img = document.createElement( 'img' );
			img.loading = 'lazy';
			img.src = dataset.mwSrc;
			img.setAttribute( 'class', dataset.class );
			if ( dataset.mwSrcSet ) {
				img.srcset = dataset.mwSrcSet;
			}
			img.width = dataset.width;
			img.height = dataset.height;
			node.replaceWith( img );
		} );
	}
}

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

// If URL params reference return-to-app, initialize it.

if ( returnToAppSaved || url.searchParams.has( 'returntoapp' ) ) {
	mw.loader.using( 'mobile.returnToApp' ).then( () => {
		// Use MediaWiki ResourceLoader require(), not Webpack require()
		const returnToApp = __non_webpack_require__( 'mobile.returnToApp' );
		returnToApp.init();
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

editor( currentPageHTMLParser, skin );
toggling();
fixLegacyParserImagesIfNeeded();
