var
	mfExtend = require( './mfExtend' ),
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
 * @prop {Object} [options.progressiveButton] template options for Button element for signing in
 * @prop {Object} [options.actionAnchor] template options for Anchor element for signing up
 */

/**
 * This creates the drawer at the bottom of the screen that appears when an anonymous
 * user tries to perform an action that requires being logged in. It presents the user
 * with options to log in or sign up for a new account.
 * @class CtaDrawer
 * @extends Drawer
 * @uses Button
 * @uses Icon
 * @uses Anchor
 * @param {Options} options
 */
function CtaDrawer( options ) {
	Drawer.call( this,
		util.extend( {}, Drawer.prototype.defaults, {
			progressiveButton: new Button( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
			} ).options,
			actionAnchor: new Anchor( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
			} ).options
		}, options )
	);
}

mfExtend( CtaDrawer, Drawer, {
	/**
	 * @memberof CtaDrawer
	 * @instance
	 * @mixes Drawer#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {Object} defaults.collapseIcon options for Icon for collapsing the drawer
	 * @property {Object} defaults.progressiveButton options for Button element for signing in
	 * @property {Object} defaults.actionAnchor options for Anchor element for signing up
	 */
	defaults: util.extend( {}, Drawer.prototype.defaults, {
		progressiveButton: {
			progressive: true,
			label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
		},
		actionAnchor: {
			progressive: true,
			label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
		}
	} ),
	/**
		 * @memberof CtaDrawer
		 * @instance
		 */
	template: util.template( `
<p>{{content}}</p>
<div class="cta-drawer__anchors"></div>
	` ),
	/**
		 * @inheritdoc
		 * @memberof CtaDrawer
		 * @instance
		 */
	preRender: function () {
		var params = redirectParams( this.options.queryParams, this.options.returnTo );

		// Give the button and the anchor a default target, if it isn't set already. Buttons are
		// customized by Minerva's red link drawer, skins.minerva.scripts/init.js.
		if ( !this.options.progressiveButton.href ) {
			this.options.progressiveButton.href = mw.util.getUrl( 'Special:UserLogin', params );
		}
		if ( !this.options.actionAnchor.href ) {
			this.options.actionAnchor.href = mw.util.getUrl(
				'Special:UserLogin', signUpParams( params, this.options.signupQueryParams )
			);
		}
	},
	/**
	 * @inheritdoc
	 */
	postRender: function () {
		var options = this.options,
			anchors = [];
		if ( options.actionAnchor ) {
			anchors.push( new Anchor( options.actionAnchor ) );
		}
		if ( options.closeAnchor ) {
			anchors.push( new Anchor( options.closeAnchor ) );
		}
		Drawer.prototype.postRender.apply( this, arguments );
		if ( options.progressiveButton ) {
			( new Button( options.progressiveButton ) ).$el.insertBefore(
				this.$el.find( '.cta-drawer__anchors' )
			);
		}
		this.$el.find( '.cta-drawer__anchors' ).append(
			anchors.map( function ( anchor ) {
				return anchor.$el;
			} )
		);
	}
} );

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
