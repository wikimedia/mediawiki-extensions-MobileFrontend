( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var OverlayNew = M.require( 'OverlayNew' ),
		prototype = M.require( 'modules/notifications/prototype' ),
		NotificationsOverlayNew;

	NotificationsOverlayNew = OverlayNew.extend( prototype );
	NotificationsOverlayNew = NotificationsOverlayNew.extend( {
		closeOnBack: true
	} );

	M.define( 'modules/notifications/NotificationsOverlayNew', NotificationsOverlayNew );

}( mw.mobileFrontend ) );
