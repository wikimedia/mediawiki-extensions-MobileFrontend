var
	Drawer = require( './Drawer' ),
	util = require( './util' ),
	Button = require( './Button' ),
	Anchor = require( './Anchor' );

/**
 * @typedef {string|number|boolean|undefined} QueryVal
 * @typedef {Object.<string, QueryVal|QueryVal[]>} QueryParams
 *
 * @typedef {Object} Options
 * @prop {string} [returnTo]
 * @prop {QueryParams} [queryParams]
 * @prop {QueryParams} [signupQueryParams]
 * @prop {Object} [progressiveButton] button options for Button element for signing in.
 *  If omitted will create a login URL.
 * @prop {Object} [actionAnchor] anchor options for Anchor element for signing up. If omitted
 *   will create a sign up URL
 * @prop {string} content text - what is the call to action?
 */

/**
 * This creates the drawer at the bottom of the screen that appears when an anonymous
 * user tries to perform an action that requires being logged in. It presents the user
 * with options to log in or sign up for a new account.
 * @uses Button
 * @uses Icon
 * @uses Anchor
 * @param {Options} options
 * @return {Drawer}
 */
function CtaDrawer( options = {} ) {
	var params = redirectParams( options.queryParams, options.returnTo );
	return new Drawer(
		util.extend( {
			children: [
				util.parseHTML( '<p>' ).text( options.content ),
				new Button( util.extend( {
					progressive: true,
					href: mw.util.getUrl( 'Special:UserLogin', params ),
					label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
				}, options.progressiveButton ) ).$el,
				util.parseHTML( '<div>' ).addClass( 'cta-drawer__anchors' ).append(
					// Update Minerva first to avoid needing to keep this closeAnchor
					new Anchor( util.extend( {
						href: mw.util.getUrl(
							'Special:UserLogin', signUpParams( params, options.signupQueryParams )
						),
						progressive: true,
						label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
					}, options.actionAnchor ) ).$el
				)
			]
		}, options )
	);
}

/**
 * Special:UserLogin post-request redirect query parameters.
 * @param {QueryParams} params
 * @param {string} [redirectURL]
 * @return {QueryParams}
 */
function redirectParams( params, redirectURL ) {
	return util.extend( {
		// use wgPageName as this includes the namespace if outside Main
		returnto: redirectURL || mw.config.get( 'wgPageName' )
	}, params );
}

/**
 * Special:UserLogin account creation query parameters.
 * @param {...QueryParams} params
 * @return {QueryParams}
 */
function signUpParams() {
	[].push.call( arguments, { type: 'signup' } );
	return util.extend.apply( util, arguments );
}

CtaDrawer.prototype.test = {
	redirectParams: redirectParams,
	signUpParams: signUpParams
};

module.exports = CtaDrawer;
