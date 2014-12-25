( function ( M, $ ) {
	// Run only in alpha mode
	M.assertMode( [ 'alpha' ] );

	var user = M.require( 'user' ),
		editorConfig = mw.config.get( 'wgMFEditorOptions' );

	// Make sure we are not on the Main Page, are in main namespace, and either the user
	// is logged in or anonymous editing is allowed.
	if ( !mw.config.get( 'wgIsMainPage' ) &&
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
				} )
				.fail( function () {
					console.debug( 'mobile.errorReport.overlay failed to load' );
				} );
			return result;
		} );

		// Add 'Report an error' button into page
		$( function () {
			var $errorButton = $( '<a class="mw-ui-button button reportError"></a>' )
				.text( mw.msg( 'mobile-frontend-errorreport-button-label' ) )
				.attr( 'href', '#/error-report' );
			$errorButton.appendTo( $( '#page-secondary-actions' ) );
		} );
	}
}( mw.mobileFrontend, jQuery ) );
