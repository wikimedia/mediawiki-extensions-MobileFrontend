/**
 * This code loads the necessary modules for the notifications overlay, not to be confused
 * with the Toast notifications defined by common/toast.js.
 */
( function( M, $ ) {
	var LoadingOverlay = M.require( 'LoadingOverlayNew' );

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
		var $btn = $( '#secondary-button.user-button' ).attr( 'href', '#/notifications' );
		M.overlayManager.add( /^\/notifications$/, function() {
			var result = $.Deferred();

			loadModuleScript( 'mobile.notifications.overlay' ).done( function() {
				var NotificationsOverlay = M.require( 'modules/notifications/NotificationsOverlay' );
				result.resolve(
					new NotificationsOverlay( { $badge: $btn, count: $btn.find( 'span' ).text() } )
				);
			} );

			return result;
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
