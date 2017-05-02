/*
 * This code loads the necessary modules for the notifications overlay, not to be confused
 * with the Toast notifications defined by common/toast.js.
 */
( function ( M, $, mw ) {
	var mainMenu = M.require( 'skins.minerva.scripts/skin' ).getMainMenu(),
		$btn = $( '#secondary-button.user-button' ).parent(),
		router = require( 'mediawiki.router' ),
		overlayManager = M.require( 'skins.minerva.scripts/overlayManager' ),
		icons = M.require( 'mobile.startup/icons' ),
		initialized = false;

	/**
	 * Loads a ResourceLoader module script. Shows ajax loader whilst loading.
	 * @method
	 * @ignore
	 * FIXME: Upstream to mw.mobileFrontend and reuse elsewhere
	 * @param {string} moduleName Name of a module to fetch
	 * @return {jQuery.Deferred}
	 */
	function loadModuleScript( moduleName ) {
		var $spinner = $( icons.spinner().toHtmlString() );

		$btn.hide().after( $spinner );
		return mw.loader.using( moduleName ).then( function () {
			// FIXME: Some code uses the loading class while other code uses the
			// spinner class. Make all code consistent so it's easier to change.
			$spinner.remove();
			$btn.show();
		} );
	}

	// Once the DOM is loaded hijack the notifications button to display an overlay rather
	// than linking to Special:Notifications.
	$( function () {

		/**
		 * Click event handler which opens the drawer and disables default link behaviour
		 * @method
		 * @ignore
		 * @return {Boolean}
		 */
		function openNavigationDrawer() {
			router.navigate( '#/notifications' );
			// Important that we also prevent propagation to avoid interference with events that may be
			// binded on #mw-mf-page-center that close overlay
			return false;
		}
		$btn.on( 'click', openNavigationDrawer );

		/**
		 * Load the notification overlay.
		 * @method
		 * @ignore
		 * @private
		 * @uses NotificationsOverlay
		 * @return {jQuery.Deferred} with an instance of NotificationsOverlay
		 */
		function loadNotificationOverlay() {
			var result = $.Deferred();
			loadModuleScript( 'mobile.notifications.overlay' ).done( function () {
				var NotificationsOverlay = M.require( 'mobile.notifications.overlay/NotificationsOverlay' );
				result.resolve(
					new NotificationsOverlay( {
						$badge: $btn,
						count: parseInt( $btn.find( 'span' ).text(), 10 )
					} )
				);
			} );

			return result;
		}

		overlayManager.add( /^\/notifications$/, function () {
			return loadNotificationOverlay().done( function ( overlay ) {
				mainMenu.openNavigationDrawer( 'secondary' );
				overlay.on( 'hide', function () {
					mainMenu.closeNavigationDrawers();
					$( '#mw-mf-page-center' ).off( '.secondary' );
				} );

				$( '#mw-mf-page-center' ).one( 'click.secondary', function () {
					router.back();
				} );
			} );
		} );

		/**
		 * Adds a filter button to the UI inside notificationsInboxWidget
		 * @method
		 * @ignore
		 */
		function addFilterButton() {
			// Create filter button once the notifications overlay has been loaded
			var filterStatusButton = new OO.ui.ButtonWidget(
				{
					href: '#/notifications-filter',
					classes: [ 'mw-echo-ui-notificationsInboxWidget-main-toolbar-nav-filter-placeholder' ],
					icon: 'funnel',
					label: 'Filter'
				} );

			$( '.mw-echo-ui-notificationsInboxWidget-cell-placeholder' ).append(
				$( '<div>' )
					.addClass( 'mw-echo-ui-notificationsInboxWidget-main-toolbar-nav-filter' )
					.addClass( 'mw-echo-ui-notificationsInboxWidget-cell' )
					.append( filterStatusButton.$element )
			);
		}

		// This code will currently only be invoked on Special:Notifications
		// The code is bundled here since it makes use of loadModuleScript. This also allows
		// the possibility of invoking the filter from outside the Special page in future.
		// Once the 'ext.echo.special.onInitialize' hook has fired, load notification filter.
		mw.hook( 'ext.echo.special.onInitialize' ).add( function () {
			// The 'ext.echo.special.onInitialize' hook is fired whenever special page notification changes display on click of a filter.
			// Hence the hook is restricted from firing more than once.
			if ( initialized ) {
				return;
			}

			// Load the notification filter overlay
			mw.loader.using( 'mobile.notifications.filter.overlay' ).done( function () {
				var $crossWikiUnreadFilter = $( '.mw-echo-ui-crossWikiUnreadFilterWidget' ),
					$notifReadState = $( '.mw-echo-ui-notificationsInboxWidget-main-toolbar-readState' ),
					NotificationsFilterOverlay = M.require( 'mobile.notifications.filter.overlay/NotificationsFilterOverlay' );

				// setup the filter button (now we have OOjs UI)
				addFilterButton();

				// setup route
				overlayManager.add( /^\/notifications-filter$/, function () {
					mainMenu.openNavigationDrawer( 'secondary' );
					return new NotificationsFilterOverlay( {
						$notifReadState: $notifReadState,
						mainMenu: mainMenu,
						$crossWikiUnreadFilter: $crossWikiUnreadFilter
					} );
				} );
			} );
			initialized = true;
		} );
	} );
}( mw.mobileFrontend, jQuery, mw ) );
