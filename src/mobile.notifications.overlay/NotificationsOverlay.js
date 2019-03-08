var Overlay = require( '../mobile.startup/Overlay' ),
	util = require( '../mobile.startup/util' ),
	View = require( '../mobile.startup/View' ),
	promisedView = require( '../mobile.startup/promisedView' ),
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
	var wrapperWidget,
		maxNotificationCount = mw.config.get( 'wgEchoMaxNotificationCount' ),
		echoApi = new mw.echo.api.EchoApi(),
		unreadCounter = new mw.echo.dm.UnreadNotificationCounter( echoApi, 'all', maxNotificationCount ),
		markAllReadButton = new OO.ui.ButtonWidget( {
			icon: 'checkAll',
			title: mw.msg( 'echo-mark-all-as-read' )
		} ),
		modelManager = new mw.echo.dm.ModelManager( unreadCounter, { type: [ 'message', 'alert' ] } ),
		controller = new mw.echo.Controller(
			echoApi,
			modelManager,
			{
				type: [ 'message', 'alert' ]
			}
		),
		markAsReadHandler = function () {
			markAllReadButton.toggle(
				controller.manager.hasLocalUnread()
			);
		},
		// Create a container which will be revealed when "more options" (...)
		// is clicked on a notification. Hidden by default.
		$moreOptions = util.parseHTML( '<div>' )
			.addClass( 'notifications-overlay-overlay position-fixed' ),
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
		// Anchor tag that corresponds to a notifications badge
		badge = options.badge,
		onCountChange = function ( cappedCount ) {
			badge.setCount( cappedCount );
		},
		onNotificationListRendered = function () {
			badge.markAsSeen();
		};

	Overlay.call( this, options );

	// On error use the url as a fallback
	if ( options.error ) {
		options.onError();
		return;
	}

	mw.echo.config.maxPrioritizedActions = 1;

	wrapperWidget = new mw.echo.ui.NotificationsWrapper( controller, modelManager, {
		$overlay: $moreOptions
	} );

	// Mark all read
	markAllReadButton.toggle( false );

	// Events
	unreadCounter.on( 'countChange', function ( count ) {
		onCountChange(
			controller.manager.getUnreadCounter().getCappedNotificationCount( count )
		);
		markAsReadHandler();
	} );
	markAllReadButton.on( 'click', function () {
		var numNotifications = controller.manager.getLocalUnread().length;

		controller.markLocalNotificationsRead()
			.then( function () {
				mw.notify( mw.msg( 'echo-mark-all-as-read-confirmation', numNotifications ) );
				markAllReadButton.toggle( false );
			}, function () {
				markAllReadButton.toggle( false );
			} );
	} );

	// Initialize
	this.$el.find( '.overlay-content' ).append(
		promisedView(
			// Populate notifications
			wrapperWidget.populate().then( function () {
				controller.updateSeenTime();
				onNotificationListRendered();
				markAsReadHandler();
				// Connect event here as we know that everything loaded correctly
				modelManager.on( 'update', markAsReadHandler );
				return View.make( {}, [ wrapperWidget.$element, $moreOptions ] );
			} )
		).$el
	);
};

// The third parameter is essential. If not defined, per mfExtend,
// prototype will not be copied across.
mfExtend( NotificationsOverlay, Overlay, {} );

module.exports = NotificationsOverlay;
