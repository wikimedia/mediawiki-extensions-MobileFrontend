const
	Drawer = require( './Drawer' ),
	util = require( './util' ),
	Button = require( './Button' ),
	Anchor = require( './Anchor' );

/**
 * Represents a query string value.
 *
 * @typedef {string|number|boolean|undefined|string[]|boolean[]} module:mobile.startup~QueryVal
 */
/**
 * Describes a combination of query string parameters.
 *
 * @typedef {Object.<string, module:mobile.startup~QueryVal>} module:mobile.startup~QueryParams
 */

/**
 * Describes a call to action drawer.
 *
 * @memberof module:mobile.startup
 * @typedef {Object} CtaOptions
 * @prop {string} [returnTo]
 * @prop {module:mobile.startup~QueryParams} [queryParams]
 * @prop {module:mobile.startup~QueryParams} [signupQueryParams]
 * @prop {Object} [progressiveButton] button options for Button element for signing in.
 *  If omitted will create a login URL.
 * @prop {Object} [actionAnchor] anchor options for Anchor element for signing up. If omitted
 *   will create a sign up URL
 * @prop {string} content text - what is the call to action?
 */

/**
 * Internal for use inside Minerva only, creates the drawer at the bottom of the screen that appears when an anonymous
 * user tries to perform an action that requires being logged in. It presents the user
 * with options to log in or sign up for a new account.
 *
 * @function CtaDrawer
 * @memberof module:mobile.startup
 * @param {module:mobile.startup.CtaOptions} options Options for drawer.
 * @return {module:mobile.startup/Drawer}
 */
function CtaDrawer( options = {} ) {
	const params = redirectParams( options.queryParams, options.returnTo );
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
 *
 * @ignore
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
 *
 * @ignore
 * @param {...QueryParams} params
 * @return {QueryParams}
 */
function signUpParams() {
	[].push.call( arguments, { type: 'signup' } );
	return util.extend.apply( util, arguments );
}

CtaDrawer.prototype.test = {
	redirectParams,
	signUpParams
};

module.exports = CtaDrawer;
