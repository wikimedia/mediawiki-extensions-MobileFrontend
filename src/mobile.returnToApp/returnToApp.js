/**
 * Handover to the native app that launched the editor.
 *
 * The editor starts the handover and a later page load can finish it, so this
 * is its own ResourceLoader module. The editor overlays require it by name, and
 * mobile.init loads it only when a handover is waiting.
 *
 * @module mobile.returnToApp
 */
const { attachReturnToAppBanner } = require( './returnToAppBanner.js' );
const config = require( './config.json' );

// Set before the temporary account redirect, and taken by the page that the
// redirect lands on. Its presence is what proves that a handover is waiting,
// because anyone can put the query parameter in a URL.
const pendingKey = 'mobileFrontend/returnToAppRevId';
// Repeated in mobile.init, which must know if a handover can be waiting before
// it loads this module
const savedParam = 'returntoappsaved';
// The wiki tells us which app registers a URL scheme. Without one there is no
// app to hand over to.
const schemeConfig = 'MFReturnToAppScheme';

/**
 * Whether this wiki has a native app to hand over to.
 *
 * @memberof module:mobile.returnToApp
 * @return {boolean}
 */
function isEnabled() {
	return !!config[schemeConfig];
}

/**
 * Send the browser to the native app that launched the editor, telling it how
 * the edit ended. The app registers the configured scheme, so the operating
 * system hands the URL back to it.
 *
 * @memberof module:mobile.returnToApp
 * @param {boolean} saved Whether the edit was published
 * @param {number} [revId] Id of the new revision, if one was created
 */
function redirectToApp( saved, revId ) {
	const scheme = config[schemeConfig];
	if ( !scheme ) {
		// Callers test isEnabled first. Do not navigate to a nonsense scheme.
		return;
	}
	let appHref = `${ scheme }://${ config.ServerName }${ mw.util.getUrl() }?saved=${ saved ? 'true' : 'false' }`;
	if ( revId ) {
		appHref += `&revision=${ revId }`;
	}
	location.href = appHref;
}

/**
 * Query string that tells a later page load to finish a handover, for when
 * creating a temporary account discards the editor before it can happen.
 *
 * The parameter is only a hint. Session storage holds what that page load
 * needs, and is also what proves that the handover is real.
 *
 * @memberof module:mobile.returnToApp
 * @return {string}
 */
function savedQuery() {
	return savedParam + '=1';
}

/**
 * Record that a handover must finish on a later page load, and keep the
 * revision id, which that page load cannot work out.
 *
 * @memberof module:mobile.returnToApp
 * @param {number} [revId] Id of the new revision, if one was created
 */
function setPendingHandover( revId ) {
	// An empty value still records the handover, for the null edit which makes
	// no revision.
	// Same duration as EditPage::POST_EDIT_COOKIE_DURATION
	mw.storage.session.set( pendingKey, revId ? String( revId ) : '', 1200 );
}

/**
 * Finish a handover which the temporary account redirect interrupted, and
 * forget it so that a reload or a shared URL cannot repeat it.
 *
 * Does nothing if the editor recorded no handover, so a made up URL cannot
 * tell the app about an edit which did not happen.
 *
 * @memberof module:mobile.returnToApp
 */
function finishHandover() {
	const revId = mw.storage.session.get( pendingKey );
	mw.storage.session.remove( pendingKey );
	// Absent is null, and unavailable storage is false. An empty string is a
	// handover without a revision.
	if ( typeof revId !== 'string' ) {
		return;
	}
	redirectToApp( true, revId ? Number( revId ) : undefined );
}

module.exports = {
	// attachReturnToAppBanner is a temporary export so that the banner can be
	// exercised manually in dev tools with:
	//
	// mw.loader.using( 'mobile.returnToApp').then(( require ) => require( 'mobile.returnToApp' ).attachReturnToAppBanner( 'https://somewhere' ));
	//
	// This will be dropped when banner display behavior is restored.
	attachReturnToAppBanner,
	finishHandover,
	isEnabled,
	redirectToApp,
	savedQuery,
	setPendingHandover
};
