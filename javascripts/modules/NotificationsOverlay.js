( function( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		NotificationsOverlay;

	NotificationsOverlay = Overlay.extend( {
			active: false,
			className: 'mw-mf-overlay list-overlay',
			template: M.template.get( 'overlays/notifications' ),
			defaults: {
				heading: mw.msg( 'notifications' ),
				archiveLink: mw.util.wikiGetlink( 'Special:Notifications' ),
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
							} );
						} else {
							self.onError();
						}

						// Add the notifications to the overlay
						if ( notifications.length ) {
							options.notifications = notifications.reverse();
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
							mw.loader.using( 'ext.echo.base', function() {
								mw.echo.setupNotificationLogging( $notification, 'mobile-overlay' );
							} );
						} );

						self.markAllAsRead();
					} ).fail( function () {
						self.onError();
					} );
				}
			},
			markAllAsRead: function() {
				api.getToken( 'edit' ).done( function( token ) {
					api.post( {
						action : 'echomarkread',
						all : true,
						token : token
					} );
				} );
			},
			postRender: function( options ) {
				this._super( options );
				if ( options.notifications || options.errorMessage ) {
					this.$( '.loading' ).remove();
					// Reset the badge
					this.updateCount( 0 );
				}
			}
	} );

	function init() {
		$( '#secondary-button.user-button' ).on( 'click', function( ev ) {
			ev.preventDefault();
			new NotificationsOverlay( { $badge: $( this ) } ).show();
		} );
	}
	init();

}( mw.mobileFrontend, jQuery ) );
