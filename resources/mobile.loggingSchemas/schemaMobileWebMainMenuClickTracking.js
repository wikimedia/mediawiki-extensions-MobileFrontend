( function ( M ) {
	var user = M.require( 'mobile.startup/user' ),
		context = M.require( 'mobile.startup/context' ),
		/**
		 * MobileWebMainMenuClickTracking schema
		 * https://meta.wikimedia.org/wiki/Schema:MobileWebMainMenuClickTracking
		 *
		 * @class MobileWebMainMenuClickTracking
		 * @singleton
		 */
		schemaMobileWebMainMenuClickTracking = new mw.eventLog.Schema(
			'MobileWebMainMenuClickTracking',
			0.5,
			/**
			 * @cfg {Object} defaults Default options hash
			 * @cfg {string} defaults.mobileMode whether user is in stable or beta
			 * @cfg {string} [defaults.username] Username if the user is logged in, otherwise -
			 *  undefined. Assigning undefined will make event logger omit this property when sending
			 *  the data to a server. According to the schema username is optional.
			 * @cfg {number} [defaults.userEditCount] The number of edits the user has made
			 *  if the user is logged in, otherwise - undefined. Assigning undefined will make event
			 *  logger omit this property when sending the data to a server. According to the schema
			 *  userEditCount is optional.
			 */
			{
				mobileMode: context.getMode(),
				username: user.getName() || undefined,
				userEditCount: typeof user.getEditCount() === 'number' ? user.getEditCount() : undefined
			}
		);

	mw.trackSubscribe( 'mf.schemaMobileWebMainMenuClickTracking', function ( topic, data ) {
		schemaMobileWebMainMenuClickTracking.log( data );
	} );
}( mw.mobileFrontend ) );
