var Overlay = require( '../mobile.startup/Overlay' ),
	util = require( '../mobile.startup/util' ),
	View = require( '../mobile.startup/View' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Anchor = require( '../mobile.startup/Anchor' ),
	NotificationsOverlay;

/**
 * Overlay for notifications
 * @class NotificationsOverlay
 * @extend Overlay
 * @uses mw.Api
 *
 * @param {Object} params Configuration options
 */
NotificationsOverlay = function ( params ) {
	var modelManager, unreadCounter, wrapperWidget,
		self = this,
		markAllReadButton = new OO.ui.ButtonWidget( {
			icon: 'checkAll',
			title: mw.msg( 'echo-mark-all-as-read' )
		} ),
		options = util.extend( {}, {
			heading: '<strong>' + mw.message( 'notifications' ).escaped() + '</strong>',
			footerAnchor: new Anchor( {
				href: mw.util.getUrl( 'Special:Notifications' ),
				progressive: true,
				additionalClassNames: 'footer-link notifications-archive-link',
				label: mw.msg( 'echo-overlay-link' )
			} ).options,
			headerActions: [
				View.make(
					{ class: 'notifications-overlay-header-markAllRead' },
					[ markAllReadButton.$element ]
				)
			],
			isBorderBox: false,
			className: 'overlay notifications-overlay navigation-drawer'
		}, params ),
		maxNotificationCount = mw.config.get( 'wgEchoMaxNotificationCount' ),
		echoApi = new mw.echo.api.EchoApi();

	Overlay.call( this, options );

	// Anchor tag that corresponds to a notifications badge
	this.badge = options.badge;
	this.$overlay = this.parseHTML( '<div>' )
		.addClass( 'notifications-overlay-overlay position-fixed' );

	// On error use the url as a fallback
	if ( options.error ) {
		options.onError();
		return;
	}

	mw.echo.config.maxPrioritizedActions = 1;

	this.doneLoading = false;

	unreadCounter = new mw.echo.dm.UnreadNotificationCounter( echoApi, 'all', maxNotificationCount );
	modelManager = new mw.echo.dm.ModelManager( unreadCounter, { type: [ 'message', 'alert' ] } );
	this.controller = new mw.echo.Controller(
		echoApi,
		modelManager,
		{
			type: [ 'message', 'alert' ]
		}
	);

	wrapperWidget = new mw.echo.ui.NotificationsWrapper( this.controller, modelManager, {
		$overlay: this.$overlay
	} );

	// Mark all read
	this.markAllReadButton = markAllReadButton;
	markAllReadButton.toggle( false );

	// TODO: We should be using 'toast' (which uses mw.notify)
	// when this bug is fixed: https://phabricator.wikimedia.org/T143837
	this.confirmationWidget = new mw.echo.ui.ConfirmationPopupWidget();
	this.$overlay.append( this.confirmationWidget.$element );

	// Events
	unreadCounter.connect( this, {
		countChange: 'onUnreadCountChange'
	} );
	modelManager.connect( this, {
		update: 'checkShowMarkAllRead'
	} );
	this.markAllReadButton.connect( this, {
		click: 'onMarkAllReadButtonClick'
	} );

	// Initialize
	this.$el.find( '.overlay-content' ).append(
		wrapperWidget.$element,
		this.$overlay
	);

	// Populate notifications
	wrapperWidget.populate().then( function () {
		self.setDoneLoading();
		self.controller.updateSeenTime();
		self.badge.markAsSeen();
		self.checkShowMarkAllRead();
	} );
};

mfExtend( NotificationsOverlay, Overlay, {
	/**
	 * Set done loading flag for notifications list
	 * @memberof NotificationsOverlay
	 * @instance
	 */
	setDoneLoading: function () {
		this.doneLoading = true;
	},
	/**
	 * Check if notifications have finished loading
	 * @memberof NotificationsOverlay
	 * @instance
	 * @return {boolean} Notifications list has finished loading
	 */
	isDoneLoading: function () {
		return this.doneLoading;
	},
	/**
	 * Toggle mark all read button
	 * @memberof NotificationsOverlay
	 * @instance
	 */
	checkShowMarkAllRead: function () {
		this.markAllReadButton.toggle(
			this.isDoneLoading() &&
			this.controller.manager.hasLocalUnread()
		);
	},
	/**
	 * Respond to mark all read button click
	 * @memberof NotificationsOverlay
	 * @instance
	 */
	onMarkAllReadButtonClick: function () {
		var overlay = this,
			numNotifications = this.controller.manager.getLocalUnread().length;

		this.controller.markLocalNotificationsRead()
			.then( function () {
				overlay.confirmationWidget.setLabel(
					mw.msg( 'echo-mark-all-as-read-confirmation', numNotifications )
				);
				overlay.confirmationWidget.showAnimated();
			} );
	},
	/**
	 * Update the unread number on the notifications badge
	 * @memberof NotificationsOverlay
	 * @instance
	 * @param {number} count Number of unread notifications
	 */
	onUnreadCountChange: function ( count ) {
		this.badge.setCount(
			this.controller.manager.getUnreadCounter().getCappedNotificationCount( count )
		);

		this.checkShowMarkAllRead();
	},
	/**
	 * @inheritdoc
	 * @memberof NotificationsOverlay
	 * @instance
	 */
	postRender: function () {
		Overlay.prototype.postRender.apply( this );

		if ( this.options.notifications || this.options.errorMessage ) {
			this.$el.find( '.loading' ).remove();
		}
	}
} );

module.exports = NotificationsOverlay;
