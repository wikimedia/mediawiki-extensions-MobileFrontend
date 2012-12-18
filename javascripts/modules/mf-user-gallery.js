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
				list: 'allimages',
				format: 'json',
				aisort: 'timestamp',
				aidir: 'descending',
				aiuser: M.getConfig( 'username' ),
				ailimit: 10,
				origin: corsUrl ? M.getOrigin() : undefined,
				aiprop: 'url'
			},
			xhrFields: {
				'withCredentials': true
			}
		} ).done( function( data ) {
			var imgs, $li;
			if ( data.query && data.query.allimages ) {
				imgs = data.query.allimages;
				imgs.forEach( function( img ) {
					$li = $( '<li class="thumb">' ).appendTo( $container );
					// FIXME: add the thumbnail rather than the image name.
					$( '<a>' ).attr( 'href', img.descriptionurl ).text( img.name ).appendTo( $li );
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
