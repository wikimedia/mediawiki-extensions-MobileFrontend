( function( M,  $ ) {
var m = ( function() {
	var IMAGE_WIDTH = 320;

	function showGallery( $container, username ) {
		var corsUrl = M.getConfig( 'photo-upload-endpoint' );
		$.ajax( {
			url: corsUrl || M.getApiUrl(),
			data: {
				action: 'query',
				generator: 'allimages',
				format: 'json',
				gaisort: 'timestamp',
				gaidir: 'descending',
				gaiuser: username,
				gailimit: 10,
				prop: 'imageinfo',
				origin: corsUrl ? M.getOrigin() : undefined,
				iiprop: 'url',
				iiurlwidth: IMAGE_WIDTH
			},
			xhrFields: {
				'withCredentials': true
			}
		} ).done( function( resp ) {
			var $li, pages = [];
			if ( resp.query && resp.query.pages ) {
				pages = resp.query.pages;
				$.each( pages, function () {
					var $a, img, page = this;
					img = page.imageinfo[0];
					$li = $( '<li>' ).prependTo( $container );
					$a = $( '<a>' ).attr( 'href', img.descriptionurl ).appendTo( $li );
					if ( img.thumburl ) {
						$( '<img>' ).attr( 'src', img.thumburl ).
							attr( 'alt', img.name ).appendTo( $a );
					} else {
						$a.text( img.name );
					}
				} );
			}

			if ( pages.length === 0 ) {
				$( '<p>' ).text( mw.msg( 'mobile-frontend-donate-image-summary' ) ).insertBefore( $container );
			}
		} );
	}

	function init() {
		var photo = M.getModule( 'photos' ),
			$container = $( '<div class="ctaUploadPhoto">' ).prependTo( '#content_wrapper' ),
			username = M.getConfig( 'username' );

		if ( photo ) {
			if ( photo.isSupported ) {
				photo.addPhotoUploader( $container, false, 'mobile-frontend-photo-upload-generic' );
			}
			if ( username ) {
				showGallery( $( '.mobileUserGallery' ), username );
			}
		}
	}

	return {
		init: init
	};
}() );

M.registerModule( 'userGallery', m );

}( mw.mobileFrontend, jQuery ) );
