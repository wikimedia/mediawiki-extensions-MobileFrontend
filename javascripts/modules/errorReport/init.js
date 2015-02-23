( function ( M, $ ) {
	// Run only in alpha mode
	M.require( 'context' ).assertMode( [ 'alpha' ] );

	var user = M.require( 'user' ),
		router = M.require( 'router' ),
		page = M.getCurrentPage(),
		loader = M.require( 'loader' ),
		overlayManager = M.require( 'overlayManager' ),
		editorConfig = mw.config.get( 'wgMFEditorOptions' ),
		ButtonWithSpinner = M.require( 'ButtonWithSpinner' ),
		errorButton;

	// Make sure we are not on the Main Page, are in main namespace, and either the user
	// is logged in or anonymous editing is allowed.
	if ( !page.isMainPage() &&
		// FIXME: Use Page object.
		mw.config.get( 'wgNamespaceNumber' ) === 0 &&
		( !user.isAnon() || editorConfig.anonymousEditing )
	) {

		// Make overlayManager handle URL for 'Report an error' button
		overlayManager.add( /^\/error-report$/, function () {
			var result = $.Deferred();
			loader.loadModule( 'mobile.errorReport.overlay', true, false )
				.done( function () {
					var ErrorReportOverlay = M.require( 'errorReport/ErrorReportOverlay' );
					result.resolve( new ErrorReportOverlay() );
					errorButton.hideSpinner();
				} );
				// FIXME: Use event logging on fail event
			return result;
		} );

		// Add 'Report an error' button into page
		$( function () {
			errorButton = new ButtonWithSpinner( {
				label: mw.msg( 'mobile-frontend-errorreport-button-label' )
			} );
			errorButton.on( 'click', function () {
				errorButton.showSpinner();
				router.navigate( '#/error-report' );
			} );
			$( '#page-secondary-actions' ).append( errorButton.$element );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
