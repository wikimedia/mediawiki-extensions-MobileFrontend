( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Drawer = M.require( 'Drawer' ),
		RandomDrawer,
		api = M.require( 'api' );

	/**
	 * @class RandomDrawer
	 * @extends Drawer
	 * This creates the drawer at the bottom of the screen that appears when a user has
	 * clicked random in alpha
	 */
	RandomDrawer = Drawer.extend( {
		locked: true,
		defaults: {
			msg: mw.msg( 'mobilefrontend-random-explain' ),
			cancel: mw.msg( 'mobilefrontend-random-cancel' ),
			nextLabel: mw.msg( 'mobilefrontend-random-tryanother' )
		},
		template: M.template.get( 'modules/random/RandomDrawer' ),
		initialize: function( options ) {
			var self = this,
				_super = self._super;

			api.get( { action: 'query', list: 'random', rnnamespace: '0', rnlimit: 1 } ).done( function( resp ) {
				var page = resp.query.random[0],
					url = mw.util.getUrl( page.title ) + '#/random';

				options.nextUrl = url;
				_super.call( self, options );
				self.show();
			} );
		}
	} );

	M.define( 'modules/random/RandomDrawer', RandomDrawer );
}( mw.mobileFrontend ) );
