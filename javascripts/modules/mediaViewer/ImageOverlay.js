( function( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		ImageApi = M.require( 'modules/mediaViewer/ImageApi' ),
		ImageOverlay, api;


	api = new ImageApi();

	/**
	 * @class ImageOverlay
	 * @extends Overlay
	 */
	ImageOverlay = Overlay.extend( {
		className: 'overlay media-viewer',
		template: M.template.get( 'modules/ImageOverlay' ),
		closeOnBack: true,

		defaults: {
			detailsMsg: mw.msg( 'mobile-frontend-media-details' ),
			licenseLinkMsg: mw.msg( 'mobile-frontend-media-license-link' )
		},

		postRender: function( options ) {
			var self = this, $img;
			this._super( options );

			api.getThumb( options.title ).done( function( data ) {
				function removeLoader() {
					self.$( '.image-wrapper' ).removeClass( 'loading' );
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
				self.$( '.details a' ).attr( 'href', data.descriptionurl );
				if ( data.extmetadata && data.extmetadata.LicenseShortName ) {
					self.$( '.license a' ).text( data.extmetadata.LicenseShortName.value );
				}
			} );

			$( window ).on( 'resize', $.proxy( this, '_positionImage' ) );
		},

		show: function() {
			this._super();
			this._positionImage();
		},

		_positionImage: function() {
			var detailsHeight = this.$( '.details' ).height(),
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
