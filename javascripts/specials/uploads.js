( function ( M, $ ) {
	var
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		PhotoList = M.require( 'modules/gallery/PhotoList' ),
		pageParams = mw.config.get( 'wgPageName' ).split( '/' ),
		currentUserName = user.getName(),
		userName = pageParams[1] ? pageParams[1] : currentUserName;

	/**
	 * Create a {PhotoUploaderButton} with an uploads funnel.
	 * @param {jQuery.Object} $container to append new button to.
	 * @ignore
	 */
	function createButton( $container ) {
		var btn = new PhotoUploaderButton( {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload-generic' ),
			pageTitle: mw.config.get( 'wgTitle' ),
			funnel: 'uploads'
		} );

		btn.appendTo( $container );
	}

	/**
	 * Initialise a photo upload button at the top of the page.
	 * @ignore
	 */
	function init() {
		var userGallery, $a,
			$btnContainer = $( '.ctaUploadPhoto' ),
			$content = $( '.content' );

		// Don't attempt to display the gallery if PHP displayed an error
		if ( $( '.error' ).length ) {
			return;
		}

		userGallery = new PhotoList( {
			username: userName
		} ).appendTo( $content );

		if ( PhotoUploaderButton.isSupported && currentUserName === userName && mw.config.get( 'wgUserCanUpload' ) ) {
			if ( $btnContainer.length ) {
				if ( user.getEditCount() === 0 ) {
					$a = $( '<a class="button icon icon-photo icon-text mw-ui-button mw-ui-progressive">' )
						.text( mw.msg( 'mobile-frontend-photo-upload-generic' ) )
						.attr( 'href', '#/upload-tutorial/uploads' ).appendTo( $btnContainer );
					// FIXME: This is needed so the camera shows. Eww.
					$( '<div class="icon icon icon-24px">' ).appendTo( $a );
				} else {
					createButton( $btnContainer );
				}
			}

			// FIXME: Please find a way to do this without a global event.
			M.on( '_file-upload', function ( image ) {
				var newCount, msgKey,
					$counter = $btnContainer.find( 'h2' ).show().find( 'span' );

				if ( userGallery.isEmpty() ) {
					msgKey = 'mobile-frontend-donate-photo-first-upload-success';
				} else {
					msgKey = 'mobile-frontend-donate-photo-upload-success';
				}
				popup.show( mw.msg( msgKey ), 'toast' );

				userGallery.prependPhoto( image );

				if ( $counter.length ) {
					newCount = parseInt( $counter.text(), 10 ) + 1;
					$counter.parent().html( mw.msg( 'mobile-frontend-photo-upload-user-count', newCount ) ).show();
				}
			} );
		}
	}

	if ( userName && mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Uploads' ) {
		$( init );
	}

}( mw.mobileFrontend, jQuery ) );
