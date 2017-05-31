( function ( M ) {
	var OverlayManager = M.require( 'mobile.startup/OverlayManager' ),
		NotificationBadge = M.require( 'skins.minerva.notifications/NotificationBadge' );

	QUnit.module( 'Minerva NotificationBadge', {
		setup: function () {
			this.router = require( 'mediawiki.router' );
			this.OverlayManager = new OverlayManager( this.router );
		}
	} );

	QUnit.test( '#setCount', 2, function ( assert ) {
		var initialClassExpectationsMet,
			badge = new NotificationBadge( {
				overlayManager: this.OverlayManager,
				hasNotifications: true,
				hasUnseenNotifications: true,
				notificationCount: 5
			} );
		initialClassExpectationsMet = badge.$el.find( '.mw-ui-icon' ).length === 0 &&
			badge.$el.find( '.zero' ).length === 0;

		badge.setCount( 0 );
		assert.ok( initialClassExpectationsMet, 'No icon and no zero class' );
		assert.ok( badge.$el.find( '.zero' ).length === 1, 'A zero class is present on the badge' );
	} );

	QUnit.test( '#render [hasUnseenNotifications]', 1, function ( assert ) {
		var badge = new NotificationBadge( {
			notificationCount: 0,
			overlayManager: this.OverlayManager,
			hasNotifications: false,
			hasUnseenNotifications: false
		} );
		assert.ok( badge.$el.find( '.mw-ui-icon' ).length === 1, 'A bell icon is visible' );
	} );

	QUnit.test( '#markAsSeen', 2, function ( assert ) {
		var badge = new NotificationBadge( {
			notificationCount: 2,
			overlayManager: this.OverlayManager,
			hasNotifications: true,
			hasUnseenNotifications: true
		} );
		// Badge resets counter to zero
		badge.setCount( 0 );
		assert.ok( badge.$el.find( '.mw-ui-icon' ).length === 0, 'The bell icon is not visible' );
		badge.markAsSeen();
		assert.ok( badge.$el.find( '.notification-unseen' ).length === 0,
			'Unseen class disappears after markAsSeen called.' );
	} );
}( mw.mobileFrontend ) );
