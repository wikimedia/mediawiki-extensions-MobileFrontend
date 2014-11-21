( function ( M, $ ) {
	var UserGalleryApi,
		IMAGE_WIDTH = mw.config.get( 'wgMFThumbnailSizes' ).medium,
		corsUrl = mw.config.get( 'wgMFPhotoUploadEndpoint' ),
		Api = M.require( 'api' ).Api;

	/**
	 * API for retrieving gallery photos
	 * @class UserGalleryApi
	 * @extends Api
	 */
	UserGalleryApi = Api.extend( {
		initialize: function ( options ) {
			Api.prototype.initialize.apply( this, arguments );
			this.username = options.username;
			this.limit = 10;
		},
		/**
		 * Returns a description based on the file name using
		 * a regular expression that strips the file type suffix,
		 * namespace prefix and any
		 * date suffix in format YYYY-MM-DD HH-MM
		 * @method
		 * @private
		 * @param {string} title Title of file
		 * @return {string} Description for file
		 */
		_getDescription: function ( title ) {
			title = title.replace( /\.[^\. ]+$/, '' ); // replace filename suffix
			// strip namespace: prefix and date suffix from remainder
			return title.replace( /^[^:]*:/, '' )
				.replace( / \d{4}-\d{1,2}-\d{1,2} \d{1,2}-\d{1,2}$/, '' );
		},
		/**
		 * Returns the value in pixels of a medium thumbnail
		 * @method
		 */
		getWidth: function () {
			return IMAGE_WIDTH;
		},
		/**
		 * Extracts image data from api response
		 * @method
		 * @private
		 * @param {Object} page as returned by api request
		 * @return {Object} describing image.
		 */
		_getImageDataFromPage: function ( page ) {
			var img = page.imageinfo[0];
			return {
				url: img.thumburl,
				title: page.title,
				timestamp: img.timestamp,
				description: this._getDescription( page.title ),
				descriptionUrl: img.descriptionurl
			};
		},
		getPhotos: function () {
			var self = this,
				result = $.Deferred();

			// FIXME: Don't simply use this.endTimestamp as initially this value is undefined
			if ( this.endTimestamp !== false ) {
				this.get( {
					action: 'query',
					generator: 'allimages',
					gaisort: 'timestamp',
					gaidir: 'descending',
					gaiuser: this.username,
					gailimit: this.limit,
					gaicontinue: this.endTimestamp,
					prop: 'imageinfo',
					origin: corsUrl ? this.getOrigin() : undefined,
					// FIXME: [API] have to request timestamp since api returns an object
					// rather than an array thus we need a way to sort
					iiprop: 'url|timestamp',
					iiurlwidth: IMAGE_WIDTH
				}, {
					url: corsUrl || this.apiUrl,
					xhrFields: {
						withCredentials: true
					}
				} ).done( function ( resp ) {
					if ( resp.query && resp.query.pages ) {
						// FIXME: [API] in an ideal world imageData would be a sorted array
						var photos = $.map( resp.query.pages, function ( page ) {
								return self._getImageDataFromPage.call( self, page );
							} ).sort( function ( a, b ) {
								return a.timestamp < b.timestamp ? 1 : -1;
							} );

						if ( resp['query-continue'] ) {
							self.endTimestamp = resp['query-continue'].allimages.gaicontinue;
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

	M.define( 'specials/uploads/UserGalleryApi', UserGalleryApi );
}( mw.mobileFrontend, jQuery ) );
