( function ( M, $ ) {
	var SchemaMobileWebEditing,
		user = M.require( 'user' ),
		Schema = M.require( 'Schema' );

	/**
	 * @class SchemaMobileWebEditing
	 * @extends Schema
	 */
	SchemaMobileWebEditing = Schema.extend( {
		/** @inheritdoc **/
		name: 'MobileWebEditing',
		/**
		 * @inheritdoc
		 *
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Number} defaults.pageId The value of the wgArticleId config variable
		 * @cfg {String} defaults.token Unique session ID for the user
		 * @cfg {Number} defaults.revId The value of the wgRevisionId config variable
		 * @cfg {Number} defaults.namespace The value of the wgNamespaceNumber config variable
		 * @cfg {Boolean} defaults.isTestA Whether this is the A test in A/B test
		 * @cfg {String|undefined} defaults.username Username if the user is logged in, otherwise -
		 * undefined. Assigning undefined will make event logger omit this property when sending
		 * the data to a server. According to the schema username is optional.
		 * @cfg {Number|undefined} defaults.userEditCount The number of edits the user has made
		 * if the user is logged in, otherwise - undefined. Assigning undefined will make event
		 * logger omit this property when sending the data to a server. According to the schema
		 * userEditCount is optional.
		 */
		defaults: $.extend( {}, Schema.prototype.defaults, {
			pageId: mw.config.get( 'wgArticleId' ),
			token: user.getSessionId(),
			revId: mw.config.get( 'wgRevisionId' ),
			namespace: mw.config.get( 'wgNamespaceNumber' ),
			isTestA: user.inUserBucketA(),
			// FIXME: Introduce a SchemaWithUser class that has username and userEditCount
			username: user.getName() || undefined,
			userEditCount: typeof user.getEditCount() === 'number' ? user.getEditCount() : undefined
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebEditing', SchemaMobileWebEditing );

} )( mw.mobileFrontend, jQuery );
