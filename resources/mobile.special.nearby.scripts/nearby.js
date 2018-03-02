/* global jQuery */
( function ( M, $ ) {
	/** @ignore @event Nearby#Nearby-postRender */
	var NEARBY_EVENT_POST_RENDER = 'Nearby-postRender',
		Icon = M.require( 'mobile.startup/Icon' ),
		endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
		router = require( 'mediawiki.router' ),
		Nearby = M.require( 'mobile.nearby/Nearby' ),
		util = M.require( 'mobile.startup/util' );

	$( function () {
		var
			nearby,
			options = {
				el: $( '#mw-mf-nearby' ),
				funnel: 'nearby',
				onItemClick: function ( ev ) {
					if ( !util.isModifiedEvent( ev ) && !isPageOrCoordURL( window.location ) ) {
						// Change the URL fragment to the clicked element so that back
						// navigation can retain the item position. This behavior is
						// unwanted for results displayed around a page or coordinate since
						// that information is stored in the hash and would be overwritten.
						window.location.hash = $( this ).attr( 'id' );
					}
				}
			},
			$btn = $( '#secondary-button' ).parent(),
			icon,
			$iconContainer,
			$icon;

		/**
		 * @param {Location} location The URL, probably window.location.
		 * @return {boolean} True if the current URL is based around page or
		 *                   coordinates (as opposed to current location or search).
		 *                   e.g.: Special:Nearby#/page/San_Francisco and
		 *                   Special:Nearby#/coord/0,0.
		 * @ignore
		 */
		function isPageOrCoordURL( location ) {
			return location.hash.match( /^(#\/page|#\/coord)/ );
		}

		/**
		 * @param {Location} location The URL, probably window.location.
		 * @return {boolean} True if the current URL doesn't contain an invalid
		 *                   identifier expression, such as the slash in
		 *                   Special:Nearby#/search, and probably contains the
		 *                   target identifier to scroll to.
		 * @ignore
		 */
		function isIdentifierURL( location ) {
			return location.hash && !location.hash.contains( '/' );
		}

		// Remove user button
		if ( $btn.length ) {
			$btn.remove();
		}

		// Create refresh button on the header
		icon = new Icon( {
			name: 'refresh',
			id: 'secondary-button',
			additionalClassNames: 'main-header-button',
			// refresh button doesn't perform any action related
			// to the form when button attribute is used
			el: $( '<button>' ).attr( 'type', 'button' ),
			title: mw.msg( 'mobile-frontend-nearby-refresh' ),
			label: mw.msg( 'mobile-frontend-nearby-refresh' )
		} );
		$iconContainer = $( '<div>' );

		$icon = icon.$el.on( 'click', refreshCurrentLocation )
			.appendTo( $iconContainer );

		$iconContainer.appendTo( '.header' );

		/**
		 * Initialize or instantiate Nearby with options
		 * @method
		 * @ignore
		 * @param {Object} opt
		 */
		function refresh( opt ) {
			// check, if the api object (options.api) is already created and set
			if ( options.api === undefined ) {
				// decide, what api module to use to retrieve the pages
				if ( endpoint ) {
					mw.loader.using( 'mobile.foreignApi' ).done( function () {
						var JSONPForeignApi = M.require( 'mobile.foreignApi/JSONPForeignApi' );
						options.api = new JSONPForeignApi( endpoint );
					} );
				} else {
					options.api = new mw.Api();
				}
			}
			// make sure, that the api object (if created above) is added to the options object used
			// in the Nearby module
			opt = util.extend( {}, opt, options );

			if ( !nearby ) {
				nearby = new Nearby( opt );
				// todo: use the local emitter when refresh() doesn't recreate the
				//       OO.EventEmitter by calling the super's constructor.
				M.on( NEARBY_EVENT_POST_RENDER, function () {
					var el;
					if ( isIdentifierURL( window.location ) ) {
						// The hash (including the leading #) is expected to be an identifier
						// selector (unless the user entered rubbish).
						el = nearby.$( window.location.hash );
						if ( el[0] && el[0].nodeType ) {
							$( window ).scrollTop( el.offset().top );
						}
					}
				} );
			}
			nearby.refresh( opt );
		}

		// Routing on the nearby view

		/*
		 * #/coords/lat,long
		 */
		router.route( /^\/coord\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, function ( lat, lon ) {
			$icon.hide();
			// Search with coordinates
			refresh( util.extend( {}, options, {
				latitude: lat,
				longitude: lon
			} ) );
		} );

		/*
		 * #/page/PageTitle
		 */
		router.route( /^\/page\/(.+)$/, function ( pageTitle ) {
			$icon.hide();
			refresh( util.extend( {}, options, {
				pageTitle: mw.Uri.decode( pageTitle )
			} ) );
		} );

		/**
		 * Refresh the current view using browser geolocation api
		 * @ignore
		 */
		function refreshCurrentLocation() {
			$icon.show();
			refresh( util.extend( {}, options, {
				useCurrentLocation: true
			} ) );
		}

		/*
		 * Anything else search with current location
		 * FIXME: The regex has to negate the rest of the routes because every time we
		 * define a route with router.route that route gets matched against the
		 * current hash.
		 */
		router.route( /^(?!.coord|.page).*$/, refreshCurrentLocation );
		router.checkRoute();

	} );

}( mw.mobileFrontend, jQuery ) );
