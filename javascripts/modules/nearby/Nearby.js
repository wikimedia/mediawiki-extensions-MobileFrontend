( function( M, $ ) {
	var NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
		View = M.require( 'view' ),
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
		loadFromCurrentLocation: function() {
			var self = this;
			if ( M.supportsGeoLocation() ) {
				this.render( { showLoader: true } );
				navigator.geolocation.getCurrentPosition( function( geo ) {
					var lat = geo.coords.latitude, lng = geo.coords.longitude;
					self.location = { latitude: lat, longitude: lng }; // save as json so it can be cached bug 48268
					self.render( { location: self.location } );
					self.emit( 'end-load-from-current-location' );
				},
				function() {
					self.renderError( 'location' );
					self.emit( 'end-load-from-current-location' );
				},
				{
					timeout: 10000,
					enableHighAccuracy: true
				} );
			} else {
				self.renderError( 'incompatible' );
			}
		},
		initialize: function( options ) {
			this.range = options.range || mw.config.get( 'wgMFNearbyRange' ) || 1000;
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
				this.$( '.loading' ).show();
			} else if ( !options.pages && !options.error && options.location ) {
				this.$( '.loading' ).show();
				this.api.getPages( options.location, this.range ).done( function( pages ) {
					self.emit( 'searchResult', pages );
					if ( pages.length > 0 ) {
						self.render( { pages: pages } );
					} else {
						self.renderError( 'empty' );
					}
				} ).fail( function() {
					self.renderError( 'server' );
				} );
			} else {
				this.$( '.loading' ).hide();
				this._postRenderLinks();
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
