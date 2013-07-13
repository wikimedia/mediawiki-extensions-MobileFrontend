( function( M, $ ) {

	var
		funnel = $.cookie( 'mwUploadsFunnel' ) || 'article',
		showCta = mw.config.get( 'wgMFEnablePhotoUploadCTA' ) || funnel === 'nearby',
		popup = M.require( 'notifications' ),
		PhotoUploaderPageActionButton = M.require( 'modules/uploads/PhotoUploaderPageActionButton' ),
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		isSupported = PhotoUploaderButton.isSupported,
		LeadPhoto = M.require( 'modules/uploads/LeadPhoto' );

	function needsPhoto( $container ) {
		var $content_0 = $container.find( '#content_0' );
		// FIXME: workaround for https://bugzilla.wikimedia.org/show_bug.cgi?id=43271
		if ( $content_0.length ) {
			$container = $content_0;
		}

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
			validNamespace = ( namespace === namespaceIds[''] || namespace === namespaceIds.user ),
			$page = $( '#content' ),
			optionsPhotoUploader,
			photoUploader;

		if ( !M.isLoggedIn() && !showCta ) {
			// Note with the CTA this is unnecessary but the new nav requires showing the upload button at all times
			return makeDisabledButton( 'mobile-frontend-photo-upload-anon' );
		} else if ( !isEditable ) {
			return makeDisabledButton( 'mobile-frontend-photo-upload-protected' );
		} else if ( !validNamespace || mw.util.getParamValue( 'action' ) || !needsPhoto( $page ) || mw.config.get( 'wgIsMainPage' ) ) {
			return makeDisabledButton();
		}

		optionsPhotoUploader = {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			el: '#ca-upload',
			pageTitle: mw.config.get( 'wgTitle' ),
			funnel: funnel
		};

		photoUploader = new PhotoUploaderPageActionButton( optionsPhotoUploader );
		photoUploader.on( 'start', function() {
				photoUploader.$el.hide();
			} ).
			on( 'success', function( data ) {
				popup.show( mw.msg( 'mobile-frontend-photo-upload-success-article' ), 'toast' );
				// FIXME: workaround for https://bugzilla.wikimedia.org/show_bug.cgi?id=43271
				if ( !$( '#content_0' ).length ) {
					$( '<div id="content_0" >' ).insertAfter( $( '#section_0,#page-actions' ).last() );
				}
				new LeadPhoto( {
					url: data.url,
					pageUrl: data.descriptionUrl,
					caption: data.description
				} ).prependTo( '#content_0' ).animate();
			} ).
			on( 'error cancel', function() {
				photoUploader.$el.show();
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
