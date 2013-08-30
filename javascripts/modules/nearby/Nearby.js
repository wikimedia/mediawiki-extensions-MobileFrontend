( function( M, $ ) {
	var NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
		View = M.require( 'view' ),
		range = 1000,
		wgMFMode = mw.config.get( 'wgMFMode' ),
		Nearby;

	Nearby = View.extend( {
		template: M.template.get( 'articleList' ),
		/**
		 * Renders an error in the existing view
		 *
		 * @param {String} type A string that identifies a particular type of error message
		 */
		renderError: function( type ) {
			this.render( { error: this.errorMessages[ type ] } );
		},
		defaults: {
			loadingMessage: mw.msg( 'mobile-frontend-nearby-loading' )
		},
		errorMessages: {
			empty: {
				heading: mw.msg( 'mobile-frontend-nearby-noresults' ),
				guidance: mw.msg( 'mobile-frontend-nearby-noresults-guidance' )
			},
			location: {
				heading: mw.msg( 'mobile-frontend-nearby-lookup-ui-error' ),
				guidance: mw.msg( 'mobile-frontend-nearby-lookup-ui-error-guidance' )
			},
			server: {
				heading: mw.msg( 'mobile-frontend-nearby-error' ),
				guidance: mw.msg( 'mobile-frontend-nearby-error-guidance' )
			},
			incompatible: {
				heading: mw.msg( 'mobile-frontend-nearby-requirements' ),
				guidance: mw.msg( 'mobile-frontend-nearby-requirements-guidance' )
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
			if ( options.showLoader ) {
				self.$( '.loading' ).show();
			} else if ( !options.pages && !options.error && this.location ) {
				self.$( '.loading' ).show();
				this.api.getPages( this.location, range ).done( function( pages ) {
					self.render( { pages: pages } );
				} ).fail( function() {
					self.render( { error:  self.errorMessages.server } );
				} );
			} else {
				self.$( '.loading' ).hide();
				self._postRenderLinks();
			}
		},
		_postRenderLinks: function() {
			var self = this;
			this.$( 'a' ).on( 'click', function( ev ) {
				var $a = $( ev.currentTarget );
				// name funnel for watchlists to catch subsequent uploads
				$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );
				if ( wgMFMode === 'stable' ) {
					window.location.hash = '#' + $( ev.currentTarget ).attr( 'name' );
				} else {
					ev.preventDefault();

					// Trigger preview mode
					mw.loader.using( 'mobile.nearby.previews', function() {
							var PagePreviewOverlay = M.require( 'PagePreviewOverlay' );
							new PagePreviewOverlay( {
								parent: self.options.parentOverlay,
								endpoint: mw.config.get( 'wgMFNearbyEndpoint' ),
								latLngString: $a.data( 'latlng' ),
								img: $( '<div>' ).append( $a.find( '.listThumb' ).clone() ).html(),
								title: $a.find( 'h2' ).text()
							} );
					} );
				}
			} );

			// Load watch stars in alpha
			if ( wgMFMode === 'alpha' ) {
				mw.loader.using( 'mobile.stable', function() {
					M.require( 'watchstar' ).initWatchListIconList( self.$( 'ul' ) );
				} );
			}
		}
	} );

	M.define( 'modules/nearby/Nearby', Nearby );

}( mw.mobileFrontend, jQuery ) );
