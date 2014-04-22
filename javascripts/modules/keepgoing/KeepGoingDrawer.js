( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Drawer = M.require( 'Drawer' ),
		mobileWebCta = M.require( 'loggingSchemas/mobileWebCta' ),
		KeepGoingDrawer,
		api = M.require( 'api' );

	/**
	 * @class KeepGoingDrawer
	 * @extends Drawer
	 * This creates the drawer at the bottom of the screen that appears when an anonymous
	 * user tries to perform an action that requires being logged in. It presents the user
	 * with options to log in or sign up for a new account.
	 */
	KeepGoingDrawer = Drawer.extend( {
		locked: true,
		defaults: {
			step: parseInt( M.query.campaign_step, 10 ) || 0,
			cancel: mw.msg( 'mobilefrontend-keepgoing-cancel' ),
			nextLabel: mw.msg( 'mobilefrontend-keepgoing-suggest-again' ),
			campaign: 'mobile-keepgoing'
		},
		template: M.template.get( 'keepgoing/KeepGoingDrawer' ),
		log: function( status ) {
			mobileWebCta.log( status, this.options.campaign, this.options.step );
		},
		initialize: function( options ) {
			options = options || {};
			if ( !options.msg ) {
				if ( options.tryAgain ) {
					options.msg = mw.msg( 'mobilefrontend-keepgoing-explain' );
				} else {
					options.msg = options.isFirstEdit ? mw.msg( 'mobilefrontend-keepgoing-ask-first' ) : mw.msg( 'mobilefrontend-keepgoing-ask' );
					options.nextLabel = mw.msg( 'mobilefrontend-keepgoing-suggest' );
				}
			}
			this._super( options );
		},
		// FIXME: Juliusz would like to revisit this - a little messy
		render: function( options ) {
			var self = this,
				step = options.step,
				nextStep = step + 1,
				_super = self._super;
			options = options || {};
			api.get( { action: 'query', list: 'random', rnnamespace: '0', rnlimit: 1 } ).done( function( resp ) {
				var page = resp.query.random[0],
					url = mw.util.getUrl( page.title, { campaign: options.campaign, campaign_step: nextStep } );

				options.nextUrl = url;
				_super.call( self, options );
				self.show();
				mobileWebCta.hijackLink( self.$( '.continue' ), 'keepgoing-success', options.campaign, step );
				self.$( '.close' ).on( 'click', function() {
					self.log( 'keepgoing-exit' );
				} );
			} );
			this.log( 'keepgoing-shown' );
		}
	} );

	M.define( 'modules/keepgoing/KeepGoingDrawer', KeepGoingDrawer );
}( mw.mobileFrontend ) );
