( function ( M, $ ) {
	var Overlay = M.require( 'mobile.overlays/Overlay' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		NotificationsOverlay;

	/**
	 * Overlay for notifications
	 * @class NotificationsOverlay
	 * @extend Overlay
	 * @uses mw.Api
	 */
	NotificationsOverlay = function ( options ) {
		var modelManager, unreadCounter, controller, wrapperWidget,
			maxNotificationCount = mw.config.get( 'wgEchoMaxNotificationCount' ),
			echoApi = new mw.echo.api.EchoApi();

		Overlay.apply( this, options );

		// Anchor tag that corresponds to a notifications badge
		this.$badge = options.$badge;
		this.$overlay = $( '<div>' )
			.addClass( 'notifications-overlay-overlay position-fixed' );

		// On error use the url as a fallback
		if ( options.error ) {
			this.onError();
			return;
		}

		unreadCounter = new mw.echo.dm.UnreadNotificationCounter( echoApi, 'all', maxNotificationCount );
		modelManager = new mw.echo.dm.ModelManager( unreadCounter, { type: [ 'message', 'alert' ] } );
		controller = new mw.echo.Controller(
			echoApi,
			modelManager,
			{
				type: [ 'message', 'alert' ]
			}
		);

		wrapperWidget = new mw.echo.ui.NotificationsWrapper( controller, modelManager, {
			$overlay: this.$overlay
		} );

		// Events
		unreadCounter.connect( this, {
			countChange: 'onUnreadCountChange'
		} );

		// Initialize
		this.$( '.overlay-content' ).append(
			wrapperWidget.$element,
			this.$overlay
		);

		// Populate notifications
		wrapperWidget.populate()
			.then( controller.updateLocalSeenTime.bind( controller ) );
	};

	OO.mfExtend( NotificationsOverlay, Overlay, {
		className: 'overlay notifications-overlay navigation-drawer',
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading Heading text.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'notifications' ),
			footerAnchor: new Anchor( {
				href: mw.util.getUrl( 'Special:Notifications' ),
				progressive: true,
				additionalClassNames: 'footer-link notifications-archive-link',
				label: mw.msg( 'echo-overlay-link' )
			} ).options
		} ),
		/**
		 * Fall back to notifications archive page.
		 * @method
		 */
		onError: function () {
			window.location.href = this.$badge.attr( 'href' );
		},
		/**
		 * Update the unread number on the notifications badge
		 *
		 * @param {Number} count Number of unread notifications
		 * @method
		 */
		onUnreadCountChange: function ( count ) {
			var $badgeCounter = this.$badge.find( '.notification-count' );
			if ( count > 0 ) {
				$badgeCounter.text( count ).show();
			} else {
				$badgeCounter.hide();
			}
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

	M.define( 'mobile.notifications.overlay/NotificationsOverlay', NotificationsOverlay );

}( mw.mobileFrontend, jQuery ) );
