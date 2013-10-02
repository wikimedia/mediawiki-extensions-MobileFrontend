/**
 * This creates the drawer at the bottom of the screen that appears when an anonymous
 * user tries to perform an action that requires being logged in. It presents the user
 * with options to log in or sign up for a new account.
 */
( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Drawer = M.require( 'Drawer' ),
		mobileWebCta = M.require( 'loggingSchemas/mobileWebCta' ),
		KeepGoingDrawer,
		campaign = 'mobile-keepgoing',
		api = M.require( 'api' );

	KeepGoingDrawer = Drawer.extend( {
		locked: true,
		defaults: {
			step: 0,
			cancel: mw.msg( 'mobilefrontend-keepgoing-cancel' )
		},
		template: M.template.get( 'keepgoing/KeepGoingDrawer' ),
		log: function( status ) {
			mobileWebCta.log( status, campaign, this.options.step );
		},
		initialize: function( options ) {
			options = options || {};
			if ( options.tryAgain ) {
				options.msg = mw.msg( 'mobilefrontend-keepgoing-explain' );
				options.nextLabel = mw.msg( 'mobilefrontend-keepgoing-suggest-again' );
			} else {
				options.msg = options.isFirstEdit ? mw.msg( 'mobilefrontend-keepgoing-ask-first' ) : mw.msg( 'mobilefrontend-keepgoing-ask' );
				options.nextLabel = mw.msg( 'mobilefrontend-keepgoing-suggest' );
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
					url = mw.util.wikiGetlink( page.title, { campaign: campaign, campaign_step: nextStep } );

				options.nextUrl = url;
				_super.call( self, options );
				self.show();
				mobileWebCta.hijackLink( self.$( '.continue' ), 'keepgoing-success', campaign, step );
				self.$( '.close' ).on( 'click', function() {
					self.log( 'keepgoing-exit' );
				} );
			} );
			this.log( 'keepgoing-shown' );
		}
	} );

	M.define( 'modules/keepgoing/KeepGoingDrawer', KeepGoingDrawer );

}( mw.mobileFrontend ) );

