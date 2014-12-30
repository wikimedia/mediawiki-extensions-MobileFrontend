( function ( M, $ ) {
	var NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
		PageList = M.require( 'modules/PageList' ),
		Nearby,
		browser = M.require( 'browser' ),
		icons = M.require( 'icons' );

	/**
	 * List of nearby pages

	 * @class Nearby
	 * @uses NearbyApi
	 * @extends PageList
	 */
	Nearby = PageList.extend( {
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
		templatePartials: {
			pageList: PageList.prototype.template
		},
		template: mw.template.get( 'mobile.nearby', 'Nearby.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.spinner HTML of the spinner icon with a tooltip that
		 * tells the user that their location is being looked up
		 */
		defaults: {
			spinner: icons.spinner( {
				title: mw.msg( 'mobile-frontend-nearby-loading' )
			} ).toHtmlString()
		},

		/**
		 * Obtain users current location and return a deferred object with the
		 * longitude and latitude values
		 * Resolve return object with 'incompatible' if browser doesn't support geo location
		 *
		 * @return {jQuery.Deferred}
		 */
		getCurrentPosition: function () {
			var result = $.Deferred();
			if ( browser.supportsGeoLocation() ) {
				navigator.geolocation.getCurrentPosition( function ( geo ) {
						result.resolve( {
							latitude: geo.coords.latitude,
							longitude: geo.coords.longitude
						} );
					},
					function ( err ) {
						// see https://developer.mozilla.org/en-US/docs/Web/API/PositionError
						if ( err.code === 1 ) {
							err = 'permission';
						} else {
							err = 'location';
						}
						result.reject( err );
					},
					{
						timeout: 10000,
						enableHighAccuracy: true
					} );
			} else {
				result.reject( 'incompatible' );
			}
			return result;
		},
		/**
		 * Get pages within a nearby range of current location
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			var self = this,
				_super = PageList.prototype.initialize;

			this.range = options.range || mw.config.get( 'wgMFNearbyRange' ) || 1000;
			this.source = options.source || 'nearby';
			this.nearbyApi = new NearbyApi();

			if ( options.errorType ) {
				options.error = this.errorMessages[ options.errorType ];
			}

			// Re-run after api/geolocation request
			if ( options.useCurrentLocation ) {
				// Flush any existing list of pages
				options.pages = [];

				// Get some new pages
				this.getCurrentPosition().done( function ( coordOptions ) {
					$.extend( options, coordOptions );
					self._find( options ).done( function ( options ) {
						_super.call( self, options );
					} );
				} ).fail( function ( errorType ) {
					options.errorType = errorType;
					_super.call( self, options );
				} );
			} else if ( ( options.latitude && options.longitude ) || options.pageTitle ) {
				// Flush any existing list of pages
				options.pages = [];

				// Get some new pages
				this._find( options ).done( function ( options ) {
					_super.call( self, options );
				} );
			}

			// Run it once for loader etc
			this._isLoading = true;
			_super.apply( this, arguments );
		},
		/**
		 * Request pages from api based on provided options.
		 * When options.longitude and options.latitude set getPages near that location.
		 * If those are not present use options.title to find pages near that title.
		 * If no valid options given resolve return object with error message.
		 * @param {Object} options
		 * @return {jQuery.Deferred}
		 * @private
		 */
		_find: function ( options ) {
			var result = $.Deferred(),
				self = this;

			/**
			 * Handler for successful query
			 * @param {Array} pages as passed by done callback of Nearby##getPages
			 * @ignore
			 */
			function pagesSuccess( pages ) {
				options.pages = pages;
				if ( pages && pages.length === 0 ) {
					options.error = self.errorMessages.empty;
				}
				self._isLoading = false;
				result.resolve( options );
			}

			/**
			 * Handler for failed query
			 * @ignore
			 */
			function pagesError() {
				self._isLoading = false;
				options.error = self.errorMessages.server;
				result.resolve( options );
			}

			if ( options.latitude && options.longitude ) {
				this.nearbyApi.getPages( {
							latitude: options.latitude,
							longitude: options.longitude
						},
						this.range, options.exclude
					)
					.done( pagesSuccess )
					.fail( pagesError );
			} else if ( options.pageTitle ) {
				this.nearbyApi.getPagesAroundPage( options.pageTitle, this.range )
					.done( pagesSuccess )
					.fail( pagesError );
			} else {
				if ( options.errorType ) {
					options.error = this.errorMessages[ options.errorType ];
				}
				result.resolve( options );
			}
			return result;
		},
		/** @inheritdoc */
		postRender: function () {
			if ( !this._isLoading ) {
				this.$( '.spinner' ).hide();
			}
			PageList.prototype.postRender.apply( this, arguments );
			this._postRenderLinks();
		},
		/**
		 * Hijack links to apply several customisations to them:
		 * Ensure that when clicked they register an uploads funnel.
		 * Ensure that when a user navigates back to the page their page position is restored using
		 * fragment identifier trickery.
		 * @private
		 */
		_postRenderLinks: function () {
			var offset,
				hash = window.location.hash;

			this.$( 'a' ).each( function ( i ) {
				// FIXME: not unique if multiple Nearby objects on same page
				$( this ).attr( 'id', 'nearby-page-list-item-' + i );
			} ).on( 'click', function () {
				window.location.hash = $( this ).attr( 'id' );
				// name funnel for watchlists to catch subsequent uploads
				$.cookie( 'mwUploadsFunnel', 'nearby', {
					expires: new Date( new Date().getTime() + 60000 )
				} );
			} );

			// Restore the offset
			if ( hash.indexOf( '/' ) === -1 ) {
				offset = $( window.location.hash ).offset();
				if ( offset ) {
					// Don't reset the hash here as we don't want to trigger another Route
					$( window ).scrollTop( offset.top );
				}
			}
		}
	} );

	M.define( 'modules/nearby/Nearby', Nearby );

}( mw.mobileFrontend, jQuery ) );
