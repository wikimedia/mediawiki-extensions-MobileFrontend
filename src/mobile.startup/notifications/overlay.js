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

	const overlay = Overlay.make(
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
			className: 'overlay notifications-overlay navigation-drawer',
			onBeforeExit: ( exit ) => onBeforeExit( overlay, exit )
		},
		promisedView(
			oouiPromise.then( function () {
				const module = m.require( 'mobile.notifications.overlay' ),
					list = module.list;
				return list( module.echo(), markAllReadButton, onCountChange,
					onNotificationListRendered );
			} )
		)
	);
	return overlay;
}

/**
 * @param {Overlay} overlay
 * @param {Function} exit
 * @return {void}
 */
function onBeforeExit( overlay, exit ) {
	if ( 'transition' in overlay.$el[0].style ) {
		// Manually detach the overlay from DOM once hide animation completes.
		overlay.$el[0].addEventListener( 'transitionend', exit, { once: true } );

		// Kick off animation.
		overlay.$el[0].classList.remove( 'visible' );
	} else {
		exit();
	}
}

notificationsOverlay.test = { onBeforeExit };
module.exports = notificationsOverlay;
