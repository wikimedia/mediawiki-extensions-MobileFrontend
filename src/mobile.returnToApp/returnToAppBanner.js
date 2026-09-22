/**
 * Handles display of the return-to-app banner shown after making an edit.
 *
 * @module mobile.returnToApp
 */

const config = require( './config.json' );

// Setting for app icon URLs. Keys are `android` and `ios`.
const appIconConfig = 'MFReturnToAppBannerIcons';

/**
 * Attaches a banner to the top of the document with a link to return to the
 * native app. This is idempotent; e.g. if a banner is already present, this
 * does nothing.
 *
 * @param {string} returnUrl URL to link to for the return action
 */
function attachReturnToAppBanner( returnUrl ) {
	if ( document.querySelector( '.mw-mf-return-to-app-banner' ) ) {
		return;
	}

	const iconConfig = config[appIconConfig] || {};

	const banner = document.createElement( 'div' );
	const content = document.createElement( 'div' );
	const closeButton = document.createElement( 'button' );
	const appIcon = document.createElement( 'img' );
	const returnLink = document.createElement( 'a' );
	const icon = document.createElement( 'span' );
	const onClose = () => banner.remove();

	icon.classList.add( 'cdx-button__icon' );
	icon.setAttribute( 'aria-hidden', 'true' );

	banner.classList.add( 'mw-mf-return-to-app-banner' );
	banner.setAttribute( 'role', 'status' );
	content.classList.add( 'mw-mf-return-to-app-banner-content' );

	returnLink.classList.add(
		'mw-mf-return-to-app-link',
		'cdx-button',
		'cdx-button--fake-button',
		'cdx-button--fake-button--enabled',
		'cdx-button--action-progressive',
		'cdx-button--weight-primary'
	);
	returnLink.setAttribute( 'href', returnUrl );
	returnLink.textContent = mw.msg( 'mobile-frontend-return-to-app-return-link' );
	returnLink.append( icon.cloneNode() );
	// If a user clicks the return link, the banner should close so that if the
	// user comes back to the browser later, they don't see the banner again.
	// The event listener doesn't prevent the default behavior, so clicks on it
	// will also return to the app.
	returnLink.addEventListener( 'click', onClose );

	// This is an intentionally simple/brittle user agent sniff because the
	// worst-case scenario is that the wrong icon is shown.
	const iconKey = /android/i.test( window.navigator.userAgent ) ? 'android' : 'ios';

	if ( iconConfig[iconKey] ) {
		appIcon.classList.add( 'mw-mf-return-to-app-icon' );
		appIcon.setAttribute( 'alt', '' );
		appIcon.setAttribute( 'src', iconConfig[iconKey] );
		returnLink.prepend( appIcon );
	}

	closeButton.classList.add(
		'mw-mf-return-to-app-close',
		'cdx-button',
		'cdx-button--action-progressive',
		'cdx-button--icon-only',
		'cdx-button--weight-primary'
	);
	closeButton.append( icon.cloneNode() );
	closeButton.setAttribute( 'aria-label', mw.msg( 'mobile-frontend-return-to-app-close' ) );
	closeButton.setAttribute( 'type', 'button' );
	closeButton.addEventListener( 'click', onClose );

	content.append( returnLink );
	content.append( closeButton );
	document.body.prepend( banner );

	// Defer adding content to the next tick so that assistive technology sees
	// the change and announces it.

	window.setTimeout( () => banner.append( content ), 0 );
}

module.exports = { attachReturnToAppBanner };
