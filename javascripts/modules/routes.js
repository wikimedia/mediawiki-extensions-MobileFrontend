/* Defines all possible routes in MobileFrontend and where to find the code to provide them. */
( function ( M, $ ) {
	var lastFile,
		overlayManager = M.require( 'overlayManager' ),
		loader = M.require( 'loader' );

	// FIXME: this is hacky but it would be hard to pass a file in a route
	M.on( '_upload-preview', function ( file ) {
		lastFile = file;
	} );

	// Upload Tutorial
	overlayManager.add( /^\/upload-tutorial\/?(.*)$/, function ( funnel ) {
		var result = $.Deferred();
		loader.loadModule( 'mobile.uploads' ).done( function () {
			var UploadTutorialNew = M.require( 'modules/uploads/UploadTutorial' );
			result.resolve( new UploadTutorialNew( {
				funnel: funnel || null
			} ) );
		} );
		return result;
	} );

	// Upload Preview
	overlayManager.add( /^\/upload-preview\/?(.*)$/, function ( funnel ) {
		var result = $.Deferred();
		loader.loadModule( 'mobile.uploads' ).done( function () {
			var PhotoUploadOverlay = M.require( 'modules/uploads/PhotoUploadOverlay' );
			result.resolve( new PhotoUploadOverlay( {
				page: M.getCurrentPage(),
				// FIXME: Remove this and use page option instead
				pageTitle: mw.config.get( 'wgTitle' ),
				file: lastFile,
				funnel: funnel,
				// When the funnel is uploads you are on Special:Uploads
				insertInPage: funnel === 'uploads' ? false : true
			} ) );
		} );
		return result;
	} );

} )( mw.mobileFrontend, jQuery );
