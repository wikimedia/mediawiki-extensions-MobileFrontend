( function ( M, $ ) {
	var
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		user = M.require( 'user' ),
		popup = M.require( 'toast' ),
		PhotoList = M.require( 'specials/uploads/PhotoList' ),
		pageParams = mw.config.get( 'wgPageName' ).split( '/' ),
		currentUserName = user.getName(),
		userName = pageParams[1] ? pageParams[1] : currentUserName;

	function createButton( $container ) {
		var btn = new PhotoUploaderButton( {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload-generic' ),
			pageTitle: mw.config.get( 'wgTitle' ),
			funnel: 'uploads'
		} );

		btn.appendTo( $container );
	}

	function init() {
		var $container, userGallery, $a;

		// Don't attempt to display the gallery if PHP displayed an error
		if ( $( '.error' ).length ) {
			return;
		}

		userGallery = new PhotoList( {
			username: userName
		} ).appendTo( '#content_wrapper' );

		if ( PhotoUploaderButton.isSupported && currentUserName === userName ) {
			$container = $( '.ctaUploadPhoto' );

			if ( $container.length ) {
				if ( user.getEditCount() === 0 ) {
					$a = $( '<a class="button icon icon-photo icon-text mw-ui-button mw-ui-progressive">' )
						.text( mw.msg( 'mobile-frontend-photo-upload-generic' ) )
						.attr( 'href', '#/upload-tutorial/uploads' ).appendTo( $container );
					// FIXME: This is needed so the camera shows. Eww.
					$( '<div class="icon icon icon-24px">' ).appendTo( $a );
				} else {
					createButton( $container );
				}
			}

			// FIXME: Please find a way to do this without a global event.
			M.on( '_file-upload', function ( image ) {
				var newCount, msgKey,
					$counter = $container.find( 'h2' ).show().find( 'span' );

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
