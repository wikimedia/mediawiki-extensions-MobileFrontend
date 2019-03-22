var Overlay = require( '../Overlay' ),
	m = require( '../moduleLoaderSingleton' ),
	promisedView = require( '../promisedView' ),
	View = require( '../View' ),
	Anchor = require( '../Anchor' );

/**
 * This callback is displayed as a global member.
 * @callback countChangeCallback
 * @param {number} count a capped (0-99 or 99+) count
 */

/**
 * Make a notification overlay
 *
 * @param {countChangeCallback} onCountChange receives one parameter - a capped (0-99 or 99+) count.
 * @param {Function} onNotificationListRendered a function that is called when the
 *   notifications list has fully rendered (taking no arguments)
 * @return {Overlay}
 */
function notificationsOverlay( onCountChange, onNotificationListRendered ) {
	var markAllReadButton,
		oouiPromise = mw.loader.using( 'mobile.notifications.overlay' ).then( function () {
			markAllReadButton = new OO.ui.ButtonWidget( {
				icon: 'checkAll',
				title: mw.msg( 'echo-mark-all-as-read' )
			} );
			return View.make(
				{ class: 'notifications-overlay-header-markAllRead' },
				[ markAllReadButton.$element ]
			);
		} ),
		markAllReadButtonView = promisedView( oouiPromise );
	// hide the button spinner as it is confusing to see in the top right corner
	markAllReadButtonView.$el.hide();

	return Overlay.make(
		{
			heading: '<strong>' + mw.message( 'notifications' ).escaped() + '</strong>',
			footerAnchor: new Anchor( {
				href: mw.util.getUrl( 'Special:Notifications' ),
				progressive: true,
				additionalClassNames: 'footer-link notifications-archive-link',
				label: mw.msg( 'echo-overlay-link' )
			} ).options,
			headerActions: [ markAllReadButtonView ],
			isBorderBox: false,
			className: 'overlay notifications-overlay navigation-drawer'
		},
		promisedView(
			oouiPromise.then( function () {
				var list = m.require( 'mobile.notifications.overlay' ).list;
				return list( mw.echo, markAllReadButton, onCountChange,
					onNotificationListRendered );
			} )
		)
	);
}

module.exports = notificationsOverlay;
