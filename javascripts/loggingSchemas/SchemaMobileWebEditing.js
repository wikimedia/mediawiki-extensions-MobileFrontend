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
		/** @inheritdoc **/
		defaults: $.extend( {}, Schema.prototype.defaults, {
			pageId: mw.config.get( 'wgArticleId' ),
			token: Schema.getSessionId(),
			revId: mw.config.get( 'wgRevisionId' ),
			namespace: mw.config.get( 'wgNamespaceNumber' ),
			isTestA: M.isTestA,
			// FIXME: Introduce a SchemaWithUser class that has username and userEditCount
			username: user.getName() || undefined,
			userEditCount: typeof user.getEditCount() === 'number' ? user.getEditCount() : undefined
		} )
	} );

	M.define( 'loggingSchemas/SchemaMobileWebEditing', SchemaMobileWebEditing );

} )( mw.mobileFrontend, jQuery );
