// FIXME: Refactor to use modules/nearby/Nearby
( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
	overlay,
	NearbyApi = M.require( 'modules/nearby/NearbyApi' ),
	api = new NearbyApi(),
	CACHE_KEY_LAST_LOCATION = 'mfNearbyLastKnownLocation';

function getOverlay() {
	return overlay;
}

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
		Nearby = View.extend( {
			template: M.template.get( 'articleList' ),
			/**
			 * Renders an error in the existing view
			 *
			 * @param {String} type A string that identifies a particular type of error message
			 */
			renderError: function( type ) {
				this.render( { error: errorMessages[ type ] } );
			},
			openPage: function( ev ) {
				// help back button work
				window.location.hash = '#' + $( ev.currentTarget ).attr( 'name' );
				window.location = $( ev.currentTarget ).attr( 'href' );
			},
			postRender: function() {
				var self = this;
				// use mouseup to allow right click
				this.$( 'a' ).on( 'mouseup', function( ev ) {
					// name funnel for watchlists to catch subsequent uploads
					$.cookie( 'mwUploadsFunnel', 'nearby', { expires: new Date( new Date().getTime() + 60000) } );
					self.openPage( ev );
				} );
				self.emit( 'rendered', this.$el );
			}
		} ),
		pendingQuery = false, btn;

		overlay = new Nearby( {
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

M.define( 'nearby', {
	endpoint: endpoint,
	getOverlay: getOverlay
} );


}( mw.mobileFrontend, jQuery ) );
