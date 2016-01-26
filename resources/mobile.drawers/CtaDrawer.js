( function ( M, $ ) {
	var Drawer = M.require( 'mobile.drawers/Drawer' ),
		Icon = M.require( 'mobile.startup/Icon' ),
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
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Object} defaults.collapseIcon options for Icon for collapsing the drawer
		 * @cfg {Object} defaults.progressiveButton options for Button element for signing in
		 * @cfg {Object} defaults.actionAnchor options for Anchor element for signing up
		 */
		defaults: $.extend( {}, Drawer.prototype.defaults, {
			progressiveButton: new Button( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-login' )
			} ).options,
			actionAnchor: new Anchor( {
				progressive: true,
				label: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' )
			} ).options,
			collapseIcon: new Icon( {
				name: 'arrow',
				additionalClassNames: 'cancel'
			} ).options
		} ),
		templatePartials: $.extend( {}, Drawer.prototype.templatePartials, {
			icon: Icon.prototype.template,
			button: Button.prototype.template,
			anchor: Anchor.prototype.template
		} ),
		template: mw.template.get( 'mobile.drawers', 'Cta.hogan' ),
		/**
		 * @inheritdoc
		 */
		events: $.extend( {}, Drawer.prototype.events, {
			'click .hide': 'hide'
		} ),

		/** @inheritdoc */
		preRender: function () {
			var params = $.extend( {
					// use wgPageName as this includes the namespace if outside Main
					returnto: this.options.returnTo || mw.config.get( 'wgPageName' )
				}, this.options.queryParams ),
				signupParams = $.extend( {
					type: 'signup'
				}, this.options.signupQueryParams );

			// Give the button and the anchor a default target, if it isn't set already
			if ( !this.options.progressiveButton.hasOwnProperty( 'href' ) ) {
				this.options.progressiveButton.href = mw.util.getUrl( 'Special:UserLogin', params );
			}
			if ( !this.options.actionAnchor.hasOwnProperty( 'href' ) ) {
				this.options.actionAnchor.href = mw.util.getUrl( 'Special:UserLogin', $.extend( params, signupParams ) );
			}
		}
	} );

	M.define( 'mobile.drawers/CtaDrawer', CtaDrawer );

}( mw.mobileFrontend, jQuery ) );
