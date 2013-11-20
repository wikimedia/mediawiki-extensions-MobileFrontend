( function( M, $ ) {
	var useNewOverlays = mw.config.get( 'wgMFMode' ) !== 'stable',
		LoadingOverlay = useNewOverlays ? M.require( 'LoadingOverlayNew' ) : M.require( 'LoadingOverlay' );

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
		var $btn = $( '#secondary-button.user-button' );

		if ( useNewOverlays ) {
			$btn.attr( 'href', '#notifications' );
			M.router.route( /^notifications$/, function() {
				loadModuleScript( 'mobile.notifications.overlay.beta' ).done( function() {
					var NotificationsOverlayNew = M.require( 'modules/notifications/NotificationsOverlayNew' );
					new NotificationsOverlayNew( { $badge: $btn, headerContext: $btn.find( 'span' ).text() } ).show();
				} );
			} );

		} else {
			$btn.on( 'click', function( ev ) {
				ev.preventDefault();
				loadModuleScript( 'mobile.notifications.overlay' ).done( function() {
						var NotificationsOverlay = M.require( 'modules/notifications/NotificationsOverlay' );
						new NotificationsOverlay( { $badge: $btn } ).show();
				} );
			} );
		}
	} );
}( mw.mobileFrontend, jQuery ) );
