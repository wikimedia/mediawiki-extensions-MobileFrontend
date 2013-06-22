( function( M ) {
	var NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
		View = M.require( 'view' ),
		range = 1000,
		Nearby;

	Nearby = View.extend( {
		template: M.template.get( 'articleList' ),
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-nearby-loading' )
		},
		errorMessages: {
			empty: {
				heading: mw.msg( 'mobile-frontend-nearby-noresults' ),
				guidance: mw.msg( 'mobile-frontend-nearby-noresults-guidance' )
			},
			server: {
				heading: mw.msg( 'mobile-frontend-nearby-error' ),
				guidance: mw.msg( 'mobile-frontend-nearby-error-guidance' )
			}
		},
		initialize: function( options ) {
			this.range = options.range;
			if ( options.location ) {
				this.location = options.location;
			}
			this.api = new NearbyApi();
			this._super( options );
		},
		preRender: function( options ) {
			if ( options.pages && options.pages.length === 0 ) {
				options.error = this.errorMessages.empty;
			}
		},
		postRender: function( options ) {
			var self = this;
			if ( !options.pages && !options.error && this.location ) {
				self.$( '.loading' ).show();
				this.api.getPages( this.location, range ).done( function( pages ) {
					self.render( { pages: pages } );
				} ).fail( function() {
					self.render( { error:  self.errorMessages.server } );
				} );
			}
		}
	} );

	M.define( 'modules/nearby/Nearby', Nearby );

}( mw.mobileFrontend ) );
