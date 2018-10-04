/**
 * This module is loaded by resources/skins.minerva.mainMenu/MainMenu.js
 * inside the Minerva skin. It should be moved to Minerva at our earliest possible
 * convenience.
 */
mw.loader.using( [
	'ext.eventLogging.subscriber'
] ).then( function () {
	var M = mw.mobileFrontend,
		user = M.require( 'mobile.startup/user' ),
		// Schema provided by ext.eventLogging.subscriber class
		Schema = mw.eventLog.Schema, // resource-modules-disable-line
		context = M.require( 'mobile.startup/context' ),
		/**
		 * MobileWebMainMenuClickTracking schema
		 * https://meta.wikimedia.org/wiki/Schema:MobileWebMainMenuClickTracking
		 *
		 * @class MobileWebMainMenuClickTracking
		 * @singleton
		 */
		schemaMobileWebMainMenuClickTracking = new Schema(
			'MobileWebMainMenuClickTracking',
			// todo: use a default value of 0 once config lands in production (T205008).
			mw.config.get( 'wgMinervaSchemaMainMenuClickTrackingSampleRate', 0.5 ),
			/**
			 * @property {Object} defaults Default options hash.
			 * @property {string} defaults.mobileMode whether user is in stable or beta
			 * @property {string} [defaults.username] Username if the user is logged in,
			 *  otherwise - undefined.
			 *  Assigning undefined will make event logger omit this property when sending
			 *  the data to a server. According to the schema username is optional.
			 * @property {number} [defaults.userEditCount] The number of edits the user has made
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
} );
