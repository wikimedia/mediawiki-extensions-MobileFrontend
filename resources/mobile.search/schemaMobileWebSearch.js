mw.loader.using( [
	'ext.eventLogging.subscriber'
] ).then( function () {
	var M = mw.mobileFrontend,
		context = M.require( 'mobile.startup/context' ),
		// Schema provided by ext.eventLogging.subscriber class
		Schema = mw.eventLog.Schema, // resource-modules-disable-line
		/**
		 * MobileWebSearch schema
		 * https://meta.wikimedia.org/wiki/Schema:MobileWebSearch
		 */
		schemaMobileWebSearch = new Schema(
			'MobileWebSearch',
			// Sampled at 0.1% (consistent with the Desktop search rate)
			1 / 1000,
			/**
			 * @property {Object} defaults Default options hash.
			 * @property {string} defaults.platform Always "mobileweb"
			 * @property {string} defaults.platformVersion The version of MobileFrontend
			 *  that the user is using. One of "stable" or "beta"
			 */
			{
				platform: 'mobileweb',
				platformVersion: context.getMode()
			}
		);

	mw.trackSubscribe( 'mf.schemaMobileWebSearch', function ( topic, data ) {
		schemaMobileWebSearch.log( data );
	} );

} );
