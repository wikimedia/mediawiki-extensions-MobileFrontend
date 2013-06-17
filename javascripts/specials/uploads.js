( function( M, $ ) {
var
	PhotoUploaderButton = M.require( 'uploads/PhotoUploaderButton' ),
	popup = M.require( 'notifications' ),
	Api = M.require( 'api' ).Api,
	View = M.require( 'view' ),
	CarouselOverlay = M.require( 'overlays/CarouselOverlay' ),
	corsUrl = mw.config.get( 'wgMFPhotoUploadEndpoint' ),
	userName = mw.config.get( 'wgUserName' ),
	IMAGE_WIDTH = 320,
	UserGalleryApi, PhotoItem, PhotoList;

	UserGalleryApi = Api.extend( {
		getPhotos: function() {
			var result = $.Deferred();

			this.get( {
				action: 'query',
				generator: 'allimages',
				gaisort: 'timestamp',
				gaidir: 'descending',
				gaiuser: userName,
				gailimit: 10,
				prop: 'imageinfo',
				origin: corsUrl ? M.getOrigin() : undefined,
				// FIXME: have to request timestamp since api returns a json rather than an array thus we need a way to sort
				iiprop: 'url|timestamp',
				iiurlwidth: IMAGE_WIDTH
			}, {
				url: corsUrl || M.getApiUrl(),
				xhrFields: { withCredentials: true }
			} ).done( function( resp ) {
				if ( resp.query && resp.query.pages ) {
					// FIXME: API work around - in an ideal world imageData would be a sorted array
					result.resolve( $.map( resp.query.pages, getImageDataFromPage ).sort( function( a, b ) {
						return a.timestamp > b.timestamp ? 1 : -1;
					} ) );
				} else {
					result.reject();
				}
			} );

			return result;
		}
	} );

	PhotoItem = View.extend( {
		template: M.template.get( 'specials/uploads/photo' ),
		tagName: 'li'
	} );

	PhotoList = View.extend( {
		template: M.template.get( 'specials/uploads/userGallery' ),
		initialize: function() {
			this.api = new UserGalleryApi();
		},
		postRender: function() {
			var self = this;
			this.$end = this.$( '.end' );

			this.api.getPhotos().done( function( photos ) {
				$.each( photos, function() {
					self.addPhoto( this );
				} );
			} ).fail( function() {
				self.$end.hide();
				self.emit( 'empty' );
			} );
		},
		isEmpty: function() {
			return this.$( 'li' ).length === 0;
		},
		addPhoto: function( photoData, notify ) {
			var msgKey;
			new PhotoItem( photoData ).prependTo( this.$( 'ul' ) );
			if ( notify ) {
				if ( this.isEmpty() ) {
					msgKey = 'mobile-frontend-donate-photo-first-upload-success';
				} else {
					msgKey = 'mobile-frontend-donate-photo-upload-success';
				}
				popup.show( mw.msg( msgKey ), 'toast' );
			}
		}
	} );

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

	function init() {
		var $container, userGallery;

		userGallery = new PhotoList().
			appendTo( '#content' ).
			on( 'empty', function() {
				$( '.ctaUploadPhoto h2' ).hide(); // hide the count if 0 uploads have been made
				new CarouselOverlay( {
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
				} ).show();
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
					if ( $counter.length ) {
						newCount = parseInt( $counter.text(), 10 ) + 1;
						$counter.parent().html( mw.msg( 'mobile-frontend-photo-upload-user-count', newCount ) ).show();
					}
				} );
		}
	}

	if ( userName ) {
		$( init );
	}

	M.define( 'specials/uploads', {
		getDescription: getDescription
	} );

}( mw.mobileFrontend, jQuery ) );
