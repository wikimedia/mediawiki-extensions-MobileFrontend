( function ( M, $ ) {
	var sizeBuckets = [ 320, 640, 800, 1024, 1280, 1920, 2560, 2880 ],
		ImageApi,
		Api = M.require( 'api' ).Api;

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
	 * @class ImageApi
	 * @extends Api
	 */
	ImageApi = Api.extend( {
		/** @inheritdoc */
		initialize: function () {
			Api.prototype.initialize.apply( this, arguments );
			this._cache = {};
		},

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

				this.get( {
					action: 'query',
					prop: 'imageinfo',
					titles: title,
					iiprop: [ 'url', 'extmetadata' ],
					// request an image devicePixelRatio times bigger than the reported screen size
					// for retina displays and zooming
					iiurlwidth: findSizeBucket( $( window ).width() * imageSizeMultiplier ),
					iiurlheight: findSizeBucket( $( window ).height() * imageSizeMultiplier )
				} ).done( function ( resp ) {
					if ( resp.query && resp.query.pages ) {
						// FIXME: API
						var data = $.map( resp.query.pages, function ( v ) {
							return v;
						} )[0].imageinfo[0];
						result.resolve( data );
					}
				} );
			}

			return result;
		}
	} );

	M.define( 'modules/mediaViewer', {
		_findSizeBucket: findSizeBucket
	} );
	M.define( 'modules/mediaViewer/ImageApi', ImageApi );

}( mw.mobileFrontend, jQuery ) );
