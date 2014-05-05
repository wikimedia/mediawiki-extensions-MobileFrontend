( function( M, $ ) {
	var NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
		View = M.require( 'View' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' ),
		LoadingOverlay = M.require( 'LoadingOverlayNew' ),
		loader = new LoadingOverlay(),
		Nearby;

	/**
	 * FIXME: Rewrite as extension of PageList class
	 * @extends View
	 * @class Nearby
	 */
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
			permission: {
				heading: mw.msg( 'mobile-frontend-nearby-permission' ),
				guidance: mw.msg( 'mobile-frontend-nearby-permission-guidance' )
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
				function( err ) {
					// see https://developer.mozilla.org/en-US/docs/Web/API/PositionError
					if ( err.code === 1 ) {
						self.renderError( 'permission' );
					} else {
						self.renderError( 'location' );
					}
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
			this.source = options.source || 'nearby';
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
				this.api.getPages( options.location, this.range, options.exclude ).done( function( pages ) {
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
				var $a = $( ev.currentTarget ),
					title = $a.find( 'h2' ).text();

				// name funnel for watchlists to catch subsequent uploads
				$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );
				// Note router support required for page previews in beta
				if ( !M.isBetaGroupMember() || !M.router.isSupported() ) {
					window.location.hash = '#' + $( ev.currentTarget ).attr( 'name' );
				} else {
					ev.preventDefault();

					// Trigger preview mode ensure preview code has fully loaded first!
					MobileWebClickTracking.log( self.source + '-preview', title );
					loader.show();
					mw.loader.using( 'mobile.special.nearby.beta', function() {
						loader.hide();
						// FIXME: [API] should be able to determine longitude/latitude from title
						window.location.hash = '#preview/' + self.source + '/' + $a.data( 'latlng' ) + '/' + $a.data( 'title' );
					} );
				}
			} );
		}
	} );

	M.define( 'modules/nearby/Nearby', Nearby );

}( mw.mobileFrontend, jQuery ) );
