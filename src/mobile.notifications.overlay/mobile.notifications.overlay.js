var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	list = require( './list' ),
	NotificationsFilterOverlay = require( './NotificationsFilterOverlay' );

m.define( 'mobile.notifications.overlay', {
	list
} );

m.define( 'mobile.notifications.overlay/NotificationsFilterOverlay', NotificationsFilterOverlay );
