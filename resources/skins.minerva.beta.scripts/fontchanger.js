( function ( M, $ ) {
	var settings = M.require( 'mobile.settings/settings' ),
		userFontSize = settings.get( 'userFontSize', true );

	if ( userFontSize !== '100' ) {
		$( '.content p' ).css( 'font-size', userFontSize + '%' );
	}
}( mw.mobileFrontend, jQuery ) );
