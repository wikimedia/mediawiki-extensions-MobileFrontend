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
// Setting for what should happen when return-to-app is triggered. Possible
// values are 'immediate' (redirect with no user input) or 'banner' (show a
// banner at the top of the page during the current pageview only). Default is
// 'immediate'.
const behaviorConfig = 'MFReturnToAppBehavior';

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
 * Initializes return-to-app functionality, adding hook listeners to editor
 * events and handling any pending handovers that were previously set up.
 *
 * @memberof module:mobile.returnToApp
 */
function init() {
	if ( !isEnabled() ) {
		return;
	}

	// Check for a handover that was set up in a previous pageload. If there
	// isn't one, this doesn't do anything.

	finishHandover();

	// This hook is dispatched by EditorOverlayBase.

	mw.hook( 'mobileFrontend.editorClosed' ).add( ( switching, saved ) => {
		if ( !switching && !saved ) {
			redirectToApp( false );
		}
	} );

	// These hooks are dispatched by VisualEditorOverlay and SourceEditorOverlay
	// respectively.
	//
	// There are two ingredients to a pending handover: setting session and
	// adding savedQuery() to the redirect, so that mobile.init loads us in the
	// next pageload. The queryparam ensures that an unrelated browser tab in
	// the same session doesn't trigger a redirect. Session can be set here, but
	// the query param is handled in EditorOverlayBase (for visual editing) and
	// SourceEditorOverlay, because they handle redirects.

	mw.hook( 'mobileFrontend.sourceEditor.saveComplete' ).add( ( newRevId ) => {
		// The source editor redirects to a distinct URL after an edit in all cases.
		setPendingHandover( newRevId );
	} );

	mw.hook( 'mobileFrontend.visualEditor.saveComplete' ).add( ( newRevId, redirectUrl ) => {
		// The visual editor will close without a pageload if a redirectUrl
		// wasn't sent in the save response.

		if ( redirectUrl ) {
			setPendingHandover( newRevId );
		} else {
			redirectToApp( true, newRevId );
		}
	} );
}

/**
 * Send the browser to the native app that launched the editor, telling it how
 * the edit ended. Depending on what MFReturnToAppBehavior is set to config,
 * this will either happen immediately, or show a banner allowing the user to
 * return to the app when they're ready.
 *
 * The app registers the configured scheme, so the operating system hands the
 * URL back to it.
 *
 * @memberof module:mobile.returnToApp
 * @param {boolean} saved Whether the edit was published
 * @param {number} [revId] Id of the new revision, if one was created
 */
function redirectToApp( saved, revId ) {
	const scheme = config[schemeConfig];
	const behavior = config[behaviorConfig];
	if ( !scheme ) {
		// Callers test isEnabled first. Do not navigate to a nonsense scheme.
		return;
	}
	let appHref = `${ scheme }://${ config.ServerName }${ mw.util.getUrl() }?saved=${ saved ? 'true' : 'false' }`;
	if ( revId ) {
		appHref += `&revision=${ revId }`;
	}

	switch ( behavior ) {
		case 'banner':
			attachReturnToAppBanner( appHref );
			break;
		case 'immediate':
		default:
			location.href = appHref;
	}
}

/**
 * Query string that tells a later page load to finish a handover, for when
 * saving asks the frontend to redirect to another URL.
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
 * Finish a handover which a redirect after saving interrupted, and
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
	finishHandover,
	init,
	isEnabled,
	redirectToApp,
	savedQuery,
	setPendingHandover
};
