( function ( M, $ ) {
	var BannerImage,
		md5fn = M.require( 'hex_md5' ),
		WikiDataApi = M.require( 'modules/wikigrok/WikiDataApi' ),
		View = M.require( 'View' ),
		icons = M.require( 'icons' ),
		imageWidth = getImageWidth();

	/**
	 * Gets a common width that is closest to the current screen width
	 * Limits the amount of thumbnail images being generated on the server
	 *
	 * @returns {Number} pixel width of the image
	 */
	function getImageWidth() {
		var val = 0,
			screenWidth = $( window ).width(),
			// Thumbnail widths
			widths = [ 320, 360, 380, 400, 420, 460, 480, 640, 680, 720, 736, 768 ],
			width = widths[0],
			diff = Math.abs( screenWidth - width ),
			newDiff;

		for ( val; val < widths.length; val++ ) {
			newDiff = Math.abs( screenWidth - widths[val] );
			if ( newDiff < diff ) {
				diff = newDiff;
				width = widths[val];
			}
		}
		return width;
	}

	/**
	 * A WikiData banner image at the head of the page
	 * @class BannerImage
	 * @extends View
	 */
	BannerImage = View.extend( {
		className: 'wikidata-banner-image',
		defaults: {
			spinner: icons.spinner().toHtmlString()
		},
		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			this.api = new WikiDataApi( {
				itemId: options.itemId
			} );

			View.prototype.initialize.apply( this, options );
		},
		/**
		 * Given a title work out the url to the thumbnail for that image
		 * FIXME: This should not make its way into stable.
		 * NOTE: Modified/Borrowed from from Infobox.js
		 * @method
		 * @param {String} title of file page without File: prefix
		 * @return {String} url corresponding to thumbnail (size 160px)
		 */
		getImageUrl: function ( title ) {
			var md5, filename, source,
				path = 'https://upload.wikimedia.org/wikipedia/commons/';
			// uppercase first letter in file name
			filename = title.charAt( 0 ).toUpperCase() + title.substr( 1 );
			// replace spaces with underscores
			filename = filename.replace( / /g, '_' );
			md5 = md5fn( filename );
			source = md5.charAt( 0 ) + '/' + md5.substr( 0, 2 ) + '/' + filename;
			if ( filename.substr( filename.length - 3 ) !== 'svg' ) {
				return path + 'thumb/' + source + '/' + imageWidth + 'px-' + filename;
			} else {
				return path + source;
			}
		},
		/**
		 * @inheritdoc
		 */
		postRender: function () {
			var self = this;

			this.api.getClaims().done( function ( claims ) {
				var $imageDefer = $.Deferred();

				// Check the claims for P18 (Image)
				if (
					claims.entities &&
					claims.entities.hasOwnProperty( 'P18' ) &&
					claims.entities.P18.length
				) {
					// Go through each of the images,
					// for now just pick the first one that loads.
					// There is an issue with reliably knowing if the
					// original image is wider than the thumbnail.
					// If so, that image will fail to load.
					$.each( claims.entities.P18, function ( index, image ) {
						var src;
						if ( image.mainsnak.datatype === 'commonsMedia' ) {
							// Get the image url
							src = self.getImageUrl(
								image.mainsnak.datavalue.value
							);
							// Try to load it
							$( '<img>' )
								.attr( 'src', src )
								.load( function () {
									$( this ).remove();
									$imageDefer.resolveWith( $, [ src ] );
								} )
								.error( function () {
									$( this ).remove();
								} )
								.appendTo( $( 'body' ) )
								.hide();
						}
					} );
					$imageDefer.done( function ( src ) {
						self.$el
							.css( 'background', 'url("' + src + '") 50% 50% no-repeat' )
							.show();
					} );
				}
			} );
		}
	} );

	M.define( 'modules/bannerImage/BannerImage', BannerImage );

}( mw.mobileFrontend, jQuery ) );
