( function ( M, $ ) {
	var Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		Button = M.require( 'Button' ),
		Anchor = M.require( 'Anchor' ),
		CtaDrawer;

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
	CtaDrawer = Drawer.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Object} defaults.collapseIcon options for Icon for collapsing the drawer
		 * @cfg {Object} defaults.loginButton options for Button element for signing in
		 * @cfg {Object} defaults.signupAnchor options for Anchor element for signing up
		 */
		defaults: {
			loginButton: new Button( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
			} ).options,
			signupAnchor: new Anchor( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
			} ).options,
			collapseIcon: new Icon( {
				name: 'arrow-down',
				additionalClassNames: 'cancel'
			} ).options
		},
		templatePartials: {
			icon: Icon.prototype.template,
			button: Button.prototype.template,
			anchor: Anchor.prototype.template
		},
		template: mw.template.get( 'mobile.drawers', 'Cta.hogan' ),

		/** @inheritdoc */
		preRender: function () {
			var params = $.extend( {
					// use wgPageName as this includes the namespace if outside Main
					returnto: this.options.returnTo || mw.config.get( 'wgPageName' )
				}, this.options.queryParams ),
				signupParams = $.extend( {
					type: 'signup'
				}, this.options.signupQueryParams );

			this.options.loginButton.href = mw.util.getUrl( 'Special:UserLogin', params );
			this.options.signupAnchor.href = mw.util.getUrl( 'Special:UserLogin', $.extend( params, signupParams ) );
		}
	} );

	M.define( 'CtaDrawer', CtaDrawer );

}( mw.mobileFrontend, jQuery ) );
