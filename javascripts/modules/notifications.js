( function( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		NotificationsOverlay;

	NotificationsOverlay = Overlay.extend( {
			active: false,
			className: 'mw-mf-overlay list-overlay',
			template: M.template.get( 'overlays/notifications' ),
			defaults: {
				heading: mw.msg( 'notifications' )
			},
			_error: function() {
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
					this._error();
				} else {
					api.get( {
						action : 'query',
						meta : 'notifications',
						notformat : 'flyout',
						notallunread : true,
						notprop : 'index|list|count'
					} ).done( function ( result ) {
						var notifications;
						if ( result.query && result.query.notifications ) {
							notifications = $.map( result.query.notifications.list, function( a ) {
								return { message: a['*'], timestamp: a.timestamp.mw };
							} ).sort( function( a, b ) {
								// make sure newer notifications are at the top
								return a.timestamp < b.timestamp;
							} );
						} else {
							this._error();
						}

						// Add the notifications to the overlay
						if ( notifications.length ) {
							options.notifications = notifications;
						} else {
							options.errorMessage = mw.msg( 'echo-none' );
						}
						self.render( options );
						self.markAllAsRead();
					} ).fail( function () {
						self._error();
					} );
				}
			},
			markAllAsRead: function() {
				api.post( {
					action: 'query',
					meta: 'notifications',
					notmarkallread : true
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
		$( '#user-button' ).on( 'click', function( ev ) {
			ev.preventDefault();
			new NotificationsOverlay( { $badge: $( this ) } ).show();
		} );
	}
	init();

}( mw.mobileFrontend, jQuery ) );
