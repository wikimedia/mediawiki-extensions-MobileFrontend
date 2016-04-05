( function ( M ) {
	var user = M.require( 'mobile.user/user' ),
		context = M.require( 'mobile.context/context' ),
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
			 * @cfg {String} defaults.mobileMode whether user is in stable or beta
			 * @cfg {String|undefined} defaults.username Username if the user is logged in, otherwise -
			 *  undefined. Assigning undefined will make event logger omit this property when sending
			 *  the data to a server. According to the schema username is optional.
			 * @cfg {Number|undefined} defaults.userEditCount The number of edits the user has made
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
} )( mw.mobileFrontend );
