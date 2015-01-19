( function ( M, $ ) {

	var PhotoListApi, Api,
		IMAGE_WIDTH = mw.config.get( 'wgMFThumbnailSizes' ).medium,
		corsUrl = mw.config.get( 'wgMFPhotoUploadEndpoint' );

	if ( corsUrl ) {
		Api = M.require( 'modules/ForeignApi' );
	} else {
		Api = M.require( 'api' ).Api;
	}

	/**
	 * API for retrieving gallery photos
	 * @class PhotoListApi
	 * @extends Api
	 */
	PhotoListApi = Api.extend( {
		apiUrl: corsUrl || Api.prototype.apiUrl,
		/** @inheritdoc */
		initialize: function ( options ) {
			Api.prototype.initialize.apply( this, arguments );
			this.username = options.username;
			this.category = options.category;
			this.limit = 10;
		},
		/**
		 * Returns a description based on the file name using
		 * a regular expression that strips the file type suffix,
		 * namespace prefix and any
		 * date suffix in format YYYY-MM-DD HH-MM
		 * @method
		 * @private
		 * @param {String} title Title of file
		 * @return {String} Description for file
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
		/**
		 * Get the associated query needed to retrieve images from API based
		 * on currently configured options.
		 * @return {Object}
		 */
		getQuery: function () {
			var query = {
				action: 'query',
				prop: 'imageinfo',
				// FIXME: [API] have to request timestamp since api returns an object
				// rather than an array thus we need a way to sort
				iiprop: 'url|timestamp',
				iiurlwidth: IMAGE_WIDTH
			};

			if ( this.username ) {
				$.extend( query, {
					generator: 'allimages',
					gaiuser: this.username,
					gaisort: 'timestamp',
					gaidir: 'descending',
					gailimit: this.limit,
					gaicontinue: this.endTimestamp
				} );
			} else if ( this.category ) {
				$.extend( query, {
					generator: 'categorymembers',
					gcmtitle: 'Category:' + this.category,
					gcmtype: 'file',
					// FIXME [API] a lot of duplication follows due to the silly way generators work
					gcmdir: 'descending',
					gcmlimit: this.limit,
					gcmcontinue: this.endTimestamp
				} );
			}
			return query;
		},
		/**
		 * Request photos beginning with the current value of endTimestamp
		 * @return {jQuery.Deferred} where parameter is a list of JavaScript objects describing an image.
		 */
		getPhotos: function () {
			var self = this,
				result = $.Deferred();

			// FIXME: Don't simply use this.endTimestamp as initially this value is undefined
			if ( this.endTimestamp !== false ) {
				this.ajax( this.getQuery() ).done( function ( resp ) {
					if ( resp.query && resp.query.pages ) {
						// FIXME: [API] in an ideal world imageData would be a sorted array
						var photos = $.map( resp.query.pages, function ( page ) {
								return self._getImageDataFromPage.call( self, page );
							} ).sort( function ( a, b ) {
								return a.timestamp < b.timestamp ? 1 : -1;
							} );

						if ( resp['query-continue'] ) {
							// FIXME: API I hate you.
							if ( self.category ) {
								self.endTimestamp = resp['query-continue'].categorymembers.gcmcontinue;
							} else {
								self.endTimestamp = resp['query-continue'].allimages.gaicontinue;
							}
						} else {
							self.endTimestamp = false;
						}
						// FIXME: Should reply with a list of PhotoItem or Photo classes.
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

	M.define( 'modules/gallery/PhotoListApi', PhotoListApi );
}( mw.mobileFrontend, jQuery ) );
