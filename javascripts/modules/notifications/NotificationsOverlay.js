( function( M, $ ) {
	var Overlay = M.require( 'OverlayNew' ),
		MAXIMUM_NOTIFICATIONS = 99,
		api = M.require( 'api' ),
		NotificationsOverlay;

	/**
	 * @class NotificationsOverlay
	 * @extend OverlayNew
	 */
	NotificationsOverlay = Overlay.extend( {
			active: false,
			className: 'overlay notifications-overlay border-box',
			templatePartials: {
				content: M.template.get( 'modules/notifications/NotificationsOverlay' )
			},
			defaults: {
				heading: mw.msg( 'notifications' ),
				archiveLink: mw.util.getUrl( 'Special:Notifications' ),
				archiveLinkMsg: mw.msg( 'echo-overlay-link' )
			},
			onError: function() {
				// Fall back to notifications archive page.
				window.location.href = this.$badge.attr( 'href' );
			},
			updateCount: function ( newCount ) {
				var $count = this.$badge.find( 'span' );
				$count.text( newCount );
				if ( newCount === 0 ) {
					$count.addClass( 'zero' );
				} else {
					$count.removeClass( 'zero' );
				}
			},
			initialize: function( options ) {
				var self = this;
				this._super( options );
				// Anchor tag that corresponds to a notifications badge
				this.$badge = options.$badge;
				// On error use the url as a fallback
				if ( options.error ) {
					this.onError();
				} else {
					api.get( {
						action : 'query',
						meta : 'notifications',
						notformat : 'flyout',
						notprop : 'index|list|count'
					} ).done( function ( result ) {
						var notifications;
						if ( result.query && result.query.notifications ) {
							notifications = $.map( result.query.notifications.list, function( a ) {
								return { message: a['*'], timestamp: a.timestamp.mw };
							} ).sort( function( a, b ) {
								return a.timestamp < b.timestamp ? 1 : -1;
							} );
							if ( notifications.length ) {
								options.notifications = notifications;
							} else {
								options.errorMessage = mw.msg( 'echo-none' );
							}

							self.render( options );
							self.$( '.mw-echo-notification' ).each( function() {
								var $notification = $( this ),
									$primaryLink = $notification.find( '.mw-echo-notification-primary-link' );
								// If there is a primary link, make the entire notification clickable.
								if ( $primaryLink.length ) {
									$notification.addClass( 'mw-echo-linked-notification' );
									$notification.on( 'click', function() {
										window.location.href = $primaryLink.attr( 'href' );
									} );
								}
								// Set up event logging for each notification
								mw.echo.setupNotificationLogging( $notification, 'mobile-overlay', true );
							} );

							self.markAllAsRead();
						} else {
							self.onError();
						}
					} ).fail( function () {
						self.onError();
					} );
				}
			},
			markAllAsRead: function() {
				api.getTokenWithEndpoint( 'edit' ).done( function( token ) {
					api.post( {
						action : 'echomarkread',
						all : true,
						token : token
					} );
				} );
			},
			preRender: function( options ) {
				var heading = '<strong>' + mw.msg( 'notifications' ) + '</strong>';
				if ( !M.isBetaGroupMember() ) {
					heading += '<span>' + options.count + '</span>';
				}
				options.heading = heading;
			},
			postRender: function( options ) {
				var $badge, className, badgeText;
				this._super( options );
				if ( M.isBetaGroupMember() ) {
					if ( options.count >= MAXIMUM_NOTIFICATIONS ) {
						className = 'max';
						badgeText = mw.msg( 'echo-notification-count', MAXIMUM_NOTIFICATIONS );
					} else {
						badgeText = options.count;
						className = options.count ? '' : 'zero';
					}

					// FIXME: Move this code to template when moved from beta to stable
					$badge = $( '<a href="#" class="user-button">' ).appendTo( this.$el );
					$( '<span>' ).addClass( className ).text( badgeText ).appendTo( $badge );
				}

				if ( options.notifications || options.errorMessage ) {
					this.$( '.loading' ).remove();
					// Reset the badge
					this.updateCount( 0 );
				}
			}
	} );

	M.define( 'modules/notifications/NotificationsOverlay', NotificationsOverlay );

}( mw.mobileFrontend, jQuery ) );
