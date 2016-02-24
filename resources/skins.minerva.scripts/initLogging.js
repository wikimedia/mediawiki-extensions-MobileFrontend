// This initialises EventLogging for main menu and some prominent links in the UI.
// This code should only be loaded on the Minerva skin, it does not apply to other skins.
( function ( M, $ ) {
	var SchemaMobileWebClickTracking = M.require(
			'mobile.loggingSchemas/SchemaMobileWebClickTracking' ),
		skin = M.require( 'skins.minerva.scripts/skin' ),
		mainMenuSchema = new SchemaMobileWebClickTracking( {}, 'MobileWebMainMenuClickTracking' );

	$( function () {
		skin.getMainMenu().enableLogging( mainMenuSchema );
	} );
} )( mw.mobileFrontend, jQuery );
