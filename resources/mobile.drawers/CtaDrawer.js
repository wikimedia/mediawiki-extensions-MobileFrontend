( function ( M, $ ) {
	var Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		Anchor = M.require( 'Anchor' ),
		CtaDrawer;

	/**
	 * This creates the drawer at the bottom of the screen that appears when an anonymous
	 * user tries to perform an action that requires being logged in. It presents the user
	 * with options to log in or sign up for a new account.
	 * @class CtaDrawer
	 * @extends Drawer
	 */
	CtaDrawer = Drawer.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.collapse HTML of the button that dismisses the CtaDrawer.
		 * @cfg {String} defaults.login Caption for the login button.
		 * @cfg {String} defaults.signup Caption for the signup button.
		 */
		defaults: {
			signupAnchor: new Anchor( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
			} ).options,
			collapseButton: new Icon( {
				name: 'arrow-down',
				additionalClassNames: 'cancel'
			} ).toHtmlString(),
			loginCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
		},
		templatePartials: {
			anchor: Anchor.prototype.template
		},
		template: mw.template.get( 'mobile.drawers', 'Cta.hogan' ),

		/** @inheritdoc */
		preRender: function ( options ) {
			var params = $.extend( {
					// use wgPageName as this includes the namespace if outside Main
					returnto: options.returnTo || mw.config.get( 'wgPageName' )
				}, options.queryParams ),
				signupParams = $.extend( {
					type: 'signup'
				}, options.signupQueryParams );

			options.loginUrl = mw.util.getUrl( 'Special:UserLogin', params );
			options.signupAnchor.href = mw.util.getUrl( 'Special:UserLogin', $.extend( params, signupParams ) );
		}
	} );

	M.define( 'CtaDrawer', CtaDrawer );

}( mw.mobileFrontend, jQuery ) );
