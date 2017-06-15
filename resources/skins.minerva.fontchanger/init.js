( function ( M, $ ) {
	var userFontSize = mw.storage.get( 'userFontSize' );

	if ( userFontSize !== '100' ) {
		$( '.content p' ).css( 'font-size', userFontSize + '%' );
	}
}( mw.mobileFrontend, jQuery ) );
