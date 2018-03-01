( function ( M ) {
	var Overlay = M.require( 'mobile.startup/Overlay' ),
		util = M.require( 'mobile.startup/util' ),
		NotificationsFilterOverlay;

	/**
	 * Overlay for notifications filter
	 *
	 * @class NotificationsFilterOverlay
	 * @extend Overlay
	 * @param {Object} options
	 * @param {jQuery.Object} options.$notifReadState - notification read status widgets
	 * @param {jQuery.Object} options.$crossWikiUnreadFilter - notification unread filter
	 *
	 */
	NotificationsFilterOverlay = function ( options ) {
		var self = this;
		Overlay.apply( this, options );

		// Initialize
		this.on( 'hide', function () {
			options.mainMenu.closeNavigationDrawers();
		} );
		options.$crossWikiUnreadFilter.on( 'click', function () {
			self.hide();
		} );

		options.$notifReadState.find( '.oo-ui-buttonElement' ).on( 'click', function () {
			self.hide();
		} );

		this.$( '.overlay-content' ).append(
			this.parseHTML( '<div>' )
				.addClass( 'notifications-filter-overlay-read-state' )
				.append( options.$notifReadState ),
			options.$crossWikiUnreadFilter
		);
	};

	OO.mfExtend( NotificationsFilterOverlay, Overlay, {
		// FIXME: notification-overlay class to be generalized
		className: 'overlay notifications-filter-overlay notifications-overlay navigation-drawer',
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading Heading text.
		 */
		defaults: util.extend( {}, Overlay.prototype.defaults, {
			heading: mw.msg( 'mobile-frontend-notifications-filter-title' )
		} ),

		/** @inheritdoc */
		preRender: function () {
			this.options.heading = '<strong>' + mw.message( 'mobile-frontend-notifications-filter-title' ).escaped() + '</strong>';
		}
	} );

	M.define( 'mobile.notifications.filter.overlay/NotificationsFilterOverlay', NotificationsFilterOverlay );

}( mw.mobileFrontend ) );
