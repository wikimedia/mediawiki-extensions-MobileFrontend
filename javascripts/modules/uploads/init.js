( function ( M, $ ) {

	var
		funnel = $.cookie( 'mwUploadsFunnel' ) || 'article',
		LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		user = M.require( 'user' ),
		skin = M.require( 'skin' ),
		isSupported = LeadPhotoUploaderButton.isSupported;

	/**
	 * Checks whether there is no suitable image in the container.
	 * Judges this based on selector in wgMFLeadPhotoUploadCssSelector
	 *
	 * @param {jQuery.Object} $container
	 * @return {Boolean}
	 * @ignore
	 */
	function needsPhoto( $container ) {
		return $container.find( mw.config.get( 'wgMFLeadPhotoUploadCssSelector' ) ).length === 0;
	}

	// reset the funnel cookie as it is no longer valid
	if ( funnel ) {
		$.cookie( 'mwUploadsFunnel', null );
	}

	/**
	 * Initialise interface would uploading an image to the top of the current page.
	 *
	 * @ignore
	 */
	function initialize() {
		var
			page = M.getCurrentPage(),
			$lead = page.getLeadSectionElement(),
			inFileNamespace = page.inNamespace( 'file' ),
			validNamespace = ( page.inNamespace( '' ) || page.inNamespace( 'user' ) || inFileNamespace );

		// Only show upload page action in File namespace if page doesn't already exist.
		if ( inFileNamespace ) {
			if ( mw.config.get( 'wgArticleId' ) ) {
				$( '#ca-upload' ).remove();
			}
		} else {
			if ( !page.isEditable( user ) || !validNamespace ||
					// FIXME: Anonymous users cannot upload but really this should also check rights of user via getRights
					// (without triggering an additional HTTP request)
					user.isAnon() ||
					mw.util.getParamValue( 'action' ) || !needsPhoto( $lead ) || mw.config.get( 'wgIsMainPage' ) ) {
				$( '#ca-upload' ).remove();
			}
		}

		new LeadPhotoUploaderButton( {
			funnel: funnel
		} );
		skin.emit( 'changed' );
	}

	if ( isSupported ) {
		$( initialize );
	} else {
			// FIXME: We want to enable it to these users however we must first deal with what to show
			// to users who haven't uploaded anything to make the page useful.
		$( function () {
			$( '#mw-mf-page-left li.icon-uploads' ).remove();
		} );
	}

	M.define( 'modules/uploads/_leadphoto', {
		needsPhoto: needsPhoto
	} );

}( mw.mobileFrontend, jQuery ) );
