( function( M, $ ) {
	var sizeBuckets = [320, 640, 800, 1024, 1280, 1920, 2560, 2880],
		ImageApi,
		Api = M.require( 'api' ).Api;

	/**
	 * Gets the first size larger than or equal to the provided size.
	 */
	function findSizeBucket( size ) {
		var i = 0;
		while ( size > sizeBuckets[i] && i < sizeBuckets.length - 1 ) {
			++i;
		}
		return sizeBuckets[i];
	}

	/**
	 * @class ImageApi
	 * @extends Api
	 */
	ImageApi = Api.extend( {
		initialize: function() {
			this._super();
			this._cache = {};
		},

		getThumb: function( title ) {
			var result = this._cache[title];

			if ( !result ) {
				this._cache[title] = result = $.Deferred();

				this.get( {
					action: 'query',
					prop: 'imageinfo',
					titles: title,
					iiprop: ['url', 'extmetadata'],
					// request an image two times bigger than the reported screen size
					// for retina displays and zooming
					iiurlwidth: findSizeBucket( $( window ).width() * 2 ),
					iiurlheight: findSizeBucket( $( window ).height() * 2 )
				} ).done( function( resp ) {
					if ( resp.query && resp.query.pages ) {
						// FIXME: API
						var data = $.map( resp.query.pages, function( v ) { return v; } )[0].imageinfo[0];
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
