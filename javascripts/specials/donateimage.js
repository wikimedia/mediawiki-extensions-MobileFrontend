( function( M,  $ ) {

var api = M.require( 'api' ), m = ( function() {
	var IMAGE_WIDTH = 320;

	function extractDescription( text ) {
		var index, summary = '';
		// FIXME: assumes wikimedia commons - this should be customisable
		index = text.indexOf( '== {{int:filedesc}} ==' );
		if ( index > - 1 ) {
			summary = $.trim( text.substr( index ).split( '==' )[ 2 ] );
		}
		return summary;
	}
	function addDescriptions( $container ) {
		var corsUrl = M.getConfig( 'photo-upload-endpoint' ), options,
			data, titles = [], descriptions = {};

		$container.find( 'p' ).each( function() {
			titles.push( $( this ).data( 'title' ) );
		} );

		data = {
			action: 'query',
			titles: titles,
			prop: 'revisions',
			rvprop: 'content'
		};

		if ( corsUrl ) {
			options = { url: corsUrl };
		}
		api.ajax( data, options ).done( function( resp ) {
			var pages = $.map( resp.query.pages, function ( v ) {
				return v;
			} );
			$( pages ).each( function() {
				descriptions[ this.title ] = extractDescription( this.revisions[0]['*'] );
			} );

			$container.find( 'p' ).each( function() {
				var title = $( this ).data( 'title' ), summary = descriptions[ title ];
				$( this ).removeClass( 'loading' ).
					text( summary || mw.msg( 'mobile-frontend-listed-image-no-description' ) );
			} );
		} );
	}

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
					$( '<p class="loading">' ).data( 'title', page.title ).appendTo( $li );
				} );
				addDescriptions( $container );
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
	init();

	return {
		extractDescription: extractDescription,
		init: init
	};
}() );

M.define( 'userGallery', m );

}( mw.mobileFrontend, jQuery ) );
