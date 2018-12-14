/* global $ */
( function ( M, config, msg, loader ) {
	/** @event */
	var api,
		NEARBY_EVENT_POST_RENDER = 'Nearby-postRender',
		LocationProvider = M.require( 'mobile.nearby/LocationProvider' ),
		LoadingOverlay = mw.mobileFrontend.require( 'mobile.startup/LoadingOverlay' ),
		router = require( 'mediawiki.router' ),
		Nearby = M.require( 'mobile.nearby/Nearby' ),
		util = M.require( 'mobile.startup/util' ),
		$infoContainer = $( '#mf-nearby-info-holder' ),
		eventBus = new OO.EventEmitter(),
		nearby,
		options = {
			eventBus: eventBus,
			el: $( '#mw-mf-nearby' ),
			funnel: 'nearby',
			onItemClick: function ( ev ) {
				if ( !util.isModifiedEvent( ev ) && !isPageOrCoordFragment( router.getPath() ) ) {
					// Change the URL fragment to the clicked element so that back
					// navigation can retain the item position. This behavior is
					// unwanted for results displayed around a page or coordinate since
					// that information is stored in the hash and would be overwritten.
					router.navigate( $( this ).attr( 'id' ) );
				}
			}
		},
		overlay = new LoadingOverlay();

	/**
	 * Show the title and hide the info container
	 */
	function hideInitialScreen() {
		$infoContainer.remove();
		$( 'body' ).removeClass( 'nearby-accept-pending' );
	}
	/**
	 * @param {string} fragment The URL fragment.
	 * @return {boolean} True if the current URL is based around page or
	 *                   coordinates (as opposed to current location or search).
	 *                   e.g.: Special:Nearby#/page/San_Francisco and
	 *                   Special:Nearby#/coord/0,0.
	 */
	function isPageOrCoordFragment( fragment ) {
		return fragment.match( /^(\/page|\/coord)/ );
	}

	/**
	 * @param {string} fragment The URL fragment.
	 * @return {boolean} True if the current URL doesn't contain an invalid
	 *                   identifier expression, such as the slash in
	 *                   Special:Nearby#/search, and probably contains the
	 *                   target identifier to scroll to.
	 */
	function isFragmentIdentifier( fragment ) {
		return fragment && fragment.indexOf( '/' ) === -1;
	}

	/**
	 * Initialize or instantiate Nearby with options
	 * @param {Object} opt
	 * @param {mw.Api} opt.api instance
	 */
	function refresh( opt ) {
		// make sure, that the api object (if created above) is added to the options object used
		// in the Nearby module
		opt = util.extend( {}, opt, options );

		if ( !nearby ) {
			nearby = new Nearby( opt );
			// todo: use the local emitter when refresh() doesn't recreate the
			//       OO.EventEmitter by calling the super's constructor.
			eventBus.on( NEARBY_EVENT_POST_RENDER, function () {
				var fragment = router.getPath(), el;
				if ( isFragmentIdentifier( fragment ) ) {
					// The hash is expected to be an identifier selector (unless the
					// user entered rubbish).
					el = nearby.$( '#' + fragment );
					if ( el[0] && el[0].nodeType ) {
						$( window ).scrollTop( el.offset().top );
					}
				}
				overlay.hide();
			} );
		}
		nearby.refresh( opt );
	}

	// Routing on the nearby view

	/**
	 * Return a working instance of an api that can be used
	 * to obtain nearby information.
	 * @return {JQuery.Deferred<mw.Api>} that resolves with an mw.Api
	 */
	function getApi() {
		var d = util.Deferred(),
			endpoint = config.get( 'wgMFNearbyEndpoint' );

		if ( api ) {
			d.resolve( api );
		} else if ( endpoint ) {
			loader.using( 'mobile.foreignApi' ).then( function () {
				var Api = M.require( 'mobile.foreignApi/JSONPForeignApi' );
				api = new Api( endpoint );
				d.resolve( api );
			} );
		} else {
			api = new mw.Api();
			d.resolve( api );
		}
		return d;
	}
	/*
	 * #/coords/lat,long
	 */
	router.route( /^\/coord\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, function ( lat, lon ) {
		// TODO this is bad, route shouldn't have side effects but otherwise mediawiki router
		// cannot refresh the page. We need to store those so when user hits $refreshButton
		// we reload the results
		options.latitude = lat;
		options.longitude = lon;

		hideInitialScreen();
		// Search with coordinates
		getApi().then( function ( api ) {
			refresh( util.extend( options, { api: api } ) );
		} );
	} );

	/*
	 * #/page/PageTitle
	 */
	router.route( /^\/page\/(.+)$/, function ( pageTitle ) {
		hideInitialScreen();
		overlay.hide();
		getApi().then( function ( api ) {
			refresh( util.extend( {}, options, {
				api: api,
				pageTitle: mw.Uri.decode( pageTitle )
			} ) );
		} );
	} );

	router.checkRoute();
	$( '#showArticles' ).on( 'click', function () {
		overlay.show();
		LocationProvider.getCurrentPosition().then( function ( geo ) {
			router.navigate( '#/coord/' + geo.latitude + ',' + geo.longitude );
		} ).catch( function ( error ) {
			overlay.hide();
			// We want to show the Alert dialog to make sure user sees it
			switch ( error ) {
				case 'permission':
					// eslint-disable-next-line no-alert
					alert( msg( 'mobile-frontend-nearby-permission-denied' ) );
					break;
				case 'location':
					// eslint-disable-next-line no-alert
					alert( msg( 'mobile-frontend-nearby-location-unavailable' ) );
					break;
				default:
					// timeout or undefined, do nothing for now
			}
		} );
	} );

}( mw.mobileFrontend, mw.config, mw.msg, mw.loader ) );
