( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		NotificationsOverlay;

	/**
	 * Overlay for notifications
	 * @class NotificationsOverlay
	 * @extend Overlay
	 */
	NotificationsOverlay = Overlay.extend( {
		active: false,
		className: 'overlay notifications-overlay navigation-drawer',
		templatePartials: {
			content: mw.template.get( 'mobile.notifications.overlay', 'content.hogan' ),
			footer: mw.template.get( 'mobile.overlays', 'OverlayFooterLink.hogan' )
		},
		defaults: {
			heading: mw.msg( 'notifications' ),
			link: mw.util.getUrl( 'Special:Notifications' ),
			linkMsg: mw.msg( 'echo-overlay-link' ),
			linkClass: 'notifications-archive-link'
		},
		onError: function () {
			// Fall back to notifications archive page.
			window.location.href = this.$badge.attr( 'href' );
		},
		markAsRead: function () {
			this.$badge.find( 'span' ).remove();
		},
		initialize: function ( options ) {
			var self = this;
			Overlay.prototype.initialize.apply( this, options );
			// Anchor tag that corresponds to a notifications badge
			this.$badge = options.$badge;
			// On error use the url as a fallback
			if ( options.error ) {
				this.onError();
			} else {
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
		markAllAsRead: function () {
			api.getTokenWithEndpoint( 'edit' ).done( function ( token ) {
				api.post( {
					action: 'echomarkread',
					all: true,
					token: token
				} );
			} );
		},
		preRender: function ( options ) {
			options.heading = '<strong>' + mw.msg( 'notifications' ) + '</strong>';
		},
		postRender: function ( options ) {
			Overlay.prototype.postRender.apply( this, options );

			if ( options.notifications || options.errorMessage ) {
				this.$( '.loading' ).remove();
				// Reset the badge
				this.markAsRead();
			}
		}
	} );

	M.define( 'modules/notifications/NotificationsOverlay', NotificationsOverlay );

}( mw.mobileFrontend, jQuery ) );
