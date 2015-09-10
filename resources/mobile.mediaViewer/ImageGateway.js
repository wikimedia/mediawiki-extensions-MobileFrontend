( function ( M, $ ) {
	var sizeBuckets = [ 320, 640, 800, 1024, 1280, 1920, 2560, 2880 ];

	/**
	 * Gets the first size larger than or equal to the provided size
	 * @param {Number} size
	 * @ignore.
	 */
	function findSizeBucket( size ) {
		var i = 0;
		while ( size > sizeBuckets[i] && i < sizeBuckets.length - 1 ) {
			++i;
		}
		return sizeBuckets[i];
	}

	/**
	 * API for retrieving image thumbnails for a given page
	 * @class ImageGateway
	 * @cfg {Object} options
	 * @cfg {mw.Api} options.api
	 */
	function ImageGateway( options ) {
		this._cache = {};
		this.api = options.api;
	}
	ImageGateway.prototype = {
		/**
		 * Get thumbnail via the API and cache it. Return the result from the cache if exists.
		 * @param {String} title Url of image
		 * @returns {jQuery.Deferred} with the image info
		 */
		getThumb: function ( title ) {
			var result = this._cache[title],
				imageSizeMultiplier = ( window.devicePixelRatio && window.devicePixelRatio > 1 ) ? window.devicePixelRatio : 1;

			if ( !result ) {
				this._cache[title] = result = $.Deferred();

				this.api.get( {
					action: 'query',
					prop: 'imageinfo',
					titles: title,
					formatversion: 2,
					iiprop: [ 'url', 'extmetadata' ],
					// request an image devicePixelRatio times bigger than the reported screen size
					// for retina displays and zooming
					iiurlwidth: findSizeBucket( $( window ).width() * imageSizeMultiplier ),
					iiurlheight: findSizeBucket( $( window ).height() * imageSizeMultiplier )
				} ).done( function ( resp ) {
					if ( resp.query && resp.query.pages ) {
						result.resolve( resp.query.pages[0].imageinfo[0] );
					}
				} );
			}

			return result;
		}
	};

	ImageGateway._findSizeBucket = findSizeBucket;
	M.define( 'mobile.mediaViewer/ImageGateway', ImageGateway );

}( mw.mobileFrontend, jQuery ) );
