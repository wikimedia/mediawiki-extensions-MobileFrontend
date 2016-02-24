( function ( M ) {
	var context = M.require( 'mobile.context/context' ),
		/*
		 * MobileWebSearch schema
		 * https://meta.wikimedia.org/wiki/Schema:MobileWebSearch
		 */
		schemaMobileWebSearch = new mw.eventLog.Schema(
			'MobileWebSearch',
			// Sampled at 0.1% (consistent with the Desktop search rate)
			1 / 1000,
			/**
			 * @cfg {Object} defaults The options hash.
			 * @cfg {String} defaults.platform Always "mobileweb"
			 * @cfg {String} defaults.platformVersion The version of MobileFrontend
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

}( mw.mobileFrontend ) );
