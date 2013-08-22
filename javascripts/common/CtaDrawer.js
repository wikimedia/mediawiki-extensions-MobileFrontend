( function( M, $ ) {
var Drawer = M.require( 'Drawer' ),
	CtaDrawer = Drawer.extend( {
		defaults: {
			loginCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-login' ),
			signupCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' ),
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		template: M.template.get( 'ctaDrawer' ),

		preRender: function( options ) {
			var params = $.extend( {
				// use wgPageName as this includes the namespace if outside Main
				returnto: options.returnTo || mw.config.get( 'wgPageName' )
			}, options.queryParams );

			options.loginUrl = M.pageApi.getPageUrl( 'Special:UserLogin', params );
			options.signupUrl = M.pageApi.getPageUrl( 'Special:UserLogin', $.extend( params, { type: 'signup' } ) );
		}
	} );

M.define( 'CtaDrawer', CtaDrawer );

}( mw.mobileFrontend, jQuery ) );
