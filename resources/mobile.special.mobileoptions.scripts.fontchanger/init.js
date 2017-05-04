( function ( M, $ ) {
	var FontChanger = M.require( 'mobile.fontchanger/FontChanger' );

	$( function () {
		var saveLI = $( '#mw-mf-settings-save' ),
			fontChanger = new FontChanger( {
				name: 'userFontSize',
				enableMsg: mw.msg( 'mobile-frontend-fontchanger-link' ),
				descriptionMsg: mw.msg( 'mobile-frontend-fontchanger-desc' )
			} );

		fontChanger.insertBefore( saveLI );
	} );
}( mw.mobileFrontend, jQuery ) );
