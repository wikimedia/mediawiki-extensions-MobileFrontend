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
		$( 'form.mw-mf-settings' ).on( 'submit', fontChanger.save.bind( fontChanger ) );
	} );
}( mw.mobileFrontend, jQuery ) );
