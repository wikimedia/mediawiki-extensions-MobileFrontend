/* global $ */
var
	api = new mw.Api(),
	nearbyErrorMessage = require( './nearbyErrorMessage' ),
	LocationProvider = require( './LocationProvider' ),
	range = mw.config.get( 'wgMFNearbyRange' ) || 1000,
	promisedView = require( './../mobile.startup/promisedView' ),
	router = mw.loader.require( 'mediawiki.router' ),
	$nearby = $( '#mw-mf-nearby' ),
	WatchstarPageList = require( '../mobile.startup/watchstar/WatchstarPageList' ),
	$infoContainer = $( '#mf-nearby-info-holder' ),
	NearbyGateway = require( './NearbyGateway' ),
	nearbyGateway = new NearbyGateway( { api } );

/**
 * Show the title and hide the info container
 */
function hideInitialScreen() {
	$infoContainer.hide();
	$( 'body' ).removeClass( 'nearby-accept-pending' );
}

/**
 * @param {View} view to render
 * @param {jQuery.Object} $nearby where to render
 */
function render( view, $nearby ) {
	hideInitialScreen();
	$nearby.empty().append( view.$el ).show();
}

router.on( 'hashchange', function () {
	if ( router.getPath() === '' ) {
		$infoContainer.show();
		$nearby.hide();
	} else {
		$infoContainer.hide();
		$nearby.show();
	}
} );

/**
 * @param {number} latitude
 * @param {number} longitude
 * @return {View} that will resolve to a WatchstarPageList or the result of nearbyErrorMessage
 */
function nearbyPageList( latitude, longitude ) {
	const coordinates = {
		latitude,
		longitude
	};
	return promisedView(
		nearbyGateway.getPages( coordinates, range ).then( function ( pages ) {
			return new WatchstarPageList( {
				pages,
				api
			} );
		}, function ( errorType ) {
			return nearbyErrorMessage( errorType );
		} )
	);
}
/*
 * #/coords/lat,long
 */
router.route( /^\/coord\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, function ( latitude, longitude ) {
	render( nearbyPageList( latitude, longitude ), $nearby );
} );

/*
 * #/page/PageTitle
 */
router.route( /^\/page\/(.+)$/, function ( pageTitle ) {
	const view = promisedView(
		nearbyGateway.getPagesAroundPage( mw.Uri.decode( pageTitle ), range )
			.then( function ( pages ) {
				return new WatchstarPageList( {
					pages,
					api
				} );
			} ).catch( function ( errorType ) {
				return nearbyErrorMessage( errorType );
			} )
	);
	render( view, $nearby );
} );

router.checkRoute();
$( function () {
	$( '#showArticles' ).prop( 'disabled', false ).on( 'click', function () {
		const view = promisedView(
			LocationProvider.getCurrentPosition().then( function ( geo ) {
				const { latitude, longitude } = geo;
				router.navigateTo( null, { path: `#/coord/${latitude},${longitude}` } );
				return nearbyPageList( latitude, longitude );
			} ).catch( function ( errorType ) {
				return nearbyErrorMessage( errorType );
			} )
		);
		render( view, $nearby );
	} );
} );
