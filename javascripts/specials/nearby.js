// FIXME: Refactor to use modules/nearby/Nearby
( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
	overlay,
	wgMFMode = mw.config.get( 'wgMFMode' ),
	NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
	api = new NearbyApi(),
	CACHE_KEY_LAST_LOCATION = 'mfNearbyLastKnownLocation';

$( function() {
	var supported = M.supportsGeoLocation(),
		View = M.require( 'view' ),
		$userBtn = $( '#user-button' ),
		errorMessages = {
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
			// recycle it's already in html
			incompatible: {
				heading: $( '#mw-mf-nearby .noscript h2' ).text(),
				guidance: $( '#mw-mf-nearby .noscript p' ).text()
			}
		},
		curLocation,
		lastKnownLocation = M.settings.getUserSetting( CACHE_KEY_LAST_LOCATION ),
		cache = M.settings.saveUserSetting,
		lastSearchResult = M.settings.getUserSetting( CACHE_KEY_RESULTS ),
		// FIXME: Adapt modules/nearby/Nearby.js and use that instead
		SpecialNearby = View.extend( {
			template: M.template.get( 'articleList' ),
			/**
			 * Renders an error in the existing view
			 *
			 * @param {String} type A string that identifies a particular type of error message
			 */
			renderError: function( type ) {
				this.render( { error: errorMessages[ type ] } );
			},
			postRender: function() {
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
									endpoint: endpoint,
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
		} ),
		pendingQuery = false, btn;

		overlay = new SpecialNearby( {
			el: $( '#mw-mf-nearby' )
		} );

	function render( $content, pages ) {
		cache( CACHE_KEY_RESULTS, $.toJSON( pages ) ); // cache result

		overlay.render( {
			pages: pages
		} );
	}

	function findResults( location ) {
		var $content = $( '#mw-mf-nearby' ), range = mw.config.get( 'wgMFNearbyRange' );

		api.getPages( location, range ).done( function( pages ) {
			if ( pages.length > 0 ) {
				render( $content, pages );
			} else {
				overlay.renderError( 'empty' );
			}
		} ).fail( function() {
			overlay.renderError( 'server' );
		} );
	}

	function completeRefresh() {
		$( 'button.refresh' ).removeClass( 'refreshing' );
		pendingQuery = false;
	}

	function init() {
		var $content = $( '#mw-mf-nearby' ).empty();
		$( '<div class="content loading"> ').text(
			mw.msg( 'mobile-frontend-nearby-loading' ) ).appendTo( $content );
		navigator.geolocation.getCurrentPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			curLocation = { latitude: lat, longitude: lng }; // save as json so it can be cached bug 48268
			cache( CACHE_KEY_LAST_LOCATION, $.toJSON( curLocation ) );
			findResults( curLocation );
			completeRefresh();
		},
		function() {
			overlay.renderError( 'location' );
			completeRefresh();
		},
		{
			timeout: 10000,
			enableHighAccuracy: true
		} );
	}

	function refresh() {
		if ( pendingQuery ) {
			return;
		} else {
			$( 'button.refresh' ).addClass( 'refreshing' );
			pendingQuery = true;
			init();
		}
	}

	if ( supported ) {
		if ( lastKnownLocation ) {
			curLocation = $.parseJSON( lastKnownLocation );
			if ( !curLocation.latitude ) { // Fix damage caused by bug 48268 which will throw an error in watchPosition handler
				curLocation = false;
			}
		}
		if ( lastSearchResult && window.location.hash ) {
			render( $( '#content' ), $.parseJSON( lastSearchResult ) );
		} else {
			init();
		}
	} else {
		overlay.renderError( 'incompatible' );
	}

	if ( $userBtn.length ) {
		$userBtn.remove();
	}
	// FIXME: i18n
	btn = $( '<button class="refresh">' ).on( 'click', refresh ).appendTo( '.header' );
} );

}( mw.mobileFrontend, jQuery ) );
