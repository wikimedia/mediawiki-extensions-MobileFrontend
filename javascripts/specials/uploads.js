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
		initialize: function() {
			this.limit = 10;
		},
		getPhotos: function() {
			var self = this, result = $.Deferred();

			if ( this.endTimestamp !== false ) {
				this.get( {
					action: 'query',
					generator: 'allimages',
					gaisort: 'timestamp',
					gaidir: 'descending',
					gaiuser: userName,
					gailimit: this.limit,
					gaistart: this.endTimestamp,
					prop: 'imageinfo',
					origin: corsUrl ? M.getOrigin() : undefined,
					// FIXME: [API] have to request timestamp since api returns an object
					// rather than an array thus we need a way to sort
					iiprop: 'url|timestamp',
					iiurlwidth: IMAGE_WIDTH
				}, {
					url: corsUrl || M.getApiUrl(),
					xhrFields: { withCredentials: true }
				} ).done( function( resp ) {
					if ( resp.query && resp.query.pages ) {
						// FIXME: [API] in an ideal world imageData would be a sorted array
						var photos = $.map( resp.query.pages, getImageDataFromPage ).sort( function( a, b ) {
							return a.timestamp < b.timestamp ? 1 : -1;
						} );
						if ( resp['query-continue'] ) {
							self.endTimestamp = resp['query-continue'].allimages.gaistart;
						} else {
							self.endTimestamp = false;
						}
						result.resolve( photos );
					} else {
						result.resolve( [] );
					}
				} ).fail( $.proxy( result, 'reject' ) );
			} else {
				result.resolve( [] );
			}

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
			// how close a spinner needs to be to the viewport to trigger loading (px)
			this.threshold = 1000;
			this.loading = false;
			this.api = new UserGalleryApi();
		},
		postRender: function() {
			this.$end = this.$( '.end' );
			this.$list = this.$( 'ul' );

			this._loadPhotos();
			if ( mw.config.get( 'wgMFMode' ) !== 'stable' ) {
				$( window ).on( 'scroll', $.proxy( this, '_loadPhotos' ) );
			} else {
				this.$end.remove();
			}
		},
		isEmpty: function() {
			return this.$list.find( 'li' ).length === 0;
		},
		prependPhoto: function( photoData ) {
			new PhotoItem( photoData ).prependTo( this.$list );
		},
		appendPhoto: function( photoData ) {
			new PhotoItem( photoData ).appendTo( this.$list );
		},
		_isEndNear: function() {
			var scrollBottom = $( window ).scrollTop() + $( window ).height();
			return scrollBottom + this.threshold > this.$end.offset().top;
		},
		_loadPhotos: function() {
			var self = this;

			if ( this._isEndNear() && !this.loading ) {
				this.loading = true;

				this.api.getPhotos().always( function() {
					self.loading = false;
				} ).done( function( photos ) {
					if ( photos.length ) {
						$.each( photos, function() {
							self.appendPhoto( this );
						} );
					} else {
						self.$end.remove();
					}
				} );
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
					var $counter = $container.find( 'h2' ).show().find( 'span' ), newCount, msgKey;

					if ( userGallery.isEmpty() ) {
						msgKey = 'mobile-frontend-donate-photo-first-upload-success';
					} else {
						msgKey = 'mobile-frontend-donate-photo-upload-success';
					}
					popup.show( mw.msg( msgKey ), 'toast' );

					image.width = IMAGE_WIDTH;
					userGallery.prependPhoto( image );

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
