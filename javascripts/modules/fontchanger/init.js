( function ( M, $ ) {
	var settings = M.require( 'settings' ),
		mainmenu = M.require( 'mainmenu' ),
		userFontSize = settings.get( 'userFontSize', true ),
		FontChanger = M.require( 'modules/fontchanger/FontChanger' ),
		size1,
		size2,
		size3;

	// set the user font size if needed
	if ( userFontSize !== '100' ) {
		$( '.content' ).css( 'font-size', userFontSize + '%' );
	}

	// show and add handler to fontchanger link in Special:MobileMenu
	$( '.fontchanger.link' )
		.removeClass( 'hidden' )
		.on( 'click', function () {
			// the different sizes
			var options = {
				size1: size1,
				size2: size2,
				size3: size3
			}, fcDrawer = new FontChanger( options );

			// close the main menu drawer
			mainmenu.closeNavigationDrawers();

			// show the fontchanger drawer
			fcDrawer.show();
		} );
}( mw.mobileFrontend, jQuery ) );
