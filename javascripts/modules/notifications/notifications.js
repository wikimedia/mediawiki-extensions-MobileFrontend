/**
 * This code loads the necessary modules for the notifications overlay, not to be confused
 * with the Toast notifications defined by common/toast.js.
 */
( function( M, $ ) {
	var LoadingOverlay = M.require( 'LoadingOverlayNew' ),
		mainmenu = M.require( 'mainmenu' );

	/**
	 * Loads a ResourceLoader module script. Shows ajax loader whilst loading.
	 *
	 * FIXME: Upstream to mw.mobileFrontend and reuse elsewhere
	 * @param {string} moduleName: Name of a module to fetch
	 * @returns {jQuery.Deferred}
	*/
	function loadModuleScript( moduleName ) {
		var d = $.Deferred(),
			loadingOverlay = new LoadingOverlay();
		loadingOverlay.$el.addClass( 'navigation-drawer' );
		loadingOverlay.show();
		mw.loader.using( moduleName, function() {
			loadingOverlay.hide();
			d.resolve();
		} );
		return d;
	}

	// Once the DOM is loaded hijack the notifications button to display an overlay rather
	// than linking to Special:Notifications.
	$( function () {
		var $btn = $( '#secondary-button.user-button' ).on( M.tapEvent( 'click' ), function() {
			window.location.hash = M.isBetaGroupMember() && M.isWideScreen() ? '#/notifications-drawer' : '#/notifications';
			// Important that we also prevent propagation to avoid interference with events that may be
			// binded on #mw-mf-page-center that close overlay
			return false;
		} );
		function loadNotificationOverlay() {
			var result = $.Deferred();
			loadModuleScript( 'mobile.notifications.overlay' ).done( function() {
				var NotificationsOverlay = M.require( 'modules/notifications/NotificationsOverlay' );
				result.resolve(
					new NotificationsOverlay( { $badge: $btn, count: $btn.find( 'span' ).text() } )
				);
			} );

			return result;
		}

		M.overlayManager.add( /^\/notifications$/, loadNotificationOverlay );
		if ( M.isBetaGroupMember() ) {
			M.overlayManager.add( /^\/notifications-drawer$/, function() {
				mainmenu.openNavigationDrawer( 'secondary' );
				$( '#mw-mf-page-center' ).one( M.tapEvent( 'click' ), function() {
					mainmenu.closeNavigationDrawers();
					window.location.hash = '';
				} );
				return loadNotificationOverlay().done( function( overlay ) {
					overlay.$el.addClass( 'navigation-drawer' );
					overlay.on( 'hide', mainmenu.closeNavigationDrawers );
				} );
			} );
		}
	} );
}( mw.mobileFrontend, jQuery ) );
