const sizeBuckets = [ 320, 640, 800, 1024, 1280, 1920, 2560, 2880 ],
	actionParams = require( './../mobile.startup/actionParams' ),
	util = require( './../mobile.startup/util' );

/**
 * API for retrieving image thumbnails for a given page
 */
class ImageGateway {
	/**
	 * @param {Object} options Configuration options
	 * @param {mw.Api} options.api
	 * @private
	 */
	constructor( options ) {
		this._cache = {};
		this.api = options.api;
	}

	/**
	 * Get thumbnail via the API and cache it. Return the result from the cache if exists.
	 *
	 * @param {string} title Url of image
	 * @return {jQuery.Deferred} with the image info
	 */
	getThumb( title ) {
		const cachedThumb = this._cache[title],
			$window = util.getWindow(),
			imageSizeMultiplier = ( window.devicePixelRatio && window.devicePixelRatio > 1 ) ?
				window.devicePixelRatio : 1;

		if ( !cachedThumb ) {
			this._cache[title] = this.api.get( actionParams( {
				prop: 'imageinfo',
				titles: title,
				iiprop: [ 'url', 'extmetadata' ],
				// request an image devicePixelRatio times bigger than the reported screen size
				// for retina displays and zooming
				iiurlwidth: ImageGateway.findSizeBucket( $window.width() * imageSizeMultiplier ),
				iiurlheight: ImageGateway.findSizeBucket( $window.height() * imageSizeMultiplier )
			} ) ).then( ( resp ) => {
				// imageinfo is undefined for missing pages.
				if ( resp.query && resp.query.pages &&
					resp.query.pages[0] && resp.query.pages[0].imageinfo ) {
					return resp.query.pages[0].imageinfo[0];
				}
				throw new Error( 'The API failed to return any pages matching the titles.' );
			} );
		}

		return this._cache[title];
	}

	/**
	 * Gets the first size larger than or equal to the provided size
	 *
	 * @param {number} size
	 * @return {number}
	 */
	static findSizeBucket( size ) {
		let i = 0;
		while ( size > sizeBuckets[i] && i < sizeBuckets.length - 1 ) {
			++i;
		}
		return sizeBuckets[i];
	}
}

module.exports = ImageGateway;
