( function ( M, $ ) {
	var SchemaMobileWebUploads,
		user = M.require( 'user' ),
		page = M.getCurrentPage(),
		Schema = M.require( 'Schema' );

	/**
	 * @class SchemaMobileWebUploads
	 * @extends Schema
	 */
	SchemaMobileWebUploads = Schema.extend( {
		/** @inheritdoc **/
		name: 'MobileWebUploads',
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Number} defaults.pageId The value of the wgArticleId config variable
		 * @cfg {String} defaults.token Unique session ID for the user
		 * @cfg {String} defaults.funnel Identifier for the upload funnel
		 * @cfg {String|undefined} defaults.username Username if the user is logged in, otherwise -
		 * undefined. Assigning undefined will make event logger omit this property when sending
		 * the data to a server. According to the schema username is optional.
		 * @cfg {Boolean} defaults.isLoggedIn Whether the user is logged in
		 * @cfg {Boolean} defaults.isEditable True, if the user is able to edit the current page, false otherwise
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			pageId: mw.config.get( 'wgArticleId' ),
			token: user.getSessionId(),
			funnel: 'unknown',
			// FIXME: Introduce a SchemaWithUser class and rethink the data recorded that follows
			username: user.getName() || undefined,
			isEditable: page.isEditable( user )
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebUploads', SchemaMobileWebUploads );

}( mw.mobileFrontend, jQuery ) );
