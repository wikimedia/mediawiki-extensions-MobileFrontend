( function ( M ) {
	var View = M.require( 'mobile.startup/View' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		notificationIcon = new Icon( { name: 'notifications' } ),
		icons = M.require( 'mobile.startup/icons' );

	/**
	 * A notification button for communicating with an NotificationOverlay
	 * @class NotificationButton
	 * @extends View
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function NotificationBadge( options ) {
		var $el,
			el = options.el;

		if ( el ) {
			$el = $( el );
			options.hasUnseenNotifications = $el.find( '.notification-unseen' ).length;
			options.hasNotifications = options.hasUnseenNotifications;
			options.title = $el.find( 'a' ).attr( 'title' );
			options.url = $el.find( 'a' ).attr( 'href' );
			options.notificationCount = parseInt( $el.find( 'span' ).text(), 10 );
		}
		View.call( this, options );
		this.url = this.$el.find( 'a' ).attr( 'href' );
		this._bindOverlayManager();
	}

	OO.mfExtend( NotificationBadge, View, {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.notificationIconClass e.g. mw-ui-icon for icon
		 * @cfg {String} defaults.loadingIconHtml for spinner
		 * @cfg {Boolean} defaults.hasUnseenNotifications whether the user has unseen notifications
		 * @cfg {Number} defaults.notificationCount number of unread notifications
		 */
		defaults: {
			notificationIconClass: notificationIcon.getClassName(),
			loadingIconHtml: icons.spinner().toHtmlString(),
			hasNotifications: false,
			hasUnseenNotifications: false,
			notificationCount: 0
		},
		/**
		 * @inheritdoc
		 */
		isBorderBox: false,
		/**
		 * Loads a ResourceLoader module script. Shows ajax loader whilst loading.
		 * @method
		 * @private
		 * @param {string} moduleName Name of a module to fetch
		 * @return {jQuery.Deferred}
		 */
		_loadModuleScript: function ( moduleName ) {
			var self = this;

			this.$el.html( this.options.loadingIconHtml );
			return mw.loader.using( moduleName ).done( function () {
				// trigger a re-render once one to remove loading icon
				self.render();
			} );
		},
		/**
		 * Load the notification overlay.
		 * @method
		 * @private
		 * @uses NotificationsOverlay
		 * @return {jQuery.Deferred} with an instance of NotificationsOverlay
		 */
		_loadNotificationOverlay: function () {
			var self = this;

			return this._loadModuleScript( 'mobile.notifications.overlay' ).then( function () {
				var NotificationsOverlay =
					M.require( 'mobile.notifications.overlay/NotificationsOverlay' ); // resource-modules-disable-line
				return new NotificationsOverlay( {
					badge: self
				} );
			} );
		},
		/**
		 * Sets up routes in overlay manager and click behaviour for NotificationBadge
		 * This is not unit tested as it's behaviour is covered by browser tests.
		 * @private
		 */
		_bindOverlayManager: function () {
			var self = this,
				mainMenu = this.options.mainMenu;

			this.$el.on( 'click', $.proxy( this.onClickBadge, this ) );
			this.options.overlayManager.add( /^\/notifications$/, function () {
				return self._loadNotificationOverlay().done( function ( overlay ) {
					mainMenu.openNavigationDrawer( 'secondary' );
					overlay.on( 'hide', function () {
						mainMenu.closeNavigationDrawers();
						$( '#mw-mf-page-center' ).off( '.secondary' );
					} );

					$( '#mw-mf-page-center' ).one( 'click.secondary', function () {
						self.options.router.back();
					} );
				} );
			} );
		},
		/** @inheritdoc */
		template: mw.template.get( 'skins.minerva.notifications.badge', 'badge.hogan' ),
		/**
		 * Click handler for clicking on the badge
		 * @return {Boolean}
		 */
		onClickBadge: function () {
			this.options.router.navigate( '#/notifications' );
			// Important that we also prevent propagation to avoid interference with events that may be
			// binded on #mw-mf-page-center that close overlay
			return false;
		},
		/**
		 * Return the URL for the full non-overlay notification view
		 * @return {String} url
		 */
		getNotificationURL: function () {
			return this.options.url;
		},
		/**
		 * Update the notification count
		 * @param {Number} count
		 */
		setCount: function ( count ) {
			this.options.notificationCount = count;
			this.options.isNotificationCountZero = count === 0;
			this.render();
		},
		/**
		 * Marks all notifications as seen
		 */
		markAsSeen: function () {
			this.options.hasUnseenNotifications = false;
			this.render();
		}
	} );

	M.define( 'skins.minerva.notifications/NotificationBadge', NotificationBadge );
}( mw.mobileFrontend ) );
