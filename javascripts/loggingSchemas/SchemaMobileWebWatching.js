( function ( M, $ ) {
	var SchemaMobileWebWatching,
		user = M.require( 'user' ),
		SchemaMobileWeb = M.require( 'loggingSchemas/SchemaMobileWeb' );

	/**
	 * @class SchemaMobileWebWatching
	 * @extends Schema
	 */
	SchemaMobileWebWatching = SchemaMobileWeb.extend( {
		/** @inheritdoc **/
		name: 'MobileWebWatching',
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Number} defaults.userId The id of the user performing the action
		 * @cfg {Boolean} defaults.isWatched whether the page is currently watched or not
		 * @cfg {String} defaults.funnel the funnel from which the user is watching
		 */
		defaults: $.extend( {}, SchemaMobileWeb.prototype.defaults, {
			userId: mw.user.getId(),
			isWatched: undefined,
			funnel: undefined,
			userEditCount: user.getEditCount()
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebWatching', SchemaMobileWebWatching );

} )( mw.mobileFrontend, jQuery );
