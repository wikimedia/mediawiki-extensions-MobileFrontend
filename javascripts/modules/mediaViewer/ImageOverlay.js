( function( M, $ ) {
	M.assertMode( [ 'alpha', 'beta', 'app' ] );

	var Overlay = M.require( 'OverlayNew' ),
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
					self.$( '.container' ).removeClass( 'loading' );
				}

				self.imgRatio = data.thumbwidth / data.thumbheight;
				$img = $( '<img>' ).attr( 'src', data.thumburl ).attr( 'alt', options.caption );
				self.$( '.container div' ).append( $img );

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

				self.$el.on( M.tapEvent( 'click' ), function() {
					self.$( '.details' ).toggleClass( 'visible' );
				} );
			} );

			$( window ).on( 'resize', $.proxy( this, '_positionImage' ) );
		},

		_positionImage: function() {
			var windowWidth = $( window ).width(),
				windowHeight = $( window ).height(),
				windowRatio = windowWidth / windowHeight;

			// display: table (which we use for vertical centering) makes the overlay
			// expand so simply setting width/height to 100% doesn't work
			if ( this.imgRatio > windowRatio ) {
				this.$( 'img' ).css( {
					width: windowWidth,
					height: 'auto'
				} );
			} else {
				this.$( 'img' ).css( {
					width: 'auto',
					height: windowHeight
				} );
			}
		}
	} );
	M.define( 'modules/mediaViewer/ImageOverlay', ImageOverlay );

}( mw.mobileFrontend, jQuery ) );
