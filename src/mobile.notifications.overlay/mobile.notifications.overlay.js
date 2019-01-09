var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	NotificationsOverlay = require( './NotificationsOverlay' ),
	NotificationsFilterOverlay = require( './NotificationsFilterOverlay' );

m.define( 'mobile.notifications.overlay/NotificationsFilterOverlay', NotificationsFilterOverlay );
m.define( 'mobile.notifications.overlay/NotificationsOverlay', NotificationsOverlay );
