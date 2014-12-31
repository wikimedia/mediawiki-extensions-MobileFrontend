( function ( M, $ ) {
	// Run only in alpha mode
	M.assertMode( [ 'alpha' ] );

	var user = M.require( 'user' ),
		page = M.getCurrentPage(),
		editorConfig = mw.config.get( 'wgMFEditorOptions' );

	// Make sure we are not on the Main Page, are in main namespace, and either the user
	// is logged in or anonymous editing is allowed.
	if ( !page.isMainPage() &&
		// FIXME: Use Page object.
		mw.config.get( 'wgNamespaceNumber' ) === 0 &&
		( !user.isAnon() || editorConfig.anonymousEditing )
	) {

		// Make overlayManager handle URL for 'Report an error' button
		M.overlayManager.add( /^\/error-report$/, function () {
			var result = $.Deferred();
			M.loadModule( 'mobile.errorReport.overlay', true )
				.done( function ( loadingOverlay ) {
					var ErrorReportOverlay = M.require( 'errorReport/ErrorReportOverlay' );
					loadingOverlay.hide();
					result.resolve( new ErrorReportOverlay() );
				} );
				// FIXME: Use event logging on fail event
			return result;
		} );

		// Add 'Report an error' button into page
		$( function () {
			var $errorButton = $( '<a class="mw-ui-button button reportError">' )
				.text( mw.msg( 'mobile-frontend-errorreport-button-label' ) )
				.attr( 'href', '#/error-report' );
			$errorButton.appendTo( $( '#page-secondary-actions' ) );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
