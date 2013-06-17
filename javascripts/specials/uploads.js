( function( M, $ ) {
var
	PhotoUploaderButton = M.require( 'uploads/PhotoUploaderButton' ),
	popup = M.require( 'notifications' ),
	View = M.require( 'view' ),
	CarouselOverlay = M.require( 'overlays/CarouselOverlay' ),
	carousel,
	m;

m = ( function() {
	var IMAGE_WIDTH = 320,
		corsUrl = mw.config.get( 'wgMFPhotoUploadEndpoint' ),
		UserGallery = View.extend( {
			initialize: function( options ) {
				this.$placeholder = options.$placeholder;
			},
			isEmpty: function() {
				return this.$( 'li' ).length === 0;
			},
			removePlaceholder: function() {
				this.$placeholder.remove(); // remove placeholder text in case of first upload
			},
			templateItem: M.template.compile(
				'<li><a href="{{descriptionUrl}}" alt="{{description}}"><img src="{{url}}" width="{{width}}"></a><p>{{description}}</p></li>'
			),
			addPhoto: function( photoData, notify ) {
				var msgKey, $li;
				if ( this.isEmpty() ) {
					this.removePlaceholder();
					msgKey = 'mobile-frontend-donate-photo-first-upload-success';
				} else {
					msgKey = 'mobile-frontend-donate-photo-upload-success';
				}
				$li = $( this.templateItem.render( photoData ) ).
					prependTo( this.$el );
				if ( notify ) {
					$li.hide().slideDown();
					popup.show( mw.msg( msgKey ), 'toast' );
				}
			}
		} ),
		userGallery;

	/**
	 * Returns a description based on the file name using
	 * a regular expression that strips the file type suffix,
	 * namespace prefix and any
	 * date suffix in format YYYY-MM-DD HH-MM
	 * @param {string} title Title of file
	 * @return {string} Description for file
	 */
	function getDescription( title ) {
		title = title.replace( /\.[^\. ]+$/, '' ); // replace filename suffix
		// strip namespace: prefix and date suffix from remainder
		return title.replace( /^[^:]*:/, '').replace( / \d{4}-\d{1,2}-\d{1,2} \d{1,2}-\d{1,2}$/, '' );
	}

	function getImageDataFromPage( page ) {
		var img = page.imageinfo[0];
		return {
			url: img.thumburl,
			title: page.title,
			timestamp: img.timestamp,
			description: getDescription( page.title ),
			descriptionUrl: img.descriptionurl
		};
	}

	function showGallery( username ) {
		// FIXME: use api module
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
				// FIXME: have to request timestamp since api returns a json rather than an array thus we need a way to sort
				iiprop: 'url|timestamp',
				iiurlwidth: IMAGE_WIDTH
			},
			xhrFields: {
				'withCredentials': true
			}
		} ).done( function( resp ) {
			var pages = [];

			if ( resp.query && resp.query.pages ) {
				pages = resp.query.pages;
				pages = $.map( pages, function ( p ) {
					return getImageDataFromPage( p );
				} );
				// FIXME: API work around - in an ideal world imageData would be an array
				pages = pages.sort( function( a, b ) {
					return a.timestamp > b.timestamp ? 1 : -1;
				} );
				$.each( pages, function() {
					userGallery.addPhoto( this );
				} );
			}

			if ( pages.length === 0 ) {
				$( '.ctaUploadPhoto h2' ).hide(); // hide the count if 0 uploads have been made
				carousel = new CarouselOverlay( {
					pages: [
						{
							caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-1-header' ),
							text: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-1' ),
							className: 'page-1', id: 1
						},
						{
							caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-2-header' ),
							text: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-2' ),
							className: 'page-2', id: 2
						},
						{
							caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-header' ),
							cancel: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-ok' ),
							className: 'page-3', id: 3
						}
					]
				} );
				carousel.show();
			}
		} );
	}

	function init() {
		var $container,
			username = mw.config.get( 'wgUserName' );

		userGallery = new UserGallery( {
			el: 'ul.mobileUserGallery',
			// FIXME: should be possible to do this more elegantly
			$placeholder: $( '#content p' ).eq( 0 )
		} );

		if ( PhotoUploaderButton.isSupported ) {
			$container = $( '.ctaUploadPhoto' );

			new PhotoUploaderButton( {
				buttonCaption: mw.msg( 'mobile-frontend-photo-upload-generic' ),
				pageTitle: mw.config.get( 'wgTitle' ),
				funnel: 'uploads'
			} ).
				appendTo( $container ).
				on( 'success', function( image ) {
					var $counter = $container.find( 'h2' ).show().find( 'span' ), newCount;
					image.width = IMAGE_WIDTH;
					userGallery.addPhoto( image, true );
					if ( $counter[ 0 ] ) {
						newCount = parseInt( $counter.text(), 10 ) + 1;
						$counter.parent().html( mw.msg( 'mobile-frontend-photo-upload-user-count', newCount ) ).show();
					}
					if ( carousel ) {
						carousel.remove();
					}
				} );
		}
		if ( username ) {
			showGallery( username );
		}
	}
	$( init );
	return {
		getDescription: getDescription
	};
}() );

M.define( 'userGallery', m );

}( mw.mobileFrontend, jQuery ) );
