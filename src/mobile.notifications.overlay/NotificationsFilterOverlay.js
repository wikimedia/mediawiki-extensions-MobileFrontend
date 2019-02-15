var Overlay = require( '../mobile.startup/Overlay' ),
	util = require( '../mobile.startup/util' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	NotificationsFilterOverlay;

/**
 * Overlay for notifications filter
 *
 * @class NotificationsFilterOverlay
 * @extends Overlay
 * @param {Object} options
 * @param {jQuery.Object} options.$notifReadState - notification read status widgets
 * @param {jQuery.Object} options.$crossWikiUnreadFilter - notification unread filter
 *
 */
NotificationsFilterOverlay = function ( options ) {
	var self = this;

	Overlay.call(
		this,
		util.extend( {
			// FIXME: notification-overlay class to be generalized
			className: 'overlay notifications-filter-overlay notifications-overlay navigation-drawer'
		}, options )
	);

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

	this.$el.find( '.overlay-content' ).append(
		this.parseHTML( '<div>' )
			.addClass( 'notifications-filter-overlay-read-state' )
			.append( options.$notifReadState ),
		options.$crossWikiUnreadFilter
	);
};

mfExtend( NotificationsFilterOverlay, Overlay, {
	/**
	 * @memberof NotificationsFilterOverlay
	 * @instance
	 * @mixes Overlay#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.heading Heading text.
	 */
	defaults: util.extend( {}, Overlay.prototype.defaults, {
		heading: mw.msg( 'mobile-frontend-notifications-filter-title' )
	} ),

	/**
	 * @inheritdoc
	 * @memberof NotificationsFilterOverlay
	 * @instance
	 */
	preRender: function () {
		this.options.heading = '<strong>' + mw.message( 'mobile-frontend-notifications-filter-title' ).escaped() + '</strong>';
	}
} );

module.exports = NotificationsFilterOverlay;
