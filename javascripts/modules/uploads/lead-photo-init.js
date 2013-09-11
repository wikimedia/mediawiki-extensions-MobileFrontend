( function( M, $ ) {

	var
		funnel = $.cookie( 'mwUploadsFunnel' ) || 'article',
		showCta = mw.config.get( 'wgMFEnablePhotoUploadCTA' ) || funnel === 'nearby',
		popup = M.require( 'notifications' ),
		LeadPhotoUploaderButton = M.require( 'modules/uploads/LeadPhotoUploaderButton' ),
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		isSupported = PhotoUploaderButton.isSupported;

	function needsPhoto( $container ) {
		return $container.find( mw.config.get( 'wgMFLeadPhotoUploadCssSelector' ) ).length === 0;
	}

	// reset the funnel cookie as it is no longer valid (this stops upload cta showing on further page loads)
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
		var namespaceIds = mw.config.get( 'wgNamespaceIds' ),
			namespace = mw.config.get( 'wgNamespaceNumber' ),
			// FIXME: not updated on dynamic page loads
			isEditable = mw.config.get( 'wgIsPageEditable' ),
			validNamespace = ( namespace === namespaceIds[''] || namespace === namespaceIds.user );

		if ( !M.isLoggedIn() && !showCta ) {
			// Note with the CTA this is unnecessary but the new nav requires showing the upload button at all times
			return makeDisabledButton( 'mobile-frontend-photo-upload-anon' );
		} else if ( !isEditable ) {
			return makeDisabledButton( 'mobile-frontend-photo-upload-protected' );
		} else if ( !validNamespace || mw.util.getParamValue( 'action' ) || !needsPhoto( M.getLeadSection() ) || mw.config.get( 'wgIsMainPage' ) ) {
			return makeDisabledButton();
		}

		new LeadPhotoUploaderButton( {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			el: '#ca-upload',
			pageTitle: mw.config.get( 'wgPageName' ),
			funnel: funnel
		} );
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
