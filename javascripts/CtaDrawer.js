( function ( M, $ ) {
	var Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		CtaDrawer;

	/**
	 * This creates the drawer at the bottom of the screen that appears when an anonymous
	 * user tries to perform an action that requires being logged in. It presents the user
	 * with options to log in or sign up for a new account.
	 * @class CtaDrawer
	 * @extends Drawer
	 */
	CtaDrawer = Drawer.extend( {
		defaults: {
			collapseButton: new Icon( {
				name: 'arrow-down',
				additionalClassNames: 'cancel'
			} ).toHtmlString(),
			loginCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-login' ),
			signupCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
		},
		template: mw.template.get( 'mobile.drawers', 'Cta.hogan' ),

		preRender: function ( options ) {
			var params = $.extend( {
					// use wgPageName as this includes the namespace if outside Main
					returnto: options.returnTo || mw.config.get( 'wgPageName' )
				}, options.queryParams ),
				signupParams = $.extend( {
					type: 'signup'
				}, options.signupQueryParams );

			options.loginUrl = mw.util.getUrl( 'Special:UserLogin', params );
			options.signupUrl = mw.util.getUrl( 'Special:UserLogin', $.extend( params, signupParams ) );
		},

		// redefine from Drawer to allow to close drawer after user clicks edit-anon link
		postRender: function () {
			var self = this;
			if ( self.$( '.edit-anon' ) ) {
				self.$( '.edit-anon' ).click( $.proxy( self, 'hide' ) );
			}
			Drawer.prototype.postRender.apply( self, arguments );
		}
	} );

	M.define( 'CtaDrawer', CtaDrawer );

}( mw.mobileFrontend, jQuery ) );
