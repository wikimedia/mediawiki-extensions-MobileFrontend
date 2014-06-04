( function( M, $ ) {

	var
		funnel = $.cookie( 'mwUploadsFunnel' ) || 'article',
		LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		user = M.require( 'user' ),
		isSupported = PhotoUploaderButton.isSupported;

	function needsPhoto( $container ) {
		return $container.find( mw.config.get( 'wgMFLeadPhotoUploadCssSelector' ) ).length === 0;
	}

	// reset the funnel cookie as it is no longer valid
	if ( funnel ) {
		$.cookie( 'mwUploadsFunnel', null );
	}

	function initialize() {
		// FIXME: make some general function for that (or a page object with a method)
		var
			// FIXME: not updated on dynamic page loads
			isEditable = mw.config.get( 'wgIsPageEditable' ),
			validNamespace = ( M.inNamespace( '' ) || M.inNamespace( 'user' ) || M.inNamespace( 'file' ) );

		if ( !M.inNamespace( 'file' ) ) {
			if ( !isEditable || !validNamespace ||
				// FIXME: Anonymous users cannot upload but really this should also check rights of user via getRights
				// (without triggering an additional HTTP request)
					user.isAnon() ||
					mw.util.getParamValue( 'action' ) || !needsPhoto( M.getLeadSection() ) || mw.config.get( 'wgIsMainPage' ) ) {
				$( '#ca-upload' ).remove();
			}
		}

		new LeadPhotoUploaderButton( { funnel: funnel } );
	}

	if ( isSupported ) {
		$( initialize );
		M.on( 'page-loaded', function() {
			initialize();
		} );
	}

	M.define( 'modules/uploads/_leadphoto', {
		needsPhoto: needsPhoto
	} );

}( mw.mobileFrontend, jQuery ) );
