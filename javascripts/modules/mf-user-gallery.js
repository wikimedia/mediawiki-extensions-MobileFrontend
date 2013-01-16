( function( M,  $ ) {
var m = ( function() {
	var $container = $( '.mobileUserGallery' ),
		isGalleryPage = $container.length > 0;

	function showGallery() {
		var corsUrl = M.getConfig( 'photo-upload-endpoint' );
		$.ajax( {
			url: corsUrl || M.getApiUrl(),
			data: {
				action: 'query',
				generator: 'allimages',
				format: 'json',
				gaisort: 'timestamp',
				gaidir: 'descending',
				gaiuser: M.getConfig( 'username' ),
				gailimit: 10,
				prop: 'imageinfo',
				origin: corsUrl ? M.getOrigin() : undefined,
				iiprop: 'url',
				iiurlwidth: 200
			},
			xhrFields: {
				'withCredentials': true
			}
		} ).done( function( resp ) {
			var $li;
			if ( resp.query && resp.query.pages ) {
				$.each( resp.query.pages, function () {
					var $a, img, page = this;
					img = page.imageinfo[0];
					$li = $( '<li class="thumb">' ).appendTo( $container );
					$a = $( '<a>' ).attr( 'href', img.descriptionurl ).appendTo( $li );
					if ( img.thumburl ) {
						$( '<img>' ).attr( 'src', img.thumburl ).
							attr( 'alt', img.name ).appendTo( $a );
					} else {
						$a.text( img.name );
					}
				} );
			}
		} );
	}

	function init() {
		var photo = M.getModule( 'photos' );
		if ( photo && isGalleryPage ) {
			if ( photo.isSupported ) {
				photo.addPhotoUploader( $container, false, 'mobile-frontend-photo-upload-generic' );
			}
			showGallery();
		}
	}

	return {
		init: init
	};
}() );

M.registerModule( 'userGallery', m );

}( mw.mobileFrontend, jQuery ) );
