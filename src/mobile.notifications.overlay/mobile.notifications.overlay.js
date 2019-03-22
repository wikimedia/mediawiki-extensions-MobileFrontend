var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	defaultOverlay = require( './../mobile.startup/notifications/overlay' ),
	list = require( './list' ),
	NotificationsFilterOverlay = require( './NotificationsFilterOverlay' );

/**
 * @deprecated
 * @param {Object} options
 * @return {Overlay}
 */
function NotificationsOverlay( options ) {
	return defaultOverlay( function ( cappedCount ) {
		options.badge.setCount( cappedCount );
	}, function () {
		options.badge.markAsSeen();
	} );
}

m.define( 'mobile.notifications.overlay', {
	list
} );

m.define( 'mobile.notifications.overlay/NotificationsFilterOverlay', NotificationsFilterOverlay );
m.deprecate( 'mobile.notifications.overlay/NotificationsOverlay', NotificationsOverlay );
