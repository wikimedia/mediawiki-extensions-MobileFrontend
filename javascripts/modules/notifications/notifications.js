/**
 * This code loads the necessary modules for the notifications overlay, not to be confused
 * with the Toast notifications defined by common/toast.js.
 */
( function( M, $ ) {
	var
		mainmenu = M.require( 'mainmenu' ),
		$btn = $( '#secondary-button.user-button' );

	/**
	 * Loads a ResourceLoader module script. Shows ajax loader whilst loading.
	 *
	 * FIXME: Upstream to mw.mobileFrontend and reuse elsewhere
	 * @param {string} moduleName: Name of a module to fetch
	 * @returns {jQuery.Deferred}
	*/
	function loadModuleScript( moduleName ) {
		var d = $.Deferred();

		$btn.addClass( 'loading' );
		mw.loader.using( moduleName, function() {
			$btn.removeClass( 'loading' );
			d.resolve();
		} );
		return d;
	}

	// Once the DOM is loaded hijack the notifications button to display an overlay rather
	// than linking to Special:Notifications.
	$( function () {
		$btn.on( M.tapEvent( 'click' ), function() {
			M.router.navigate( '#/notifications' );
			// Important that we also prevent propagation to avoid interference with events that may be
			// binded on #mw-mf-page-center that close overlay
			return false;
		} );

		function loadNotificationOverlay() {
			var result = $.Deferred();
			loadModuleScript( 'mobile.notifications.overlay' ).done( function() {
				var NotificationsOverlay = M.require( 'modules/notifications/NotificationsOverlay' );
				result.resolve(
					new NotificationsOverlay( { $badge: $btn, count: parseInt( $btn.find( 'span' ).text(), 10 ) } )
				);
			} );

			return result;
		}

		M.overlayManager.add( /^\/notifications$/, function() {
			return loadNotificationOverlay().done( function( overlay ) {
				mainmenu.openNavigationDrawer( 'secondary' );
				overlay.on( 'hide', function() {
					mainmenu.closeNavigationDrawers();
					$( '#mw-mf-page-center' ).off( '.secondary' );
				});

				$( '#mw-mf-page-center' ).one( M.tapEvent( 'click' ) + '.secondary', function() {
					M.router.back();
				} );
			} );
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
