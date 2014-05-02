/* Defines all possible routes in MobileFrontend and where to find the code to provide them. */
( function( M, $ ) {
	var
		LoadingOverlay = M.require( 'LoadingOverlayNew' ),
		lastFile;

	// FIXME: this is hacky but it would be hard to pass a file in a route
	M.on( '_upload-preview', function( file ) {
		lastFile = file;
	} );

	// Upload Tutorial
	M.overlayManager.add( /^\/upload-tutorial\/?(.*)$/, function( funnel ) {
		var
			loadingOverlay = new LoadingOverlay(),
			result = $.Deferred();

		// FIXME: find a generic way of showing loading (make showing a loader
		// part of OverlayManager?)
		loadingOverlay.show();
		mw.loader.using( 'mobile.uploads', function() {
			loadingOverlay.hide();
			var UploadTutorialNew = M.require( 'modules/uploads/UploadTutorial' );
			result.resolve( new UploadTutorialNew( { funnel: funnel || null } ) );
		} );
		return result;
	} );

	// Upload Preview
	M.overlayManager.add( /^\/upload-preview\/?(.*)$/, function( funnel ) {
		var
			loadingOverlay = new LoadingOverlay(),
			result = $.Deferred();

		// FIXME: find a generic way of showing loading (make showing a loader
		// part of OverlayManager?)
		loadingOverlay.show();
		mw.loader.using( 'mobile.uploads', function() {
			loadingOverlay.hide();
			var PhotoUploadOverlay = M.require( 'modules/uploads/PhotoUploadOverlay' );
			result.resolve( new PhotoUploadOverlay( {
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
