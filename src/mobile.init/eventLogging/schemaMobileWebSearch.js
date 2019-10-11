module.exports = function () {
	( function () {
		var // Schema class provided by ext.eventLogging
			Schema = mw.eventLog.Schema,
			/**
			 * MobileWebSearch schema
			 * https://meta.wikimedia.org/wiki/Schema:MobileWebSearch
			 */
			schemaMobileWebSearch = new Schema(
				'MobileWebSearch',
				// todo: use a default value of 0 once config lands in production.
				mw.config.get( 'wgMFSchemaSearchSampleRate', 1 / 1000 ),
				/**
				 * @property {Object} defaults Default options hash.
				 * @property {string} defaults.platform Always "mobileweb"
				 * @property {string} defaults.platformVersion The version of MobileFrontend
				 *  that the user is using. One of "stable" or "beta"
				 */
				{
					platform: 'mobileweb',
					platformVersion: mw.config.get( 'wgMFMode' )
				}
			);

		mw.trackSubscribe( 'mf.schemaMobileWebSearch', function ( topic, data ) {
			schemaMobileWebSearch.log( data );
		} );
	}() );
};
