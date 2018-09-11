( function ( M ) {
	var Drawer = M.require( 'mobile.startup/Drawer' ),
		util = M.require( 'mobile.startup/util' ),
		Button = M.require( 'mobile.startup/Button' ),
		Anchor = M.require( 'mobile.startup/Anchor' );

	/**
	 * This creates the drawer at the bottom of the screen that appears when an anonymous
	 * user tries to perform an action that requires being logged in. It presents the user
	 * with options to log in or sign up for a new account.
	 * @class CtaDrawer
	 * @extends Drawer
	 * @uses Button
	 * @uses Icon
	 * @uses Anchor
	 */
	function CtaDrawer() {
		Drawer.apply( this, arguments );
	}

	OO.mfExtend( CtaDrawer, Drawer, {
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
			progressiveButton: new Button( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
			} ).options,
			actionAnchor: new Anchor( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
			} ).options
		} ),
		/**
		 * @memberof CtaDrawer
		 * @instance
		 */
		templatePartials: util.extend( {}, Drawer.prototype.templatePartials, {
			button: Button.prototype.template,
			anchor: Anchor.prototype.template
		} ),
		/**
		 * @memberof CtaDrawer
		 * @instance
		 */
		template: mw.template.get( 'mobile.startup', 'Cta.hogan' ),
		/**
		 * @inheritdoc
		 * @memberof CtaDrawer
		 * @instance
		 */
		events: util.extend( {}, Drawer.prototype.events, {
			'click .hide': 'hide'
		} ),
		/**
		 * @inheritdoc
		 * @memberof CtaDrawer
		 * @instance
		 */
		preRender: function () {
			var params = util.extend( {
					// use wgPageName as this includes the namespace if outside Main
					returnto: this.options.returnTo || mw.config.get( 'wgPageName' )
				}, this.options.queryParams ),
				signupParams = util.extend( {
					type: 'signup'
				}, this.options.signupQueryParams );

			// Give the button and the anchor a default target, if it isn't set already
			if ( !this.options.progressiveButton.href ) {
				this.options.progressiveButton.href = mw.util.getUrl( 'Special:UserLogin', params );
			}
			if ( !this.options.actionAnchor.href ) {
				this.options.actionAnchor.href = mw.util.getUrl( 'Special:UserLogin', util.extend( params, signupParams ) );
			}
		}
	} );

	M.define( 'mobile.startup/CtaDrawer', CtaDrawer );
}( mw.mobileFrontend ) );
