( function( M, $ ) {
	var LoadingOverlay = M.require( 'LoadingOverlay' );

	// Once the DOM is loaded hijack the notifications button to display an overlay rather
	// than linking to Special:Notifications.
	$( function () {
		$( '#secondary-button.user-button' ).on( 'click', function( ev ) {
			var loadingOverlay = new LoadingOverlay();

			loadingOverlay.show();
			ev.preventDefault();

			mw.loader.using( 'mobile.notifications.overlay', function() {
				var NotificationsOverlay = M.require( 'modules/notifications/NotificationsOverlay' );

				loadingOverlay.hide();
				new NotificationsOverlay( { $badge: $( this ) } ).show();
			} );
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
