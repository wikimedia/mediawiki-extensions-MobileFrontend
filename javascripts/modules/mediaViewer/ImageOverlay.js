( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		ImageApi = M.require( 'modules/mediaViewer/ImageApi' ),
		ImageOverlay, api;

	api = new ImageApi();

	/**
	 * Displays images in full screen overlay
	 * @class ImageOverlay
	 * @extends Overlay
	 */
	ImageOverlay = Overlay.extend( {
		// allow pinch zooming
		hasFixedHeader: false,
		className: 'overlay media-viewer',
		template: mw.template.get( 'mobile.mediaViewer', 'Overlay.hogan' ),
		closeOnBack: true,

		defaults: {
			detailsMsg: mw.msg( 'mobile-frontend-media-details' ),
			licenseLinkMsg: mw.msg( 'mobile-frontend-media-license-link' )
		},

		postRender: function ( options ) {
			var self = this, $img;
			Overlay.prototype.postRender.apply( this, arguments );

			api.getThumb( options.title ).done( function ( data ) {
				var author, url = data.descriptionurl + '#mw-jump-to-license';

				function removeLoader() {
					self.$( '.spinner' ).hide();
				}

				self.thumbWidth = data.thumbwidth;
				self.thumbHeight = data.thumbheight;
				self.imgRatio = data.thumbwidth / data.thumbheight;
				$img = $( '<img>' ).attr( 'src', data.thumburl ).attr( 'alt', options.caption );
				self.$( '.image' ).append( $img );

				if ( $img.prop( 'complete' ) ) {
					// if the image is loaded from browser cache, "load" event may not fire
					// (http://stackoverflow.com/questions/910727/jquery-event-for-images-loaded#comment10616132_1110094)
					removeLoader();
				} else {
					// remove the loader when the image is loaded
					$img.on( 'load', removeLoader );
				}
				self._positionImage();
				self.$( '.details a' ).attr( 'href', url );
				if ( data.extmetadata ) {
					// Add license information
					if ( data.extmetadata.LicenseShortName ) {
						self.$( '.license a' )
							.text( data.extmetadata.LicenseShortName.value )
							.attr( 'href', url );
					}
					// Add author information
					if ( data.extmetadata.Artist ) {
						// Strip any tags
						author = data.extmetadata.Artist.value.replace( /<.*?>/g, '' );
						self.$( '.license' ).prepend( author + ' &bull; ' );
					}
				}
			} );

			$( window ).on( 'resize', $.proxy( this, '_positionImage' ) );
		},

		show: function () {
			Overlay.prototype.show.apply( this, arguments );
			this._positionImage();
		},

		_positionImage: function () {
			var detailsHeight = this.$( '.details' ).outerHeight(),
				windowWidth = $( window ).width(),
				windowHeight = $( window ).height() - detailsHeight,
				windowRatio = windowWidth / windowHeight,
				$img = this.$( 'img' );

			// display: table (which we use for vertical centering) makes the overlay
			// expand so simply setting width/height to 100% doesn't work
			if ( this.imgRatio > windowRatio ) {
				if ( windowWidth < this.thumbWidth ) {
					$img.css( {
						width: windowWidth,
						height: 'auto'
					} );
				}
			} else {
				if ( windowHeight < this.thumbHeight ) {
					$img.css( {
						width: 'auto',
						height: windowHeight
					} );
				}
			}
			$( '.image-wrapper' ).css( 'bottom', detailsHeight );
		}
	} );
	M.define( 'modules/mediaViewer/ImageOverlay', ImageOverlay );

}( mw.mobileFrontend, jQuery ) );
