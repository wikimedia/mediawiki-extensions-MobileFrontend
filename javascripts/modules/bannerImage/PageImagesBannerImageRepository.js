 ( function ( M, $ ) {

	var Class = M.require( 'Class' ),
		Image = M.require( 'modules/bannerImage/Image' ),
		PageImagesBannerImageRepository;

	/**
	 * Uses the PageImages API to get images that can be used as banner images
	 * for a page.
	 *
	 * @class
	 */
	PageImagesBannerImageRepository = Class.extend( {

		/**
		 * @constructor
		 * @param {mw.Api} api A MediaWiki API client
		 * @param {String} title The title of the page
		 */
		initialize: function ( api, title ) {
			this.api = api;
			this.title = title;
			this.cache = {};
		},

		/**
		 * Gets images that can be used as banner images.
		 *
		 * @param {Number} targetWidth The target width of the image
		 * @return {$.Promise} A promise that resolves with an array of Image objects if the
		 *  MediaWiki API request was successful or rejects otherwise.
		 */
		getImages: function ( targetWidth ) {
			var deferred = $.Deferred(),
				promise = deferred.promise(),
				self = this;

			if ( self.cache.hasOwnProperty( targetWidth ) ) {
				deferred.resolve( self.cache[targetWidth] );

				return promise;
			}

			self.api.get( {
				prop: 'pageimages',
				titles: self.title,
				pithumbsize: targetWidth
			} )
			.then( function ( data ) {
				var images = [];

				// Page doesn't exist.
				if ( data.query.pages.hasOwnProperty( '-1' ) ) {
					deferred.resolve( images );

					return;
				}

				$.each( data.query.pages, function ( key, value ) {
					var thumbnail = value.thumbnail;

					// Page exists but doesn't have thumbnail.
					if ( !thumbnail ) {
						return;
					}

					images.push( new Image(
						thumbnail.source,
						thumbnail.width,
						thumbnail.height
					) );
				} );

				self.cache[targetWidth] = images;

				deferred.resolve( images );
			} )
			.fail( deferred.reject );

			return promise;
		}
	} );

	M.define( 'modules/bannerImage/PageImagesBannerImageRepository', PageImagesBannerImageRepository );

} ( mw.mobileFrontend, jQuery ) );
