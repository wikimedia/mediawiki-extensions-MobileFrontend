( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		Anchor = M.require( 'Anchor' ),
		NotificationsOverlay;

	/**
	 * Overlay for notifications
	 * @class NotificationsOverlay
	 * @extend Overlay
	 * @uses Api
	 */
	NotificationsOverlay = Overlay.extend( {
		className: 'overlay notifications-overlay navigation-drawer',
		templatePartials: {
			content: mw.template.get( 'mobile.notifications.overlay', 'content.hogan' )
		},
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading Heading text.
		 */
		defaults: {
			heading: mw.msg( 'notifications' ),
			footerAnchor: new Anchor( {
				href: mw.util.getUrl( 'Special:Notifications' ),
				progressive: true,
				additionalClassNames: 'footer-link notifications-archive-link',
				label: mw.msg( 'echo-overlay-link' )
			} ).options
		},
		/**
		 * Fall back to notifications archive page.
		 * @method
		 */
		onError: function () {
			window.location.href = this.$badge.attr( 'href' );
		},
		/**
		 * Mark as read. Change the UI only, no API request.
		 * @method
		 */
		markAsRead: function () {
			this.$badge.find( '.notification-count' ).remove();
		},
		/** @inheritdoc */
		initialize: function ( options ) {
			var self = this;
			Overlay.prototype.initialize.apply( this, options );
			// Anchor tag that corresponds to a notifications badge
			this.$badge = options.$badge;
			// On error use the url as a fallback
			if ( options.error ) {
				this.onError();
			} else {
				// FIXME: Move to NotificationApi class
				api.get( {
					action: 'query',
					meta: 'notifications',
					notformat: 'flyout',
					notprop: 'index|list|count',
					uselang: 'user'
				} ).done( function ( result ) {
					var notifications;
					if ( result.query && result.query.notifications ) {
						notifications = $.map( result.query.notifications.list, function ( a ) {
							return {
								message: a['*'],
								timestamp: a.timestamp.mw
							};
						} ).sort( function ( a, b ) {
							return a.timestamp < b.timestamp ? 1 : -1;
						} );
						if ( notifications.length ) {
							options.notifications = notifications;
						} else {
							options.errorMessage = mw.msg( 'echo-none' );
						}

						self.render( options );
						self.$( '.mw-echo-notification' ).each( function () {
							var $notification = $( this ),
								$primaryLink = $notification.find( '.mw-echo-notification-primary-link' );
							// If there is a primary link, make the entire notification clickable.
							if ( $primaryLink.length ) {
								$notification.addClass( 'mw-echo-linked-notification' );
								$notification.on( 'click', function () {
									window.location.href = $primaryLink.attr( 'href' );
								} );
							}
							// Set up event logging for each notification
							mw.echo.setupNotificationLogging( $notification, 'mobile-overlay', true );
						} );
						// Only fire 'mark as read' API call when unread notification
						// count is not zero.  Question: why does this fire an API call
						// for 'mark all as read', the overlay may not load all unread
						// notifications
						if ( result.query.notifications.rawcount !== 0 ) {
							self.markAllAsRead();
						}
					} else {
						self.onError();
					}
				} ).fail( function () {
					self.onError();
				} );
			}
		},
		/**
		 * Mark notifications as read in the server. Make an API request.
		 * @method
		 */
		markAllAsRead: function () {
			// FIXME: Move to NotificationApi class
			api.postWithToken( 'edit', {
				action: 'echomarkread',
				all: true
			} );
		},
		/** @inheritdoc */
		preRender: function () {
			this.options.heading = '<strong>' + mw.msg( 'notifications' ) + '</strong>';
		},
		/** @inheritdoc */
		postRender: function () {
			Overlay.prototype.postRender.apply( this );

			if ( this.options.notifications || this.options.errorMessage ) {
				this.$( '.loading' ).remove();
				// Reset the badge
				this.markAsRead();
			}
		}
	} );

	M.define( 'modules/notifications/NotificationsOverlay', NotificationsOverlay );

}( mw.mobileFrontend, jQuery ) );
