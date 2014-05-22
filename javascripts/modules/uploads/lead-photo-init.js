( function( M, $ ) {

	var
		funnel = $.cookie( 'mwUploadsFunnel' ) || 'article',
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		isSupported = PhotoUploaderButton.isSupported;

	function needsPhoto( $container ) {
		return $container.find( mw.config.get( 'wgMFLeadPhotoUploadCssSelector' ) ).length === 0;
	}

	// reset the funnel cookie as it is no longer valid
	if ( funnel ) {
		$.cookie( 'mwUploadsFunnel', null );
	}

	function makeDisabledButton( msg ) {
		$( '#ca-upload' ).on( 'click', function() {
			popup.show( mw.msg( msg || 'mobile-frontend-photo-upload-disabled' ), 'toast' );
		} );
	}

	function initialize() {
		// FIXME: make some general function for that (or a page object with a method)
		var
			// FIXME: not updated on dynamic page loads
			isEditable = mw.config.get( 'wgIsPageEditable' ),
			validNamespace = ( M.inNamespace( '' ) || M.inNamespace( 'user' ) || M.inNamespace( 'file' ) );

		if ( user.isAnon() ) {
			return makeDisabledButton( 'mobile-frontend-photo-upload-anon' );
		} else if ( !M.inNamespace( 'file' ) ) {
			if ( !isEditable ) {
				return makeDisabledButton( 'mobile-frontend-photo-upload-protected' );
			} else if ( !validNamespace || mw.util.getParamValue( 'action' ) || !needsPhoto( M.getLeadSection() ) || mw.config.get( 'wgIsMainPage' ) ) {
				return makeDisabledButton();
			}
		}

		if ( user.getEditCount() === 0 ) {
			$( '#ca-upload' ).addClass( 'enabled' );
			$( '<a>' ).attr( 'href', '#/upload-tutorial/' + funnel ).appendTo( '#ca-upload' );
		} else {
			new LeadPhotoUploaderButton( { funnel: funnel } );
		}
	}

	if ( isSupported ) {
		$( initialize );
		M.on( 'page-loaded', function() {
			initialize();
		} );
	} else {
		makeDisabledButton( 'mobile-frontend-photo-upload-unavailable' );
	}

	M.define( 'modules/uploads/_leadphoto', {
		needsPhoto: needsPhoto
	} );

}( mw.mobileFrontend, jQuery ) );
